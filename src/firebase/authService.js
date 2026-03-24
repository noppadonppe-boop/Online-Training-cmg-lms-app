import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, runTransaction,
  collection, serverTimestamp, addDoc,
} from 'firebase/firestore';
import { auth, db, ROOT_COLLECTION, ROOT_DOCUMENT } from './config';

export const ALL_ROLES = [
  'Requestor', 'HRM', 'GM', 'MD', 'Staff',
  'MasterAdmin', 'Viewer', 'Creator',
];

const googleProvider = new GoogleAuthProvider();

// ── Firestore path helpers ────────────────────────────────────────────────────
const usersCol = () =>
  collection(db, ROOT_COLLECTION, ROOT_DOCUMENT, 'users');
const userDoc = (uid) =>
  doc(db, ROOT_COLLECTION, ROOT_DOCUMENT, 'users', uid);
const appMetaDoc = () =>
  doc(db, ROOT_COLLECTION, ROOT_DOCUMENT, 'appMeta', 'config');
const activityCol = () =>
  collection(db, ROOT_COLLECTION, ROOT_DOCUMENT, 'activityLogs');

// ── Activity logging (non-blocking) ──────────────────────────────────────────
export const logActivity = (type, uid, email) => {
  addDoc(activityCol(), {
    type,
    uid,
    email,
    createdAt: serverTimestamp(),
  }).catch(() => {});
};

// ── Fetch user profile from Firestore ────────────────────────────────────────
export const fetchProfile = async (uid) => {
  try {
    const snap = await getDoc(userDoc(uid));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
};

// ── Create new user profile (detects first user via transaction) ──────────────
export const createUserProfile = async (uid, { email, firstName, lastName, position, photoURL = null }) => {
  const metaRef = appMetaDoc();
  const userRef = userDoc(uid);

  return runTransaction(db, async (tx) => {
    const metaSnap = await tx.get(metaRef);
    const isFirst = !metaSnap.exists() || !metaSnap.data().firstUserRegistered;

    const profile = {
      uid,
      email,
      firstName,
      lastName,
      position: position || '',
      roles: isFirst ? ['MasterAdmin'] : ['Staff'],
      status: isFirst ? 'approved' : 'pending',
      assignedProjects: [],
      createdAt: serverTimestamp(),
      photoURL,
      isFirstUser: isFirst,
    };

    tx.set(userRef, profile);

    if (isFirst) {
      tx.set(metaRef, {
        firstUserRegistered: true,
        totalUsers: 1,
        createdAt: serverTimestamp(),
      });
    } else {
      tx.set(
        metaRef,
        {
          firstUserRegistered: true,
          totalUsers: (metaSnap.data()?.totalUsers || 0) + 1,
        },
        { merge: true }
      );
    }

    return profile;
  });
};

// ── Email / Password login ────────────────────────────────────────────────────
export const loginWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await fetchProfile(cred.user.uid);
  logActivity('LOGIN', cred.user.uid, email);
  return { firebaseUser: cred.user, profile };
};

// ── Email / Password registration ────────────────────────────────────────────
export const registerWithEmail = async (email, password, firstName, lastName, position) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const profile = await createUserProfile(cred.user.uid, {
    email,
    firstName,
    lastName,
    position,
  });
  logActivity('REGISTER', cred.user.uid, email);
  return { firebaseUser: cred.user, profile };
};

// ── Google Sign-In ────────────────────────────────────────────────────────────
export const loginWithGoogle = async () => {
  const cred = await signInWithPopup(auth, googleProvider);
  const user = cred.user;
  let profile = await fetchProfile(user.uid);

  if (!profile) {
    const nameParts = (user.displayName || '').split(' ');
    profile = await createUserProfile(user.uid, {
      email: user.email,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      position: '',
      photoURL: user.photoURL,
    });
    logActivity('REGISTER', user.uid, user.email);
  } else {
    // Keep photoURL fresh from Google
    if (user.photoURL && profile.photoURL !== user.photoURL) {
      updateDoc(userDoc(user.uid), { photoURL: user.photoURL }).catch(() => {});
      profile = { ...profile, photoURL: user.photoURL };
    }
    logActivity('LOGIN', user.uid, user.email);
  }

  return { firebaseUser: user, profile };
};

// ── Update user profile ───────────────────────────────────────────────────────
export const updateUserProfile = async (uid, data) => {
  await updateDoc(userDoc(uid), data);
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = () => signOut(auth);
