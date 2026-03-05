import { createContext, useContext, useState, useEffect } from 'react';
import { users as mockUsers } from '../data/mockData';
import { seedFirestore } from '../firebase/seed';
import {
  fetchUsers,
  fetchRfts,
  fetchCourses,
  fetchEnrollments,
  addRft,
  updateRft as dbUpdateRft,
  addCourse as dbAddCourse,
  updateCourse as dbUpdateCourse,
  addEnrollment,
  updateEnrollment as dbUpdateEnrollment,
} from '../firebase/db';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [rfts, setRfts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await seedFirestore();

        const [dbUsers, dbRfts, dbCourses, dbEnrollments] = await Promise.all([
          fetchUsers(),
          fetchRfts(),
          fetchCourses(),
          fetchEnrollments(),
        ]);

        // Restore user order from mockData to keep consistent ordering
        const orderedUsers = mockUsers.map((mu) => {
          const found = dbUsers.find((u) => u.id === mu.id);
          return found ? found : mu;
        });

        setUsers(orderedUsers);
        setCurrentUser(orderedUsers[0]);

        // Sort rfts and courses by id for consistent display
        setRfts(dbRfts.sort((a, b) => a.id.localeCompare(b.id)));
        setCourses(dbCourses.sort((a, b) => a.id.localeCompare(b.id)));
        setEnrollments(dbEnrollments);
      } catch (err) {
        console.error('[AppContext] Failed to load data from Firestore:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const switchUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const submitRft = async (rftData) => {
    const newRft = {
      ...rftData,
      id: `rft${Date.now()}`,
      requestorId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending HRM',
      rejectNote: '',
    };
    await addRft(newRft);
    setRfts((prev) => [...prev, newRft]);
    return newRft;
  };

  const updateRftStatus = async (rftId, status, rejectNote = '') => {
    await dbUpdateRft(rftId, { status, rejectNote });
    setRfts((prev) =>
      prev.map((r) => (r.id === rftId ? { ...r, status, rejectNote } : r))
    );
  };

  const createCourse = async (courseData) => {
    const newCourse = { ...courseData, id: `c${Date.now()}` };
    await dbAddCourse(newCourse);
    setCourses((prev) => [...prev, newCourse]);
    return newCourse;
  };

  const updateCourse = async (courseId, courseData) => {
    await dbUpdateCourse(courseId, courseData);
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...courseData } : c))
    );
  };

  const enrollStaff = async (courseId, staffId) => {
    const existing = enrollments.find(
      (e) => e.courseId === courseId && e.staffId === staffId
    );
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
    await addEnrollment(newEnrollment);
    setEnrollments((prev) => [...prev, newEnrollment]);
    return newEnrollment;
  };

  const updateEnrollment = async (enrollmentId, data) => {
    await dbUpdateEnrollment(enrollmentId, data);
    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollmentId ? { ...e, ...data } : e))
    );
  };

  const getEnrollment = (courseId, staffId) => {
    return (
      enrollments.find(
        (e) => e.courseId === courseId && e.staffId === staffId
      ) || null
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
          <p className="text-red-600 font-semibold text-lg mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
