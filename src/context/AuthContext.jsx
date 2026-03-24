import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, doc, collection } from 'firebase/firestore';
import { auth, db, ROOT_COLLECTION, ROOT_DOCUMENT } from '../firebase/config';
import {
  loginWithEmail as svcLoginEmail,
  loginWithGoogle as svcLoginGoogle,
  registerWithEmail as svcRegister,
  updateUserProfile as svcUpdateProfile,
  fetchProfile,
  logout as svcLogout,
} from '../firebase/authService';

const AuthContext = createContext(null);

const usersCol = () => collection(db, ROOT_COLLECTION, ROOT_DOCUMENT, 'users');
const userDoc = (uid) => doc(db, ROOT_COLLECTION, ROOT_DOCUMENT, 'users', uid);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [userProfile, setUserProfile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  // Real-time listener for all users (needed for admin panel + pending count)
  useEffect(() => {
    const unsub = onSnapshot(usersCol(), (snap) => {
      setAllUsers(snap.docs.map((d) => d.data()));
    }, () => {});
    return unsub;
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile = await fetchProfile(fbUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Real-time profile sync for the signed-in user
  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = onSnapshot(userDoc(firebaseUser.uid), (snap) => {
      if (snap.exists()) setUserProfile(snap.data());
    }, () => {});
    return unsub;
  }, [firebaseUser]);

  const refreshProfile = useCallback(async () => {
    if (!firebaseUser) return;
    const profile = await fetchProfile(firebaseUser.uid);
    if (profile) setUserProfile(profile);
  }, [firebaseUser]);

  const loginWithEmail = async (email, password) => {
    const { firebaseUser: fbUser, profile } = await svcLoginEmail(email, password);
    setFirebaseUser(fbUser);
    setUserProfile(profile);
    return profile;
  };

  const loginWithGoogle = async () => {
    const { firebaseUser: fbUser, profile } = await svcLoginGoogle();
    setFirebaseUser(fbUser);
    setUserProfile(profile);
    return profile;
  };

  const registerWithEmail = async (email, password, firstName, lastName, position) => {
    const { firebaseUser: fbUser, profile } = await svcRegister(email, password, firstName, lastName, position);
    setFirebaseUser(fbUser);
    setUserProfile(profile);
    return profile;
  };

  const updateProfile = async (data) => {
    if (!firebaseUser) return;
    await svcUpdateProfile(firebaseUser.uid, data);
    // onSnapshot will update userProfile automatically
  };

  const updateAnyUser = async (uid, data) => {
    await svcUpdateProfile(uid, data);
    // onSnapshot on allUsers will auto-update
  };

  const logout = async () => {
    await svcLogout();
    setFirebaseUser(null);
    setUserProfile(null);
  };

  const pendingCount = allUsers.filter((u) => u.status === 'pending').length;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        allUsers,
        authLoading,
        pendingCount,
        loginWithEmail,
        loginWithGoogle,
        registerWithEmail,
        refreshProfile,
        updateProfile,
        updateAnyUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
