import { Clock, LogOut, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PendingApprovalPage() {
  const { userProfile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 mb-6">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">รอการอนุมัติ</h1>
        <p className="text-slate-500 mb-2">
          บัญชีของคุณ <span className="font-semibold text-slate-700">
            {userProfile?.firstName} {userProfile?.lastName}
          </span> กำลังรอการอนุมัติจากผู้ดูแลระบบ
        </p>
        <p className="text-slate-400 text-sm mb-8">
          กรุณาติดต่อผู้ดูแลระบบ (MasterAdmin) เพื่ออนุมัติสิทธิ์การเข้าใช้งาน
        </p>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{userProfile?.firstName} {userProfile?.lastName}</p>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Mail className="w-3 h-3" />
                {userProfile?.email}
              </div>
            </div>
            <span className="ml-auto px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
              Pending
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 mx-auto px-6 py-2.5 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
