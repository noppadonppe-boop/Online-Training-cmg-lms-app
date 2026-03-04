import { useState } from 'react';
import {
  BookOpen, Plus, Trash2, CheckCircle,
  Link2, Clock, Eye, Pencil, ArrowRight, Play, ListChecks,
  GraduationCap, Save, Copy, AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES, RFT_STATUS } from '../data/mockData';
import {
  Badge, StatusBadge, Button, Card, Modal, FormField,
  Input, EmptyState, PageHeader
} from '../components/ui';

const THUMBNAIL_GRADIENTS = {
  cyber: 'from-blue-600 to-indigo-700',
  leadership: 'from-violet-600 to-purple-700',
  excel: 'from-emerald-600 to-teal-700',
  customer: 'from-rose-500 to-pink-600',
  safety: 'from-orange-500 to-amber-600',
  default: 'from-slate-600 to-slate-800',
};

const THUMB_ICONS = {
  cyber: '🛡️', leadership: '🎯', excel: '📊', customer: '🤝', safety: '🦺', default: '📚',
};

function QuestionBuilder({ questions, setQuestions, readOnly = false }) {
  const addQuestion = () => {
    if (questions.length >= 10) return;
    setQuestions(prev => [...prev, {
      id: `q_${Date.now()}`,
      text: '',
      answer: true,
    }]);
  };

  const updateQ = (id, field, value) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQ = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div>
      <div className="space-y-3 mb-3">
        {questions.map((q, i) => (
          <div key={q.id} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-1">
              {i + 1}
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                rows={2}
                value={q.text}
                onChange={e => updateQ(q.id, 'text', e.target.value)}
                placeholder="Enter question statement..."
                disabled={readOnly}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              {!readOnly && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500">Correct Answer:</span>
                  {[true, false].map(val => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => updateQ(q.id, 'answer', val)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        q.answer === val
                          ? val ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {val ? 'TRUE' : 'FALSE'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!readOnly && (
              <button
                onClick={() => removeQ(q.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {!readOnly && (
        <Button
          variant="secondary"
          size="sm"
          onClick={addQuestion}
          disabled={questions.length >= 10}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Question {questions.length > 0 && `(${questions.length}/10)`}
        </Button>
      )}
      {questions.length === 0 && (
        <p className="text-xs text-slate-400 italic">No questions added yet.</p>
      )}
    </div>
  );
}

function CourseBuilderModal({ open, onClose, rft }) {
  const { createCourse, updateCourse, courses } = useApp();
  const existing = rft ? courses.find(c => c.rftId === rft.id) : null;

  const [activeStep, setActiveStep] = useState(0);
  const [preQuestions, setPreQuestions] = useState(existing?.preTestQuestions || []);
  const [materialLink, setMaterialLink] = useState(existing?.materialLink || '');
  const [watchTime, setWatchTime] = useState(existing?.requiredWatchTimeMinutes || '');
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const postQuestions = preQuestions;

  const steps = [
    { label: 'Pre-Test Builder', icon: ListChecks },
    { label: 'Learning Material', icon: Play },
    { label: 'Post-Test Review', icon: GraduationCap },
  ];

  const validateStep = (step) => {
    const e = {};
    if (step === 0) {
      if (preQuestions.length < 3) e.questions = 'Add at least 3 questions (10 recommended)';
      if (preQuestions.some(q => !q.text.trim())) e.questions = 'All questions must have text';
    }
    if (step === 1) {
      if (!materialLink.trim()) e.materialLink = 'Material link is required';
      if (!watchTime || isNaN(Number(watchTime)) || Number(watchTime) < 1) e.watchTime = 'Enter a valid duration (minimum 1 minute)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) return;
    setActiveStep(s => s + 1);
  };

  const handleSave = () => {
    if (!validateStep(activeStep)) return;
    const data = {
      rftId: rft.id,
      preTestQuestions: preQuestions,
      postTestQuestions: preQuestions,
      materialLink,
      requiredWatchTimeMinutes: Number(watchTime),
      thumbnail: 'cyber',
    };
    if (existing) {
      updateCourse(existing.id, data);
    } else {
      createCourse(data);
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  if (!rft) return null;

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Course' : 'Build New Course'} maxWidth="max-w-3xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-1 ${
                active ? 'bg-blue-600 text-white' : done ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
              }`}>
                {done ? <CheckCircle className="w-4 h-4 shrink-0" /> : <Icon className="w-4 h-4 shrink-0" />}
                <span className="text-xs font-semibold truncate">{step.label}</span>
              </div>
              {i < steps.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Step 0: Pre-Test */}
      {activeStep === 0 && (
        <div>
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> Answers are hidden from students during the test. Add up to 10 True/False questions. The Post-Test will auto-clone these questions.
            </p>
          </div>
          <FormField label="Pre-Test Questions" required hint={`${preQuestions.length}/10 questions added`}>
            <QuestionBuilder questions={preQuestions} setQuestions={setPreQuestions} />
            {errors.questions && <p className="text-xs text-red-500 mt-2">{errors.questions}</p>}
          </FormField>
        </div>
      )}

      {/* Step 1: Material */}
      {activeStep === 1 && (
        <div>
          <FormField label="Material / Video Link" required hint="Paste a YouTube embed URL or any direct video/document link">
            <Input
              value={materialLink}
              onChange={e => setMaterialLink(e.target.value)}
              placeholder="https://www.youtube.com/embed/..."
            />
            {errors.materialLink && <p className="text-xs text-red-500 mt-1">{errors.materialLink}</p>}
          </FormField>
          <FormField label="Required Watch Time (minutes)" required hint="Students must watch for this duration before taking the Post-Test">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={watchTime}
                onChange={e => setWatchTime(e.target.value)}
                placeholder="e.g. 30"
                className="w-40"
                min={1}
              />
              <span className="text-sm text-slate-500">minutes</span>
            </div>
            {errors.watchTime && <p className="text-xs text-red-500 mt-1">{errors.watchTime}</p>}
          </FormField>
          {materialLink && (
            <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-2">Preview:</p>
              <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
                <iframe
                  src={materialLink}
                  className="w-full h-full"
                  allowFullScreen
                  title="Material Preview"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Post-test review */}
      {activeStep === 2 && (
        <div>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
            <Copy className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <strong>Auto-cloned:</strong> The Post-Test uses the same {postQuestions.length} questions as the Pre-Test. Pass criteria is ≥ 80% ({Math.ceil(postQuestions.length * 0.8)}/{postQuestions.length} correct).
            </p>
          </div>
          <QuestionBuilder questions={postQuestions} setQuestions={() => {}} readOnly />
        </div>
      )}

      {/* Footer actions */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
        <Button
          variant="secondary"
          onClick={() => activeStep > 0 ? setActiveStep(s => s - 1) : onClose()}
        >
          {activeStep > 0 ? '← Back' : 'Cancel'}
        </Button>
        <div className="flex gap-2">
          {activeStep < steps.length - 1 ? (
            <Button variant="primary" onClick={handleNext}>
              Next Step <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="success" onClick={handleSave}>
              {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> {existing ? 'Update Course' : 'Publish Course'}</>}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function CourseCard({ course, rft, onEdit, onView }) {
  const { currentUser } = useApp();
  const canEdit = currentUser.role === ROLES.REQUESTOR;
  const gradKey = course.thumbnail || 'default';
  const grad = THUMBNAIL_GRADIENTS[gradKey] || THUMBNAIL_GRADIENTS.default;
  const icon = THUMB_ICONS[gradKey] || THUMB_ICONS.default;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Thumbnail */}
      <div className={`bg-gradient-to-br ${grad} p-6 flex items-center justify-center h-36 relative`}>
        <span className="text-5xl">{icon}</span>
        <div className="absolute top-3 right-3">
          <Badge variant="green" className="bg-white/20 text-white border border-white/30 backdrop-blur-sm">
            Active
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">{rft?.trainingName}</h3>
        <p className="text-xs text-slate-500 mb-3">{rft?.type} · {rft?.date}</p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 bg-slate-50 rounded-lg text-center">
            <p className="text-lg font-bold text-slate-800">{course.preTestQuestions.length}</p>
            <p className="text-[10px] text-slate-500">Questions</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg text-center">
            <p className="text-lg font-bold text-slate-800">{course.requiredWatchTimeMinutes}m</p>
            <p className="text-[10px] text-slate-500">Watch Time</p>
          </div>
        </div>

        {course.materialLink && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-3 truncate">
            <Link2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{course.materialLink}</span>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={() => onView(course)}>
            <Eye className="w-3.5 h-3.5" /> Preview
          </Button>
          {canEdit && (
            <Button variant="secondary" size="sm" onClick={() => onEdit(course)}>
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function CoursePreviewModal({ open, onClose, course, rft }) {
  const [tab, setTab] = useState('pretest');
  if (!course) return null;

  const tabs = [
    { id: 'pretest', label: 'Pre-Test', count: course.preTestQuestions.length },
    { id: 'material', label: 'Material' },
    { id: 'posttest', label: 'Post-Test', count: course.postTestQuestions.length },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Course Preview" maxWidth="max-w-2xl">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">{rft?.trainingName}</h2>
        <div className="flex items-center gap-3 mt-1">
          <Badge variant="blue">{rft?.type}</Badge>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" /> {course.requiredWatchTimeMinutes} min required
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <ListChecks className="w-3 h-3" /> {course.preTestQuestions.length} questions
          </span>
        </div>
      </div>

      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}{t.count !== undefined && ` (${t.count})`}
          </button>
        ))}
      </div>

      {tab === 'pretest' && (
        <div className="space-y-2">
          {course.preTestQuestions.map((q, i) => (
            <div key={q.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm text-slate-700">{q.text || <em className="text-slate-400">No text</em>}</p>
                <div className="mt-1.5 flex gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${q.answer ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    Answer: {q.answer ? 'TRUE' : 'FALSE'}
                  </span>
                  <span className="text-xs text-slate-400 italic">(hidden from students)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'material' && (
        <div>
          <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-500 shrink-0" />
            <a href={course.materialLink} target="_blank" rel="noreferrer" className="text-sm text-blue-700 truncate hover:underline">
              {course.materialLink}
            </a>
          </div>
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
            <iframe src={course.materialLink} className="w-full h-full" allowFullScreen title="Course Material" />
          </div>
        </div>
      )}

      {tab === 'posttest' && (
        <div>
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
            <Copy className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-700">Post-Test is auto-cloned from Pre-Test. Pass threshold: ≥ 80% ({Math.ceil(course.postTestQuestions.length * 0.8)}/{course.postTestQuestions.length} correct)</p>
          </div>
          <div className="space-y-2">
            {course.postTestQuestions.map((q, i) => (
              <div key={q.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <p className="text-sm text-slate-700">{q.text || <em className="text-slate-400">No text</em>}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function CoursesPage() {
  const { currentUser, rfts, courses } = useApp();
  const [builderRft, setBuilderRft] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [previewCourse, setPreviewCourse] = useState(null);

  const canCreate = currentUser.role === ROLES.REQUESTOR;

  const approvedRfts = rfts.filter(r => r.status === RFT_STATUS.APPROVED);
  const rftsWithoutCourse = approvedRfts.filter(r => !courses.some(c => c.rftId === r.id));
  const rftsWithCourse = approvedRfts.filter(r => courses.some(c => c.rftId === r.id));

  const getCourse = (rftId) => courses.find(c => c.rftId === rftId);

  const openEdit = (course) => {
    const rft = rfts.find(r => r.id === course.rftId);
    setBuilderRft(rft);
    setEditCourse(course);
  };

  const openPreview = (course) => setPreviewCourse(course);

  return (
    <div>
      <PageHeader
        title="Course Management"
        subtitle="Build and manage training courses from approved RFTs"
      />

      {/* Approved RFTs awaiting course — only for Requestor */}
      {canCreate && rftsWithoutCourse.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-700">Approved RFTs — Awaiting Course Creation</h2>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">{rftsWithoutCourse.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rftsWithoutCourse.map(rft => (
              <Card key={rft.id} className="p-4 border-dashed border-2 border-slate-300 hover:border-blue-400 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{rft.trainingName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{rft.date}</p>
                  </div>
                  <StatusBadge status={rft.status} />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{rft.objective}</p>
                <Button variant="primary" size="sm" className="w-full justify-center" onClick={() => setBuilderRft(rft)}>
                  <Plus className="w-3.5 h-3.5" /> Build Course
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Existing courses */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Published Courses
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{rftsWithCourse.length}</span>
        </h2>

        {rftsWithCourse.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses published yet"
            description={canCreate
              ? "Courses are created from Approved RFTs. Approve an RFT first, then build the course here."
              : "No courses have been published yet. Ask your Requestor to build a course."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rftsWithCourse.map(rft => {
              const course = getCourse(rft.id);
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  rft={rft}
                  onEdit={openEdit}
                  onView={openPreview}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CourseBuilderModal
        open={!!builderRft}
        onClose={() => { setBuilderRft(null); setEditCourse(null); }}
        rft={builderRft}
      />
      <CoursePreviewModal
        open={!!previewCourse}
        onClose={() => setPreviewCourse(null)}
        course={previewCourse}
        rft={previewCourse ? rfts.find(r => r.id === previewCourse.rftId) : null}
      />
    </div>
  );
}
