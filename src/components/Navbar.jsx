import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LayoutDashboard, FileText, GraduationCap, HelpCircle, ChevronDown, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { users, ROLES } from '../data/mockData';

const roleColors = {
  [ROLES.REQUESTOR]: 'bg-blue-100 text-blue-700',
  [ROLES.HRM]: 'bg-purple-100 text-purple-700',
  [ROLES.GM]: 'bg-amber-100 text-amber-700',
  [ROLES.MD]: 'bg-rose-100 text-rose-700',
  [ROLES.STAFF]: 'bg-emerald-100 text-emerald-700',
};

export default function Navbar() {
  const { currentUser, switchUser } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: [ROLES.REQUESTOR, ROLES.HRM, ROLES.GM, ROLES.MD] },
    { to: '/rft', label: 'RFT', icon: FileText, roles: [ROLES.REQUESTOR, ROLES.HRM, ROLES.GM] },
    { to: '/courses', label: 'Courses', icon: BookOpen, roles: [ROLES.REQUESTOR, ROLES.HRM, ROLES.GM, ROLES.MD] },
    { to: '/learn', label: 'My Learning', icon: GraduationCap, roles: [ROLES.STAFF] },
  ];

  const visibleLinks = navLinks.filter(l => l.roles.includes(currentUser.role));

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
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
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              to="/manual"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/manual')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help / Manual</span>
            </Link>

            {/* User Switcher */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {currentUser.avatar}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name.split(' ')[0]}</p>
                  <p className="text-xs text-slate-500">{currentUser.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <p className="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Switch User (Demo)</p>
                  {users.map(user => (
                    <button
                      key={user.id}
                      onClick={() => { switchUser(user.id); setDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors ${
                        currentUser.id === user.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user.avatar}
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-medium text-slate-800">{user.name}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </div>
                      {currentUser.id === user.id && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
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
      </div>
    </nav>
  );
}
