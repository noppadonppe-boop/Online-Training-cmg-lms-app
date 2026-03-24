import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, LayoutDashboard, FileText, GraduationCap, HelpCircle,
  Users, LogOut, Edit2, ChevronDown, Save, Briefcase,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../data/mockData';

function ProfileEditDropdown({ onClose }) {
  const { userProfile, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    position: userProfile?.position || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
      {/* Profile header */}
      <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="flex items-center gap-3">
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white/50" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
              {(userProfile?.firstName?.[0] || '') + (userProfile?.lastName?.[0] || '')}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">{userProfile?.firstName} {userProfile?.lastName}</p>
            <p className="text-blue-200 text-xs truncate">{userProfile?.email}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(userProfile?.roles || []).map(r => (
                <span key={r} className="px-1.5 py-0.5 bg-white/20 text-white text-xs rounded font-medium">{r}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <Edit2 className="w-3.5 h-3.5" /> แก้ไขโปรไฟล์
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1 block">ชื่อ</label>
            <input
              type="text" value={form.firstName}
              onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1 block">นามสกุล</label>
            <input
              type="text" value={form.lastName}
              onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block flex items-center gap-1"><Briefcase className="w-3 h-3" /> ตำแหน่ง</label>
          <input
            type="text" value={form.position}
            onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
            placeholder="ตำแหน่งงาน"
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? '✓ บันทึกแล้ว' : saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>

      <div className="border-t border-slate-100 p-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { currentUser } = useApp();
  const { userProfile, pendingCount } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const userRoles = userProfile?.roles || (currentUser?.role ? [currentUser.role] : []);
  const isMasterAdmin = userRoles.includes('MasterAdmin');

  const hasRole = (roles) => roles.some(r => userRoles.includes(r));

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: [ROLES.REQUESTOR, ROLES.HRM, ROLES.GM, ROLES.MD, 'MasterAdmin', 'Viewer', 'Creator'] },
    { to: '/rft', label: 'RFT', icon: FileText, roles: [ROLES.REQUESTOR, ROLES.HRM, ROLES.GM, 'MasterAdmin'] },
    { to: '/courses', label: 'Courses', icon: BookOpen, roles: [ROLES.REQUESTOR, ROLES.HRM, ROLES.GM, ROLES.MD, 'MasterAdmin', 'Creator'] },
    { to: '/learn', label: 'My Learning', icon: GraduationCap, roles: [ROLES.STAFF] },
  ];

  const visibleLinks = navLinks.filter(l => hasRole(l.roles));

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const displayName = userProfile
    ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
    : currentUser?.name || '';

  const displayRole = userProfile
    ? (userProfile.roles || []).join(', ')
    : currentUser?.role || '';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-800">CMG</span>
              <span className="text-base font-semibold text-blue-600 ml-1">LMS</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(to)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            {/* User Management — MasterAdmin only */}
            {isMasterAdmin && (
              <Link
                to="/users"
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/users')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                จัดการผู้ใช้
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              to="/manual"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/manual')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </Link>

            {/* Profile button */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all"
              >
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {(userProfile?.firstName?.[0] || currentUser?.avatar?.[0] || '?')}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight max-w-[100px] truncate">{displayName.split(' ')[0] || 'User'}</p>
                  <p className="text-xs text-slate-500 max-w-[100px] truncate">{displayRole}</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <ProfileEditDropdown onClose={() => setProfileOpen(false)} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-slate-100 px-4 py-2 flex gap-1 overflow-x-auto">
        {visibleLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              isActive(to) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Link>
        ))}
        {isMasterAdmin && (
          <Link
            to="/users"
            className={`relative flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              isActive('/users') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            ผู้ใช้
            {pendingCount > 0 && (
              <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1">{pendingCount}</span>
            )}
          </Link>
        )}
      </div>
    </nav>
  );
}
