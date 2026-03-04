import { useState } from 'react';
import {
  FileText, Plus, ChevronDown, ChevronUp, CheckCircle, XCircle,
  Clock, Eye, Edit2, AlertTriangle, Users, Calendar, DollarSign, Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES, RFT_STATUS } from '../data/mockData';
import {
  Badge, StatusBadge, Button, Card, Modal, FormField,
  Input, Textarea, Select, Alert, EmptyState, PageHeader
} from '../components/ui';

const TRAINING_TYPES = ['Compliance', 'Development', 'Technical Skills', 'Soft Skills', 'Leadership', 'Safety', 'Other'];

function RftFormModal({ open, onClose, existing }) {
  const { currentUser, submitRft, rfts, updateRftStatus, users } = useApp();
  const staffUsers = users.filter(u => u.role === ROLES.STAFF);

  const blank = {
    trainingName: '', type: 'Compliance', objective: '', detail: '',
    numStaff: '', targetAttendees: [], benefit: '', budget: '',
  };
  const [form, setForm] = useState(existing ? {
    trainingName: existing.trainingName,
    type: existing.type,
    objective: existing.objective,
    detail: existing.detail,
    numStaff: existing.numStaff,
    targetAttendees: existing.targetAttendees,
    benefit: existing.benefit,
    budget: existing.budget,
  } : blank);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleAttendee = (id) => {
    set('targetAttendees', form.targetAttendees.includes(id)
      ? form.targetAttendees.filter(x => x !== id)
      : [...form.targetAttendees, id]);
  };

  const validate = () => {
    const e = {};
    if (!form.trainingName.trim()) e.trainingName = 'Required';
    if (!form.objective.trim()) e.objective = 'Required';
    if (!form.detail.trim()) e.detail = 'Required';
    if (!form.benefit.trim()) e.benefit = 'Required';
    if (!form.budget || isNaN(Number(form.budget))) e.budget = 'Valid number required';
    if (form.targetAttendees.length === 0) e.targetAttendees = 'Select at least one attendee';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (existing) {
      updateRftStatus(existing.id, RFT_STATUS.PENDING_HRM);
    } else {
      submitRft({ ...form, numStaff: form.targetAttendees.length, budget: Number(form.budget) });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Revise & Resubmit RFT' : 'Create New RFT'} maxWidth="max-w-2xl">
      {existing?.rejectNote && (
        <div className="mb-4">
          <Alert type="error">
            <strong>Rejection Note:</strong> {existing.rejectNote}
          </Alert>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <div className="sm:col-span-2">
          <FormField label="Training Name" required>
            <Input value={form.trainingName} onChange={e => set('trainingName', e.target.value)} placeholder="e.g. Cybersecurity Awareness 2026" />
            {errors.trainingName && <p className="text-xs text-red-500 mt-1">{errors.trainingName}</p>}
          </FormField>
        </div>
        <FormField label="Training Type" required>
          <Select value={form.type} onChange={e => set('type', e.target.value)}>
            {TRAINING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </FormField>
        <FormField label="Budget (THB)" required>
          <Input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. 25000" />
          {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Objective" required>
            <Textarea rows={2} value={form.objective} onChange={e => set('objective', e.target.value)} placeholder="What is the goal of this training?" />
            {errors.objective && <p className="text-xs text-red-500 mt-1">{errors.objective}</p>}
          </FormField>
        </div>
        <div className="sm:col-span-2">
          <FormField label="Detail / Scope" required>
            <Textarea rows={3} value={form.detail} onChange={e => set('detail', e.target.value)} placeholder="Describe the training content and scope..." />
            {errors.detail && <p className="text-xs text-red-500 mt-1">{errors.detail}</p>}
          </FormField>
        </div>
        <div className="sm:col-span-2">
          <FormField label="Expected Benefit" required>
            <Textarea rows={2} value={form.benefit} onChange={e => set('benefit', e.target.value)} placeholder="What outcomes are expected?" />
            {errors.benefit && <p className="text-xs text-red-500 mt-1">{errors.benefit}</p>}
          </FormField>
        </div>
        <div className="sm:col-span-2">
          <FormField label="Target Attendees" required hint="Select staff who will attend this training">
            <div className="flex flex-wrap gap-2 p-3 border border-slate-300 rounded-lg bg-slate-50">
              {staffUsers.map(u => {
                const selected = form.targetAttendees.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleAttendee(u.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">
                      {u.avatar}
                    </div>
                    {u.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
            {errors.targetAttendees && <p className="text-xs text-red-500 mt-1">{errors.targetAttendees}</p>}
          </FormField>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>
          <CheckCircle className="w-4 h-4" />
          {existing ? 'Resubmit for Approval' : 'Submit RFT'}
        </Button>
      </div>
    </Modal>
  );
}

function ReviewModal({ open, onClose, rft, action }) {
  const { updateRftStatus } = useApp();
  const [note, setNote] = useState('');
  const isReject = action === 'reject';

  const handleConfirm = () => {
    if (isReject && !note.trim()) return;
    if (action === 'hrm_approve') updateRftStatus(rft.id, RFT_STATUS.PENDING_GM);
    else if (action === 'gm_approve') updateRftStatus(rft.id, RFT_STATUS.APPROVED);
    else if (isReject) updateRftStatus(rft.id, RFT_STATUS.REJECTED, note);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isReject ? 'Reject RFT' : 'Approve RFT'} maxWidth="max-w-md">
      <div className="mb-4">
        <p className="text-sm text-slate-600 mb-1">Training: <strong className="text-slate-800">{rft?.trainingName}</strong></p>
        {isReject ? (
          <Alert type="warning">Rejected RFT will be sent back to the Requestor for revision.</Alert>
        ) : (
          <Alert type="info">
            {action === 'hrm_approve'
              ? 'This RFT will be forwarded to GM for final approval.'
              : 'This RFT will be fully approved and a course can be created.'}
          </Alert>
        )}
      </div>
      {isReject && (
        <FormField label="Rejection Note" required>
          <Textarea
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Explain why this RFT is being rejected..."
          />
          {!note.trim() && <p className="text-xs text-red-500 mt-1">A reason is required</p>}
        </FormField>
      )}
      <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        {isReject ? (
          <Button variant="danger" onClick={handleConfirm} disabled={!note.trim()}>
            <XCircle className="w-4 h-4" /> Confirm Reject
          </Button>
        ) : (
          <Button variant="success" onClick={handleConfirm}>
            <CheckCircle className="w-4 h-4" /> Confirm Approve
          </Button>
        )}
      </div>
    </Modal>
  );
}

function RftDetailModal({ open, onClose, rft, onEdit, onReview }) {
  const { users, courses } = useApp();
  if (!rft) return null;
  const requestor = users.find(u => u.id === rft.requestorId);
  const attendees = users.filter(u => rft.targetAttendees?.includes(u.id));
  const hasCourse = courses.some(c => c.rftId === rft.id);

  return (
    <Modal open={open} onClose={onClose} title="RFT Details" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{rft.trainingName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={rft.status} />
              <Badge variant="blue">{rft.type}</Badge>
            </div>
          </div>
        </div>

        {rft.rejectNote && (
          <Alert type="error"><strong>Rejection Note:</strong> {rft.rejectNote}</Alert>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: Calendar, label: 'Date', val: rft.date },
            { icon: Users, label: 'Attendees', val: `${rft.numStaff} staff` },
            { icon: DollarSign, label: 'Budget', val: `฿${Number(rft.budget || 0).toLocaleString()}` },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <Icon className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{val}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Objective</p>
          <p className="text-sm text-slate-700 leading-relaxed">{rft.objective}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Detail / Scope</p>
          <p className="text-sm text-slate-700 leading-relaxed">{rft.detail}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected Benefit</p>
          <p className="text-sm text-slate-700 leading-relaxed">{rft.benefit}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Target Attendees</p>
          <div className="flex flex-wrap gap-2">
            {attendees.map(u => (
              <div key={u.id} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">{u.avatar[0]}</div>
                {u.name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 flex-wrap">
          {onEdit && <Button variant="secondary" onClick={() => { onClose(); onEdit(rft); }}><Edit2 className="w-3.5 h-3.5" /> Revise & Resubmit</Button>}
          {onReview?.approve && <Button variant="success" onClick={() => { onClose(); onReview.approve(rft); }}><CheckCircle className="w-3.5 h-3.5" /> Approve</Button>}
          {onReview?.reject && <Button variant="danger" onClick={() => { onClose(); onReview.reject(rft); }}><XCircle className="w-3.5 h-3.5" /> Reject</Button>}
        </div>
      </div>
    </Modal>
  );
}

function RftCard({ rft, onView, onEdit, onReview }) {
  const { users, currentUser, courses } = useApp();
  const requestor = users.find(u => u.id === rft.requestorId);
  const hasCourse = courses.some(c => c.rftId === rft.id);
  const canEdit = currentUser.role === ROLES.REQUESTOR && rft.status === RFT_STATUS.REJECTED;
  const canHrmAct = currentUser.role === ROLES.HRM && rft.status === RFT_STATUS.PENDING_HRM;
  const canGmAct = currentUser.role === ROLES.GM && rft.status === RFT_STATUS.PENDING_GM;

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-sm truncate">{rft.trainingName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{rft.date} · by {requestor?.name}</p>
        </div>
        <StatusBadge status={rft.status} />
      </div>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <Badge variant="blue">{rft.type}</Badge>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Users className="w-3 h-3" /> {rft.numStaff} staff
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <DollarSign className="w-3 h-3" /> ฿{Number(rft.budget || 0).toLocaleString()}
        </span>
      </div>

      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{rft.objective}</p>

      {rft.rejectNote && (
        <div className="flex items-start gap-1.5 p-2 bg-red-50 rounded-lg mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 line-clamp-2">{rft.rejectNote}</p>
        </div>
      )}

      {rft.status === RFT_STATUS.APPROVED && (
        <div className="flex items-center gap-1.5 p-2 bg-emerald-50 rounded-lg mb-3 border border-emerald-100">
          {hasCourse
            ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><p className="text-xs text-emerald-700 font-medium">Course created</p></>
            : <><Target className="w-3.5 h-3.5 text-emerald-500" /><p className="text-xs text-emerald-700 font-medium">Ready for course creation</p></>
          }
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => onView(rft)}>
          <Eye className="w-3.5 h-3.5" /> View
        </Button>
        {canEdit && (
          <Button variant="secondary" size="sm" onClick={() => onEdit(rft)}>
            <Edit2 className="w-3.5 h-3.5" /> Revise
          </Button>
        )}
        {(canHrmAct || canGmAct) && (
          <>
            <Button variant="success" size="sm" onClick={() => onReview('approve', rft)}>
              <CheckCircle className="w-3.5 h-3.5" /> Approve
            </Button>
            <Button variant="danger" size="sm" onClick={() => onReview('reject', rft)}>
              <XCircle className="w-3.5 h-3.5" /> Reject
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

const STATUS_TABS = ['All', ...Object.values(RFT_STATUS)];

export default function RftPage() {
  const { currentUser, rfts, courses } = useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRft, setEditRft] = useState(null);
  const [viewRft, setViewRft] = useState(null);
  const [reviewState, setReviewState] = useState({ open: false, rft: null, action: null });
  const [activeTab, setActiveTab] = useState('All');

  const canCreate = currentUser.role === ROLES.REQUESTOR;

  const visibleRfts = rfts.filter(r => {
    if (currentUser.role === ROLES.REQUESTOR) return r.requestorId === currentUser.id;
    return true;
  });

  const filtered = activeTab === 'All' ? visibleRfts : visibleRfts.filter(r => r.status === activeTab);

  const pendingCount = rfts.filter(r =>
    (currentUser.role === ROLES.HRM && r.status === RFT_STATUS.PENDING_HRM) ||
    (currentUser.role === ROLES.GM && r.status === RFT_STATUS.PENDING_GM)
  ).length;

  const openReview = (action, rft) => {
    const actionKey = action === 'approve'
      ? (currentUser.role === ROLES.HRM ? 'hrm_approve' : 'gm_approve')
      : 'reject';
    setReviewState({ open: true, rft, action: actionKey });
  };

  const viewOnReview = viewRft ? {
    approve: (currentUser.role === ROLES.HRM && viewRft.status === RFT_STATUS.PENDING_HRM) ||
      (currentUser.role === ROLES.GM && viewRft.status === RFT_STATUS.PENDING_GM)
      ? (rft) => openReview('approve', rft) : null,
    reject: (currentUser.role === ROLES.HRM && viewRft.status === RFT_STATUS.PENDING_HRM) ||
      (currentUser.role === ROLES.GM && viewRft.status === RFT_STATUS.PENDING_GM)
      ? (rft) => openReview('reject', rft) : null,
  } : {};

  return (
    <div>
      <PageHeader
        title="Request for Training (RFT)"
        subtitle={pendingCount > 0 ? `${pendingCount} item${pendingCount > 1 ? 's' : ''} awaiting your review` : 'Manage training requests and approvals'}
        action={canCreate && (
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> New RFT
          </Button>
        )}
      />

      {/* Approval pipeline banner for reviewers */}
      {(currentUser.role === ROLES.HRM || currentUser.role === ROLES.GM) && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Pending Your Review', val: pendingCount, color: 'bg-amber-50 border-amber-200 text-amber-700', icon: Clock },
            { label: 'Approved Total', val: rfts.filter(r => r.status === RFT_STATUS.APPROVED).length, color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: CheckCircle },
            { label: 'Rejected Total', val: rfts.filter(r => r.status === RFT_STATUS.REJECTED).length, color: 'bg-red-50 border-red-200 text-red-700', icon: XCircle },
          ].map(({ label, val, color, icon: Icon }) => (
            <div key={label} className={`flex items-center gap-3 p-4 rounded-xl border ${color}`}>
              <Icon className="w-5 h-5" />
              <div>
                <p className="text-2xl font-bold">{val}</p>
                <p className="text-xs font-medium opacity-80">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 flex-wrap bg-slate-100 p-1 rounded-xl w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
            {tab !== 'All' && (
              <span className="ml-1.5 text-[10px] opacity-70">
                {visibleRfts.filter(r => r.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* RFT Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No RFTs found"
          description={canCreate ? 'Create your first Request for Training to get started.' : 'No requests match this filter.'}
          action={canCreate && <Button variant="primary" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Create RFT</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(rft => (
            <RftCard
              key={rft.id}
              rft={rft}
              onView={setViewRft}
              onEdit={setEditRft}
              onReview={openReview}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <RftFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      {editRft && (
        <RftFormModal open={!!editRft} onClose={() => setEditRft(null)} existing={editRft} />
      )}
      <RftDetailModal
        open={!!viewRft}
        onClose={() => setViewRft(null)}
        rft={viewRft}
        onEdit={currentUser.role === ROLES.REQUESTOR && viewRft?.status === RFT_STATUS.REJECTED ? setEditRft : null}
        onReview={
          (currentUser.role === ROLES.HRM && viewRft?.status === RFT_STATUS.PENDING_HRM) ||
          (currentUser.role === ROLES.GM && viewRft?.status === RFT_STATUS.PENDING_GM)
            ? viewOnReview : null
        }
      />
      <ReviewModal
        open={reviewState.open}
        onClose={() => setReviewState({ open: false, rft: null, action: null })}
        rft={reviewState.rft}
        action={reviewState.action}
      />
    </div>
  );
}
