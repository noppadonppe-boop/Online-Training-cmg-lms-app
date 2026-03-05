import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, ROOT_COLLECTION, ROOT_DOCUMENT } from './config';
import { users, rfts, courses, enrollments } from '../data/mockData';

/**
 * Seeds all mock data into Firestore under:
 *   cmg-lms-app (Collection)
 *     └── root (Document)
 *           ├── users       (Sub-collection)
 *           ├── rfts        (Sub-collection)
 *           ├── courses     (Sub-collection)
 *           └── enrollments (Sub-collection)
 *
 * Only runs if the root document does not already have a seeded flag,
 * preventing duplicate seeding on subsequent app loads.
 */
export const seedFirestore = async () => {
  const rootRef = doc(db, ROOT_COLLECTION, ROOT_DOCUMENT);
  const rootSnap = await getDoc(rootRef);

  if (rootSnap.exists() && rootSnap.data()?.seeded) {
    console.log('[Firestore] Data already seeded. Skipping.');
    return false;
  }

  console.log('[Firestore] Seeding mock data...');

  const subCol = (name) =>
    (id) => doc(db, ROOT_COLLECTION, ROOT_DOCUMENT, name, id);

  // ── users ──────────────────────────────────────────────────────────────
  for (const user of users) {
    const { id, ...data } = user;
    await setDoc(subCol('users')(id), data);
  }

  // ── rfts ───────────────────────────────────────────────────────────────
  for (const rft of rfts) {
    const { id, ...data } = rft;
    await setDoc(subCol('rfts')(id), data);
  }

  // ── courses ────────────────────────────────────────────────────────────
  for (const course of courses) {
    const { id, ...data } = course;
    await setDoc(subCol('courses')(id), data);
  }

  // ── enrollments ────────────────────────────────────────────────────────
  for (const enrollment of enrollments) {
    const { id, ...data } = enrollment;
    await setDoc(subCol('enrollments')(id), data);
  }

  // Mark root document as seeded
  await setDoc(rootRef, {
    seeded: true,
    seededAt: new Date().toISOString(),
    description: 'CMG LMS App — root document',
    subcollections: ['users', 'rfts', 'courses', 'enrollments'],
  });

  console.log('[Firestore] Seeding complete.');
  return true;
};
