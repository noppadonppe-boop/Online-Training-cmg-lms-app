import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireApproved = true, requireRoles = null }) {
  const { firebaseUser, userProfile, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading || (firebaseUser && !userProfile)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireApproved && userProfile?.status === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  if (requireApproved && userProfile?.status === 'rejected') {
    return <Navigate to="/login" replace />;
  }

  if (requireRoles && requireRoles.length > 0) {
    const userRoles = userProfile?.roles || [];
    const hasRole = requireRoles.some((r) => userRoles.includes(r));
    if (!hasRole) return <Navigate to="/" replace />;
  }

  return children;
}
