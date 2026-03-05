import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, ROOT_COLLECTION, ROOT_DOCUMENT } from './config';

/**
 * Returns a reference to a sub-collection under cmg-lms-app/root/{subcollection}
 * Structure: cmg-lms-app > root > {subcollection}
 */
const subCol = (subcollection) =>
  collection(db, ROOT_COLLECTION, ROOT_DOCUMENT, subcollection);

// ─── Users ───────────────────────────────────────────────────────────────────

export const fetchUsers = async () => {
  const snap = await getDocs(subCol('users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── RFTs ────────────────────────────────────────────────────────────────────

export const fetchRfts = async () => {
  const snap = await getDocs(subCol('rfts'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addRft = async (rftData) => {
  const { id, ...data } = rftData;
  await setDoc(doc(subCol('rfts'), id), data);
  return rftData;
};

export const updateRft = async (rftId, data) => {
  await updateDoc(doc(subCol('rfts'), rftId), data);
};

// ─── Courses ─────────────────────────────────────────────────────────────────

export const fetchCourses = async () => {
  const snap = await getDocs(subCol('courses'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addCourse = async (courseData) => {
  const { id, ...data } = courseData;
  await setDoc(doc(subCol('courses'), id), data);
  return courseData;
};

export const updateCourse = async (courseId, data) => {
  await updateDoc(doc(subCol('courses'), courseId), data);
};

// ─── Enrollments ─────────────────────────────────────────────────────────────

export const fetchEnrollments = async () => {
  const snap = await getDocs(subCol('enrollments'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addEnrollment = async (enrollmentData) => {
  const { id, ...data } = enrollmentData;
  await setDoc(doc(subCol('enrollments'), id), data);
  return enrollmentData;
};

export const updateEnrollment = async (enrollmentId, data) => {
  await updateDoc(doc(subCol('enrollments'), enrollmentId), data);
};
