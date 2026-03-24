import { useState, useMemo } from 'react';
import {
  Users, CheckCircle, XCircle, Clock, Search, Shield,
  ChevronDown, Edit2, Save, X, Filter, Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ALL_ROLES } from '../firebase/authService';

const STATUS_CONFIG = {
  approved: { label: 'อนุมัติแล้ว', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  pending:  { label: 'รออนุมัติ',   color: 'bg-amber-100 text-amber-700',   icon: Clock },
  rejected: { label: 'ปฏิเสธ',      color: 'bg-red-100 text-red-700',       icon: XCircle },
};

function RoleMultiSelect({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const toggle = (role) => {
    if (selected.includes(role)) onChange(selected.filter(r => r !== role));
    else onChange([...selected, role]);
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:border-blue-400 transition-colors"
      >
        <span className="text-slate-700 truncate">
          {selected.length === 0 ? 'เลือก Role...' : selected.join(', ')}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg py-1 max-h-52 overflow-y-auto">
          {ALL_ROLES.map(role => (
            <label key={role} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(role)}
                onChange={() => toggle(role)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{role}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function UserRow({ user, currentUserUid, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [editRoles, setEditRoles] = useState(user.roles || []);
  const [editStatus, setEditStatus] = useState(user.status);
  const [editPosition, setEditPosition] = useState(user.position || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(user.uid, { roles: editRoles, status: editStatus, position: editPosition });
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditRoles(user.roles || []);
    setEditStatus(user.status);
    setEditPosition(user.position || '');
    setEditing(false);
  };

  const StatusIcon = STATUS_CONFIG[user.status]?.icon || Clock;
  const isSelf = user.uid === currentUserUid;

  return (
    <div className={`bg-white rounded-xl border ${isSelf ? 'border-blue-200' : 'border-slate-200'} p-4 transition-all`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
            </div>
          )}
          {user.isFirstUser && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 text-sm">{user.firstName} {user.lastName}</p>
            {isSelf && <span className="text-xs text-blue-600 font-medium">(คุณ)</span>}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[user.status]?.color}`}>
              <StatusIcon className="w-3 h-3" />
              {STATUS_CONFIG[user.status]?.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</p>

          {!editing ? (
            <>
              <p className="text-xs text-slate-400 mt-1">{user.position || '-'}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(user.roles || []).map(r => (
                  <span key={r} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100">{r}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">ตำแหน่ง</label>
                <input
                  type="text"
                  value={editPosition}
                  onChange={e => setEditPosition(e.target.value)}
                  placeholder="ตำแหน่งงาน"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Roles</label>
                <RoleMultiSelect selected={editRoles} onChange={setEditRoles} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">สถานะ</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="approved">อนุมัติ</option>
                  <option value="pending">รออนุมัติ</option>
                  <option value="rejected">ปฏิเสธ</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!editing ? (
            <>
              {user.status === 'pending' && (
                <>
                  <button
                    onClick={() => onUpdate(user.uid, { status: 'approved' })}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors border border-emerald-200"
                  >
                    อนุมัติ
                  </button>
                  <button
                    onClick={() => onUpdate(user.uid, { status: 'rejected' })}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors border border-red-200"
                  >
                    ปฏิเสธ
                  </button>
                </>
              )}
              <button
                onClick={() => setEditing(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="แก้ไข"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                บันทึก
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const { allUsers, userProfile, updateAnyUser } = useAuth();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = useMemo(() => ({
    total: allUsers.length,
    approved: allUsers.filter(u => u.status === 'approved').length,
    pending: allUsers.filter(u => u.status === 'pending').length,
    rejected: allUsers.filter(u => u.status === 'rejected').length,
  }), [allUsers]);

  const filtered = useMemo(() => {
    return allUsers.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q || `${u.firstName} ${u.lastName} ${u.email} ${u.position}`.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || u.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [allUsers, search, filterStatus]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            จัดการผู้ใช้งาน
          </h1>
          <p className="text-slate-500 text-sm mt-1">บริหารสิทธิ์และสถานะผู้ใช้ทั้งหมดในระบบ</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'ผู้ใช้ทั้งหมด', value: stats.total, color: 'bg-blue-50 text-blue-700', border: 'border-blue-100' },
          { label: 'อนุมัติแล้ว', value: stats.approved, color: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-100' },
          { label: 'รออนุมัติ', value: stats.pending, color: 'bg-amber-50 text-amber-700', border: 'border-amber-100' },
          { label: 'ปฏิเสธ', value: stats.rejected, color: 'bg-red-50 text-red-700', border: 'border-red-100' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.border} ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, อีเมล, ตำแหน่ง..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {['all', 'approved', 'pending', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                filterStatus === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {s === 'all' ? 'ทั้งหมด' : STATUS_CONFIG[s]?.label}
              {s === 'pending' && stats.pending > 0 && (
                <span className="ml-1.5 bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5">{stats.pending}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">ไม่พบผู้ใช้งาน</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(user => (
            <UserRow
              key={user.uid}
              user={user}
              currentUserUid={userProfile?.uid}
              onUpdate={updateAnyUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}
