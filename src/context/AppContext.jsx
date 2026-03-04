import { createContext, useContext, useState } from 'react';
import { users, rfts as initialRfts, courses as initialCourses, enrollments as initialEnrollments } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(users[0]);
  const [rfts, setRfts] = useState(initialRfts);
  const [courses, setCourses] = useState(initialCourses);
  const [enrollments, setEnrollments] = useState(initialEnrollments);

  const switchUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const submitRft = (rftData) => {
    const newRft = {
      ...rftData,
      id: `rft${Date.now()}`,
      requestorId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending HRM',
      rejectNote: '',
    };
    setRfts(prev => [...prev, newRft]);
    return newRft;
  };

  const updateRftStatus = (rftId, status, rejectNote = '') => {
    setRfts(prev => prev.map(r => r.id === rftId ? { ...r, status, rejectNote } : r));
  };

  const createCourse = (courseData) => {
    const newCourse = { ...courseData, id: `c${Date.now()}` };
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  };

  const updateCourse = (courseId, courseData) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...courseData } : c));
  };

  const enrollStaff = (courseId, staffId) => {
    const existing = enrollments.find(e => e.courseId === courseId && e.staffId === staffId);
    if (existing) return existing;
    const newEnrollment = {
      id: `e${Date.now()}`,
      courseId,
      staffId,
      status: 'Not Started',
      preTestScore: null,
      postTestScore: null,
      preTestAnswers: {},
      postTestAnswers: {},
    };
    setEnrollments(prev => [...prev, newEnrollment]);
    return newEnrollment;
  };

  const updateEnrollment = (enrollmentId, data) => {
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, ...data } : e));
  };

  const getEnrollment = (courseId, staffId) => {
    return enrollments.find(e => e.courseId === courseId && e.staffId === staffId) || null;
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      switchUser,
      users,
      rfts,
      courses,
      enrollments,
      submitRft,
      updateRftStatus,
      createCourse,
      updateCourse,
      enrollStaff,
      updateEnrollment,
      getEnrollment,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
