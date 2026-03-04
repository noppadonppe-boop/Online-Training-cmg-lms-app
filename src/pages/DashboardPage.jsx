import { useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, BookOpen, CheckCircle, XCircle, TrendingUp,
  GraduationCap, BarChart2, Award, Clock, FileText, LayoutDashboard
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES, RFT_STATUS, ENROLLMENT_STATUS } from '../data/mockData';
import { Card, Badge, StatusBadge, PageHeader } from '../components/ui';

/* ─── Stat Card ─────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100', val: 'text-blue-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100', val: 'text-emerald-700' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100', val: 'text-amber-700' },
    red: { bg: 'bg-red-50', icon: 'text-red-500', ring: 'ring-red-100', val: 'text-red-600' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', ring: 'ring-violet-100', val: 'text-violet-700' },
    slate: { bg: 'bg-slate-50', icon: 'text-slate-500', ring: 'ring-slate-100', val: 'text-slate-700' },
  };
  const c = colors[color] || colors.blue;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-3xl font-black ${c.val}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-2xl ${c.bg} ring-4 ${c.ring} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </Card>
  );
}

/* ─── Custom Pie tooltip ─────────────────────────────────────────── */
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-200 text-sm">
      <p className="font-bold text-slate-800">{payload[0].name}</p>
      <p className="text-slate-500">{payload[0].value} learners</p>
    </div>
  );
}

/* ─── Attendee row ────────────────────────────────────────────────── */
function AttendeeRow({ enrollment, user, totalQ }) {
  const passed = enrollment.status === ENROLLMENT_STATUS.PASSED;
  const failed = enrollment.status === ENROLLMENT_STATUS.POSTTEST_FAILED;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.avatar}
          </div>
          <span className="text-sm font-medium text-slate-800">{user?.name}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={enrollment.status} />
      </td>
      <td className="py-3 px-4 text-center">
        {enrollment.preTestScore !== null
          ? <span className="text-sm font-semibold text-slate-700">{enrollment.preTestScore}/{totalQ} <span className="text-slate-400 font-normal">({Math.round(enrollment.preTestScore/totalQ*100)}%)</span></span>
          : <span className="text-slate-300 text-sm">—</span>}
      </td>
      <td className="py-3 px-4 text-center">
        {enrollment.postTestScore !== null
          ? <span className={`text-sm font-semibold ${passed ? 'text-emerald-600' : failed ? 'text-red-500' : 'text-slate-700'}`}>
              {enrollment.postTestScore}/{totalQ} <span className="font-normal opacity-70">({Math.round(enrollment.postTestScore/totalQ*100)}%)</span>
            </span>
          : <span className="text-slate-300 text-sm">—</span>}
      </td>
      <td className="py-3 px-4 text-center">
        {passed
          ? <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3" /> Pass</div>
          : failed
          ? <div className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold"><XCircle className="w-3 h-3" /> Fail</div>
          : <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-xs font-bold"><Clock className="w-3 h-3" /> In Progress</div>
        }
      </td>
    </tr>
  );
}

/* ─── Per-course Analytics Panel ─────────────────────────────────── */
function CourseAnalytics({ course, rft }) {
  const { enrollments, users } = useApp();
  const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
  const totalQ = course.preTestQuestions.length;

  if (courseEnrollments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No enrollments yet for this course.</p>
      </div>
    );
  }

  const passed = courseEnrollments.filter(e => e.status === ENROLLMENT_STATUS.PASSED).length;
  const failed = courseEnrollments.filter(e => e.status === ENROLLMENT_STATUS.POSTTEST_FAILED).length;
  const inProgress = courseEnrollments.length - passed - failed;

  const pieData = [
    { name: 'Passed', value: passed },
    { name: 'Failed / Retry', value: failed },
    { name: 'In Progress', value: inProgress },
  ].filter(d => d.value > 0);

  const PIE_COLORS = ['#10b981', '#ef4444', '#94a3b8'];

  const withPreScore = courseEnrollments.filter(e => e.preTestScore !== null);
  const withPostScore = courseEnrollments.filter(e => e.postTestScore !== null);
  const avgPre = withPreScore.length
    ? Math.round((withPreScore.reduce((s, e) => s + e.preTestScore, 0) / withPreScore.length / totalQ) * 100)
    : null;
  const avgPost = withPostScore.length
    ? Math.round((withPostScore.reduce((s, e) => s + e.postTestScore, 0) / withPostScore.length / totalQ) * 100)
    : null;

  const barData = [
    ...(avgPre !== null ? [{ name: 'Pre-Test Avg', score: avgPre, fill: '#94a3b8' }] : []),
    ...(avgPost !== null ? [{ name: 'Post-Test Avg', score: avgPost, fill: '#3b82f6' }] : []),
  ];

  const improvement = avgPre !== null && avgPost !== null ? avgPost - avgPre : null;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Enrolled', value: courseEnrollments.length, color: 'blue' },
          { icon: CheckCircle, label: 'Passed', value: passed, color: 'emerald' },
          { icon: XCircle, label: 'Failed / Retry', value: failed, color: 'red' },
          { icon: TrendingUp, label: 'Pass Rate', value: courseEnrollments.length ? `${Math.round((passed / courseEnrollments.length) * 100)}%` : '—', color: passed > failed ? 'emerald' : 'amber' },
        ].map(s => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pie chart */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-500" /> Pass / Fail Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} innerRadius={40} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(val) => <span className="text-xs text-slate-600">{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar chart — avg scores */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Avg Score Comparison
            </h3>
            {improvement !== null && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${improvement >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                {improvement >= 0 ? '▲' : '▼'} {Math.abs(improvement)}% shift
              </span>
            )}
          </div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Average Score']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No test data yet</div>
          )}
        </Card>
      </div>

      {/* Attendee table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700">Attendee Details</h3>
          <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{courseEnrollments.length} learners</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {['Name', 'Status', 'Pre-Test', 'Post-Test', 'Result'].map(h => (
                  <th key={h} className="text-left py-2.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courseEnrollments.map(e => (
                <AttendeeRow
                  key={e.id}
                  enrollment={e}
                  user={users.find(u => u.id === e.staffId)}
                  totalQ={totalQ}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ─── Main Dashboard Page ────────────────────────────────────────── */
export default function DashboardPage() {
  const { currentUser, rfts, courses, enrollments, users } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState(
    courses.length > 0 ? courses[0].id : null
  );

  const allowedRoles = [ROLES.REQUESTOR, ROLES.HRM, ROLES.GM, ROLES.MD];
  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <LayoutDashboard className="w-12 h-12 mb-3 opacity-30" />
        <p className="font-medium">Dashboard is not available for Staff.</p>
        <p className="text-sm mt-1">Switch to a Manager or Requestor role to view analytics.</p>
      </div>
    );
  }

  /* Global stats */
  const totalEnrolled = enrollments.length;
  const totalPassed = enrollments.filter(e => e.status === ENROLLMENT_STATUS.PASSED).length;
  const totalFailed = enrollments.filter(e => e.status === ENROLLMENT_STATUS.POSTTEST_FAILED).length;
  const approvedRfts = rfts.filter(r => r.status === RFT_STATUS.APPROVED).length;
  const pendingRfts = rfts.filter(r =>
    r.status === RFT_STATUS.PENDING_HRM || r.status === RFT_STATUS.PENDING_GM
  ).length;
  const passRate = totalEnrolled > 0 ? Math.round((totalPassed / totalEnrolled) * 100) : 0;

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const selectedRft = selectedCourse ? rfts.find(r => r.id === selectedCourse.rftId) : null;

  return (
    <div>
      <PageHeader
        title="Analytics Dashboard"
        subtitle={`Viewing as ${currentUser.role} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      {/* Global KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard icon={FileText} label="Total RFTs" value={rfts.length} color="slate" />
        <StatCard icon={CheckCircle} label="Approved RFTs" value={approvedRfts} color="emerald" />
        <StatCard icon={Clock} label="Pending Review" value={pendingRfts} color="amber" />
        <StatCard icon={Users} label="Total Enrolled" value={totalEnrolled} color="blue" />
        <StatCard icon={Award} label="Passed" value={totalPassed} sub={`${passRate}% pass rate`} color="emerald" />
        <StatCard icon={BookOpen} label="Active Courses" value={courses.length} color="violet" />
      </div>

      {/* Course selector + detailed analytics */}
      {courses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-600">No courses published yet</p>
          <p className="text-sm text-slate-400 mt-1">Courses will appear here once an approved RFT has a course built.</p>
        </Card>
      ) : (
        <>
          {/* Course tabs */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Course:</span>
            {courses.map(c => {
              const rft = rfts.find(r => r.id === c.rftId);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    selectedCourseId === c.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {rft?.trainingName || c.id}
                </button>
              );
            })}
          </div>

          {selectedCourse && (
            <div>
              {/* Course meta header */}
              <div className="flex items-center gap-3 mb-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-slate-800 truncate">{selectedRft?.trainingName}</h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="blue">{selectedRft?.type}</Badge>
                    <span className="text-xs text-slate-400">{selectedCourse.preTestQuestions.length} questions · {selectedCourse.requiredWatchTimeMinutes} min</span>
                    <span className="text-xs text-slate-400">Budget: ฿{Number(selectedRft?.budget || 0).toLocaleString()}</span>
                  </div>
                </div>
                <StatusBadge status="Approved" />
              </div>

              <CourseAnalytics course={selectedCourse} rft={selectedRft} />
            </div>
          )}
        </>
      )}

      {/* RFT pipeline summary — for HRM/GM/MD */}
      {[ROLES.HRM, ROLES.GM, ROLES.MD].includes(currentUser.role) && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" /> RFT Pipeline Summary
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    {['Training Name', 'Type', 'Requestor', 'Date', 'Budget', 'Attendees', 'Status'].map(h => (
                      <th key={h} className="text-left py-2.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rfts.map(rft => {
                    const requestor = users.find(u => u.id === rft.requestorId);
                    return (
                      <tr key={rft.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-slate-800 max-w-[180px] truncate">{rft.trainingName}</td>
                        <td className="py-3 px-4"><Badge variant="blue">{rft.type}</Badge></td>
                        <td className="py-3 px-4 text-sm text-slate-600">{requestor?.name}</td>
                        <td className="py-3 px-4 text-sm text-slate-500 whitespace-nowrap">{rft.date}</td>
                        <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">฿{Number(rft.budget || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{rft.numStaff}</td>
                        <td className="py-3 px-4"><StatusBadge status={rft.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
