import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  GraduationCap, BookOpen, Clock, CheckCircle, Play,
  Lock, Unlock, ArrowRight, RotateCcw, Award, ChevronRight,
  Timer, ListChecks, Zap, Trophy, Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES, ENROLLMENT_STATUS } from '../data/mockData';
import { Button, Card, Modal, Badge } from '../components/ui';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const PASS_THRESHOLD = 0.8;

function scoreLabel(score, total) {
  if (score === null || score === undefined) return '—';
  return `${score}/${total}`;
}

function pct(score, total) {
  if (score === null || !total) return 0;
  return Math.round((score / total) * 100);
}

/* ─── Progress Ring ────────────────────────────────────────────────────────── */
function ProgressRing({ percent, size = 80, stroke = 7, color = '#3b82f6', children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/* ─── Countdown Timer ──────────────────────────────────────────────────────── */
function useCountdown(totalSeconds, onComplete) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const start = useCallback(() => {
    setRemaining(totalSeconds);
    setRunning(true);
  }, [totalSeconds]);

  const restart = useCallback(() => {
    clearInterval(intervalRef.current);
    setRemaining(totalSeconds);
    setRunning(true);
  }, [totalSeconds]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const done = remaining === 0;
  const percent = totalSeconds > 0 ? Math.round(((totalSeconds - remaining) / totalSeconds) * 100) : 0;

  return { remaining, running, done, start, restart, mm, ss, percent };
}

/* ─── shuffle helper ────────────────────────────────────────────────────────── */
function shuffleChoices(choices) {
  const arr = [...choices];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* Re-label shuffled choices ก ข ค ง and update answer key */
const CHOICE_LABELS_TH = ['ก', 'ข', 'ค', 'ง'];
function buildShuffledQuestion(q) {
  const shuffled = shuffleChoices(q.choices);
  const correctChoice = q.choices.find(c => c.label === q.answer);
  const newAnswerIndex = shuffled.findIndex(c => c.id === correctChoice?.id);
  return {
    ...q,
    choices: shuffled.map((c, i) => ({ ...c, label: CHOICE_LABELS_TH[i] })),
    answer: CHOICE_LABELS_TH[newAnswerIndex] ?? q.answer,
  };
}

/* ─── Test Engine ──────────────────────────────────────────────────────────── */
function TestEngine({ questions, type, onComplete }) {
  const isPost = type === 'post';

  /* For post-test: shuffle choices once on mount (stable per render via useMemo) */
  const displayQuestions = useMemo(() => {
    if (!isPost) return questions;
    return questions.map(q =>
      q.type === 'multiple' && q.choices?.length ? buildShuffledQuestion(q) : q
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  /* intentionally empty deps — shuffle once on mount */

  const totalQ = displayQuestions.length;
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const answered = Object.keys(answers).length;
  const allAnswered = answered === totalQ;

  const handleAnswer = (qId, val) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    const correct = displayQuestions.filter(q => answers[q.id] === q.answer).length;
    setScore(correct);
    setSubmitted(true);
    onComplete(correct, answers);
  };

  const passed = score !== null && score / totalQ >= PASS_THRESHOLD;

  return (
    <div>
      {/* Post-test shuffle notice */}
      {isPost && (
        <div className="mb-4 flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-base">🔀</span>
          <p className="text-xs text-amber-700 font-medium">ลำดับตัวเลือกถูกสลับใหม่ — คำถามเหมือนเดิม คำตอบถูกต้องมีเพียง 1 ข้อ</p>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-slate-500">{answered}/{totalQ} ตอบแล้ว</span>
          <span className="text-xs font-semibold text-blue-600">{isPost ? 'Post-Test' : 'Pre-Test'}</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${(answered / totalQ) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-5 mb-6">
        {displayQuestions.map((q, i) => {
          const ans = answers[q.id];
          const isCorrect = submitted && ans === q.answer;
          const isWrong = submitted && ans !== q.answer;
          const isMultiple = q.type === 'multiple' && q.choices?.length;

          return (
            <div key={q.id} className={`p-4 rounded-2xl border-2 transition-all ${
              submitted
                ? isCorrect ? 'border-emerald-300 bg-emerald-50'
                  : isWrong ? 'border-red-300 bg-red-50'
                  : 'border-slate-200 bg-slate-50'
                : ans !== undefined ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'
            }`}>
              {/* Question header */}
              <div className="flex items-start gap-3 mb-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  submitted
                    ? isCorrect ? 'bg-emerald-500 text-white'
                      : isWrong ? 'bg-red-500 text-white'
                      : 'bg-slate-300 text-white'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {submitted ? (isCorrect ? '✓' : isWrong ? '✗' : i + 1) : i + 1}
                </span>
                <p className="text-sm font-medium text-slate-800 leading-relaxed flex-1">{q.text}</p>
              </div>

              {/* Multiple Choice ก ข ค ง */}
              {isMultiple ? (
                <div className="space-y-2 ml-10">
                  {q.choices.map(c => {
                    const selected = ans === c.label;
                    const isThisCorrect = submitted && q.answer === c.label;
                    const isThisWrong = submitted && selected && !isThisCorrect;
                    return (
                      <button
                        key={c.id}
                        disabled={submitted}
                        onClick={() => handleAnswer(q.id, c.label)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-sm text-left transition-all ${
                          submitted
                            ? isThisCorrect
                              ? 'bg-emerald-500 border-emerald-500 text-white font-bold'
                              : isThisWrong
                              ? 'bg-red-500 border-red-500 text-white'
                              : selected
                              ? 'bg-slate-300 border-slate-300 text-white'
                              : 'bg-white border-slate-200 text-slate-400'
                            : selected
                            ? 'bg-blue-500 border-blue-500 text-white font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 border-2 ${
                          submitted
                            ? isThisCorrect ? 'border-white bg-white/20 text-white'
                              : isThisWrong ? 'border-white bg-white/20 text-white'
                              : selected ? 'border-white bg-white/20 text-white'
                              : 'border-slate-300 text-slate-400'
                            : selected ? 'border-white bg-white/20 text-white'
                            : 'border-slate-300 text-slate-500'
                        }`}>
                          {c.label}
                        </span>
                        <span className="flex-1">{c.text}</span>
                        {submitted && isThisCorrect && <CheckCircle className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* True / False (legacy) */
                <div className="flex gap-3 ml-10">
                  {[true, false].map(val => {
                    const selected = ans === val;
                    const isThisCorrect = submitted && q.answer === val;
                    const isThisWrong = submitted && selected && !isThisCorrect;
                    return (
                      <button
                        key={String(val)}
                        disabled={submitted}
                        onClick={() => handleAnswer(q.id, val)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                          submitted
                            ? isThisCorrect ? 'bg-emerald-500 border-emerald-500 text-white'
                              : isThisWrong ? 'bg-red-500 border-red-500 text-white'
                              : selected ? 'bg-slate-300 border-slate-300 text-white'
                              : 'bg-white border-slate-200 text-slate-400'
                            : selected
                            ? val ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-red-500 border-red-500 text-white'
                            : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {val ? 'TRUE' : 'FALSE'}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <Button
          variant="primary"
          className="w-full justify-center py-3 text-base"
          disabled={!allAnswered}
          onClick={handleSubmit}
        >
          <CheckCircle className="w-5 h-5" />
          {isPost ? 'ส่งคำตอบ Post-Test' : 'ส่งคำตอบ Pre-Test'}
          {!allAnswered && ` (ยังเหลือ ${totalQ - answered} ข้อ)`}
        </Button>
      )}

      {submitted && score !== null && (
        <div className={`mt-4 p-5 rounded-2xl text-center border-2 ${
          passed ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex justify-center mb-3">
            <ProgressRing
              percent={pct(score, totalQ)}
              size={90}
              stroke={8}
              color={passed ? '#10b981' : '#ef4444'}
            >
              <span className={`text-xl font-bold ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                {pct(score, totalQ)}%
              </span>
            </ProgressRing>
          </div>
          <p className={`text-lg font-bold mb-1 ${passed ? 'text-emerald-700' : 'text-red-700'}`}>
            {passed ? '🎉 ยอดเยี่ยม!' : '😔 ยังไม่ผ่าน'}
          </p>
          <p className={`text-sm ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
            คะแนน: {score}/{totalQ} &nbsp;·&nbsp; เกณฑ์ผ่าน: {Math.ceil(totalQ * PASS_THRESHOLD)}/{totalQ} ({Math.round(PASS_THRESHOLD * 100)}%)
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Classroom View (Learning Stage) ─────────────────────────────────────── */
function ClassroomView({ course, enrollment, onTimerComplete, timerDone }) {
  const totalSecs = (course.requiredWatchTimeMinutes || 1) * 60;
  const { remaining, running, done, start, restart, mm, ss, percent } = useCountdown(totalSecs, onTimerComplete);

  useEffect(() => { start(); }, []);

  const ringColor = done ? '#10b981' : remaining < 60 ? '#f59e0b' : '#3b82f6';

  return (
    <div className="space-y-6">
      {/* Video embed */}
      <div className="rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
        <div className="aspect-video">
          <iframe
            src={course.materialLink}
            className="w-full h-full"
            allowFullScreen
            title="Training Material"
          />
        </div>
      </div>

      {/* Slide file download */}
      {course.slideFileUrl && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-800 mb-0.5">📄 Slide File Available</p>
            <p className="text-xs text-emerald-600">Download the presentation slides for this course</p>
          </div>
          <a
            href={course.slideFileUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
          >
            Download
          </a>
        </div>
      )}

      {/* Timer card */}
      <div className={`relative rounded-2xl p-6 border-2 transition-all overflow-hidden ${
        done
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300'
          : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        {!done && (
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500 translate-x-1/2 -translate-y-1/2" />
          </div>
        )}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <ProgressRing percent={percent} size={100} stroke={9} color={ringColor}>
            <div className="text-center">
              <p className={`text-2xl font-black tabular-nums leading-none ${done ? 'text-emerald-600' : 'text-blue-700'}`}>
                {mm}:{ss}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">remaining</p>
            </div>
          </ProgressRing>

          <div className="flex-1 text-center sm:text-left">
            {done ? (
              <>
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <p className="text-lg font-bold text-emerald-700">Watch time complete!</p>
                </div>
                <p className="text-sm text-emerald-600">You may now proceed to the Post-Test.</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                  <Timer className="w-5 h-5 text-blue-500 animate-pulse" />
                  <p className="text-lg font-bold text-blue-700">Study in progress…</p>
                </div>
                <p className="text-sm text-blue-500">
                  Please watch the material. The Post-Test button unlocks when the timer reaches <strong>00:00</strong>.
                </p>
              </>
            )}
          </div>

          <div className="shrink-0">
            {done ? (
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Unlock className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Success Modal ────────────────────────────────────────────────────────── */
function SuccessModal({ open, onClose, enrollment, totalQ }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Confetti-like gradient header */}
        <div className="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute w-3 h-3 rounded-full bg-white"
                style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() }} />
            ))}
          </div>
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/25 flex items-center justify-center mx-auto mb-4 border-4 border-white/40 shadow-xl">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-1">Course Complete!</h2>
            <p className="text-emerald-100 text-sm">You've successfully passed this training</p>
          </div>
        </div>

        <div className="px-8 py-6 text-center">
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-3xl font-black text-slate-800">{scoreLabel(enrollment?.preTestScore, totalQ)}</p>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Pre-Test Score</p>
            </div>
            <div className="w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-3xl font-black text-emerald-600">{scoreLabel(enrollment?.postTestScore, totalQ)}</p>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Post-Test Score</p>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center mb-6 p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <Award className="w-5 h-5 text-amber-500" />
            <p className="text-sm font-bold text-amber-700">Certificate of Completion Earned</p>
          </div>

          <Button variant="primary" className="w-full justify-center py-3" onClick={onClose}>
            Back to My Learning
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Classroom Wrapper (full-screen learning flow) ───────────────────────── */
function ClassroomPage({ courseId, onBack }) {
  const { currentUser, courses, rfts, enrollments, enrollStaff, updateEnrollment, getEnrollment } = useApp();

  const course = courses.find(c => c.id === courseId);
  const rft = course ? rfts.find(r => r.id === course.rftId) : null;
  const enrollment = course ? getEnrollment(course.id, currentUser.id) : null;

  const [stage, setStage] = useState(() => {
    if (!enrollment) return 'pretest';
    switch (enrollment.status) {
      case ENROLLMENT_STATUS.NOT_STARTED: return 'pretest';
      case ENROLLMENT_STATUS.PRETEST_DONE: return 'learning';
      case ENROLLMENT_STATUS.LEARNING: return 'learning';
      case ENROLLMENT_STATUS.POSTTEST_FAILED: return 'learning';
      case ENROLLMENT_STATUS.PASSED: return 'done';
      default: return 'pretest';
    }
  });

  // timerDone starts true only if enrollment was previously in LEARNING state
  // (pre-test already done, timer already completed before). For PRETEST_DONE
  // the timer has NOT run yet, so false. For POSTTEST_FAILED timer must restart.
  const [timerDone, setTimerDone] = useState(
    enrollment?.status === ENROLLMENT_STATUS.LEARNING
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [timerKey, setTimerKey] = useState(0); // increment to force timer restart

  if (!course || !rft) return (
    <div className="text-center py-16 text-slate-400">
      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>Course not found.</p>
    </div>
  );

  const totalQ = course.preTestQuestions.length;
  const currentEnrollment = getEnrollment(course.id, currentUser.id);

  /* Stage: PRE-TEST complete */
  const handlePreTestComplete = async (score, answers) => {
    const enr = await enrollStaff(course.id, currentUser.id);
    if (enr?.id) {
      await updateEnrollment(enr.id, {
        status: ENROLLMENT_STATUS.PRETEST_DONE,
        preTestScore: score,
        preTestAnswers: answers,
      });
    }
    setTimerDone(false);
    setStage('learning');
  };

  /* Timer hits 00:00 */
  const handleTimerComplete = () => {
    setTimerDone(true);
    const enr = getEnrollment(course.id, currentUser.id);
    if (enr) {
      updateEnrollment(enr.id, { status: ENROLLMENT_STATUS.LEARNING });
    }
  };

  /* POST-TEST complete */
  const handlePostTestComplete = (score, answers) => {
    const enr = getEnrollment(course.id, currentUser.id);
    if (!enr) return;
    const passed = score / totalQ >= PASS_THRESHOLD;
    updateEnrollment(enr.id, {
      status: passed ? ENROLLMENT_STATUS.PASSED : ENROLLMENT_STATUS.POSTTEST_FAILED,
      postTestScore: score,
      postTestAnswers: answers,
    });
    if (passed) {
      setStage('done');
      setShowSuccess(true);
    } else {
      /* FAIL → force back to learning with timer restart */
      setTimerDone(false);
      setTimerKey(k => k + 1);
      setStage('learning_retry');
      setTimeout(() => setStage('learning'), 50);
    }
  };

  /* Breadcrumb steps */
  const steps = [
    { key: 'pretest', label: 'Pre-Test', icon: ListChecks },
    { key: 'learning', label: 'Study', icon: Play },
    { key: 'posttest', label: 'Post-Test', icon: GraduationCap },
    { key: 'done', label: 'Complete', icon: Trophy },
  ];
  const stageOrder = { pretest: 0, learning: 1, learning_retry: 1, posttest: 2, done: 3 };
  const currentStepIdx = stageOrder[stage] ?? 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to My Learning
      </button>

      {/* Course header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{rft.trainingName}</h1>
            <p className="text-blue-200 text-sm mt-0.5">{rft.type} · {course.requiredWatchTimeMinutes} min study time · {totalQ} questions</p>
          </div>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-1 mt-5">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const done = i < currentStepIdx;
            const active = i === currentStepIdx;
            return (
              <div key={step.key} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all flex-1 ${
                  active ? 'bg-white/25 text-white' : done ? 'bg-white/15 text-blue-200' : 'text-blue-300/60'
                }`}>
                  {done ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span className="text-xs font-semibold truncate">{step.label}</span>
                </div>
                {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-blue-300/50 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Stage: PRE-TEST ── */}
      {stage === 'pretest' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Pre-Test</h2>
              <p className="text-xs text-slate-500">Assess your existing knowledge before studying</p>
            </div>
          </div>
          <TestEngine
            questions={course.preTestQuestions}
            type="pre"
            onComplete={handlePreTestComplete}
            enrollment={currentEnrollment}
          />
        </Card>
      )}

      {/* ── Stage: LEARNING (with countdown) ── */}
      {(stage === 'learning') && (
        <div className="space-y-4">
          {currentEnrollment?.status === ENROLLMENT_STATUS.POSTTEST_FAILED && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <RotateCcw className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Post-Test not passed — please review the material</p>
                <p className="text-xs text-red-500 mt-0.5">
                  Previous score: {scoreLabel(currentEnrollment.postTestScore, totalQ)} ({pct(currentEnrollment.postTestScore, totalQ)}%).
                  You need ≥ {Math.round(PASS_THRESHOLD * 100)}% to pass. The timer must complete before you can retry.
                </p>
              </div>
            </div>
          )}

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Play className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Study Material</h2>
                <p className="text-xs text-slate-500">Watch the material and wait for the timer to complete</p>
              </div>
            </div>
            <ClassroomView
              key={timerKey}
              course={course}
              enrollment={currentEnrollment}
              onTimerComplete={handleTimerComplete}
              timerDone={timerDone}
            />
          </Card>

          {/* Proceed to Post-Test — LOCKED until timerDone */}
          <div className={`rounded-2xl border-2 p-4 flex items-center justify-between gap-4 transition-all ${
            timerDone
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-slate-200 bg-slate-50 opacity-70'
          }`}>
            <div className="flex items-center gap-3">
              {timerDone
                ? <Unlock className="w-5 h-5 text-emerald-500" />
                : <Lock className="w-5 h-5 text-slate-400" />
              }
              <div>
                <p className={`text-sm font-bold ${timerDone ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {timerDone ? 'Ready to take the Post-Test!' : 'Post-Test is locked'}
                </p>
                <p className={`text-xs ${timerDone ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {timerDone
                    ? 'You have completed the required watch time.'
                    : 'The timer must reach 00:00 before you can proceed.'}
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              disabled={!timerDone}
              onClick={() => { setStage('posttest'); }}
              className="shrink-0"
            >
              Post-Test <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Stage: POST-TEST ── */}
      {stage === 'posttest' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Post-Test</h2>
              <p className="text-xs text-slate-500">
                You need ≥ {Math.round(PASS_THRESHOLD * 100)}% ({Math.ceil(totalQ * PASS_THRESHOLD)}/{totalQ}) to pass.
              </p>
            </div>
          </div>
          <TestEngine
            key={`posttest-${timerKey}`}
            questions={course.postTestQuestions}
            type="post"
            onComplete={handlePostTestComplete}
            enrollment={currentEnrollment}
          />
        </Card>
      )}

      {/* ── Stage: DONE (already passed) ── */}
      {stage === 'done' && !showSuccess && (
        <Card className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Course Completed!</h2>
          <p className="text-slate-500 text-sm mb-6">You have successfully passed this training course.</p>
          <div className="flex justify-center gap-8 mb-6 p-4 bg-slate-50 rounded-2xl">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-700">{scoreLabel(currentEnrollment?.preTestScore, totalQ)}</p>
              <p className="text-xs text-slate-400">Pre-Test</p>
            </div>
            <div className="w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-600">{scoreLabel(currentEnrollment?.postTestScore, totalQ)}</p>
              <p className="text-xs text-slate-400">Post-Test</p>
            </div>
          </div>
          <Button variant="secondary" onClick={onBack}>← Back to My Learning</Button>
        </Card>
      )}

      <SuccessModal
        open={showSuccess}
        onClose={() => { setShowSuccess(false); }}
        enrollment={getEnrollment(course.id, currentUser.id)}
        totalQ={totalQ}
      />
    </div>
  );
}

/* ─── Course Portal Card ───────────────────────────────────────────────────── */
const GRAD = {
  cyber: 'from-blue-600 to-indigo-700',
  leadership: 'from-violet-600 to-purple-700',
  excel: 'from-emerald-600 to-teal-700',
  customer: 'from-rose-500 to-pink-600',
  safety: 'from-orange-500 to-amber-600',
  default: 'from-slate-600 to-slate-800',
};
const ICONS = { cyber: '🛡️', leadership: '🎯', excel: '📊', customer: '🤝', safety: '🦺', default: '📚' };

const STATUS_CFG = {
  [ENROLLMENT_STATUS.NOT_STARTED]: { label: 'Start Learning', color: 'primary', badge: 'default', badgeLabel: 'Not Started' },
  [ENROLLMENT_STATUS.PRETEST_DONE]: { label: 'Continue', color: 'primary', badge: 'blue', badgeLabel: 'Pre-Test Done' },
  [ENROLLMENT_STATUS.LEARNING]: { label: 'Continue', color: 'primary', badge: 'indigo', badgeLabel: 'Studying' },
  [ENROLLMENT_STATUS.POSTTEST_FAILED]: { label: 'Retry', color: 'amber', badge: 'red', badgeLabel: 'Retry Needed' },
  [ENROLLMENT_STATUS.PASSED]: { label: 'View Result', color: 'success', badge: 'green', badgeLabel: 'Passed ✓' },
};

function PortalCourseCard({ course, rft, enrollment, onStart }) {
  const totalQ = course.preTestQuestions.length;
  const cfg = STATUS_CFG[enrollment?.status || ENROLLMENT_STATUS.NOT_STARTED];
  const gradKey = course.thumbnail || 'default';
  const grad = GRAD[gradKey] || GRAD.default;
  const icon = ICONS[gradKey] || ICONS.default;
  const passed = enrollment?.status === ENROLLMENT_STATUS.PASSED;
  const preScore = enrollment?.preTestScore;
  const postScore = enrollment?.postTestScore;

  return (
    <div className={`bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 ${
      passed ? 'ring-2 ring-emerald-300 ring-offset-2' : ''
    }`}>
      {/* Banner */}
      <div className={`bg-gradient-to-br ${grad} p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white translate-x-8 -translate-y-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white -translate-x-6 translate-y-6" />
        </div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="text-4xl mb-3 block">{icon}</span>
            <h3 className="text-white font-bold text-lg leading-tight">{rft.trainingName}</h3>
            <p className="text-white/70 text-xs mt-1">{rft.type}</p>
          </div>
          {passed && (
            <div className="w-12 h-12 rounded-full bg-white/25 border-2 border-white/40 flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Badge variant={cfg.badge}>{cfg.badgeLabel}</Badge>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" /> {course.requiredWatchTimeMinutes}m
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <ListChecks className="w-3 h-3" /> {totalQ} Qs
          </span>
        </div>

        {/* Score progress */}
        {(preScore !== null || postScore !== null) && (
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl mb-4">
            {preScore !== null && (
              <div className="flex items-center gap-2">
                <ProgressRing percent={pct(preScore, totalQ)} size={44} stroke={5} color="#94a3b8">
                  <span className="text-[10px] font-bold text-slate-500">{pct(preScore, totalQ)}%</span>
                </ProgressRing>
                <div>
                  <p className="text-[10px] text-slate-400">Pre-Test</p>
                  <p className="text-xs font-bold text-slate-600">{scoreLabel(preScore, totalQ)}</p>
                </div>
              </div>
            )}
            {postScore !== null && (
              <>
                <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                <div className="flex items-center gap-2">
                  <ProgressRing percent={pct(postScore, totalQ)} size={44} stroke={5} color={passed ? '#10b981' : '#ef4444'}>
                    <span className={`text-[10px] font-bold ${passed ? 'text-emerald-600' : 'text-red-500'}`}>{pct(postScore, totalQ)}%</span>
                  </ProgressRing>
                  <div>
                    <p className="text-[10px] text-slate-400">Post-Test</p>
                    <p className={`text-xs font-bold ${passed ? 'text-emerald-600' : 'text-red-500'}`}>{scoreLabel(postScore, totalQ)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <Button
          variant={cfg.color}
          className="w-full justify-center py-2.5"
          onClick={() => onStart(course.id)}
        >
          {cfg.label} <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Available (not yet enrolled) course card ─────────────────────────────── */
function AvailableCourseCard({ course, rft, onRegister }) {
  const gradKey = course.thumbnail || 'default';
  const grad = GRAD[gradKey] || GRAD.default;
  const icon = ICONS[gradKey] || ICONS.default;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-dashed border-slate-200 hover:border-blue-300">
      <div className={`bg-gradient-to-br ${grad} p-6 opacity-80`}>
        <span className="text-4xl block mb-3">{icon}</span>
        <h3 className="text-white font-bold text-lg leading-tight">{rft.trainingName}</h3>
        <p className="text-white/70 text-xs mt-1">{rft.type}</p>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="amber">Invitation</Badge>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {course.requiredWatchTimeMinutes}m
          </span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4">{rft.objective}</p>
        <Button variant="primary" className="w-full justify-center py-2.5" onClick={() => onRegister(course.id)}>
          <Zap className="w-4 h-4" /> Register Now
        </Button>
      </div>
    </div>
  );
}

/* ─── Main LearnPage ────────────────────────────────────────────────────────── */
export default function LearnPage() {
  const { currentUser, courses, rfts, enrollments, enrollStaff, getEnrollment } = useApp();
  const [activeCourseId, setActiveCourseId] = useState(null);

  if (activeCourseId) {
    return (
      <ClassroomPage
        courseId={activeCourseId}
        onBack={() => setActiveCourseId(null)}
      />
    );
  }

  /* All courses this user is tagged in (course.assignedUsers) or RFT targetAttendees fallback */
  const invitedCourses = courses.filter(c => {
    if (c.assignedUsers?.includes(currentUser.id)) return true;
    const rft = rfts.find(r => r.id === c.rftId);
    return rft?.targetAttendees?.includes(currentUser.id);
  });

  const enrolled = invitedCourses.filter(c => getEnrollment(c.id, currentUser.id));
  const notEnrolled = invitedCourses.filter(c => !getEnrollment(c.id, currentUser.id));

  const passedCount = enrolled.filter(c => getEnrollment(c.id, currentUser.id)?.status === ENROLLMENT_STATUS.PASSED).length;
  const inProgressCount = enrolled.length - passedCount;

  const handleRegister = (courseId) => {
    enrollStaff(courseId, currentUser.id);
    setActiveCourseId(courseId);
  };

  return (
    <div>
      {/* Hero welcome banner */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-7 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white -translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/25 border border-white/30 flex items-center justify-center text-sm font-bold">
                {currentUser.avatar}
              </div>
              <span className="text-blue-200 text-sm">Welcome back,</span>
            </div>
            <h1 className="text-2xl font-black mb-1">{currentUser.name}</h1>
            <p className="text-blue-200 text-sm">Your personalized learning journey</p>
          </div>
          <div className="flex gap-4">
            {[
              { val: invitedCourses.length, label: 'Total Courses' },
              { val: inProgressCount, label: 'In Progress' },
              { val: passedCount, label: 'Completed' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                <p className="text-2xl font-black">{val}</p>
                <p className="text-xs text-blue-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invitations — not yet enrolled */}
      {notEnrolled.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-base font-bold text-slate-800">New Invitations</h2>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{notEnrolled.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notEnrolled.map(c => (
              <AvailableCourseCard
                key={c.id}
                course={c}
                rft={rfts.find(r => r.id === c.rftId)}
                onRegister={handleRegister}
              />
            ))}
          </div>
        </div>
      )}

      {/* My enrolled courses */}
      {enrolled.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            My Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrolled.map(c => (
              <PortalCourseCard
                key={c.id}
                course={c}
                rft={rfts.find(r => r.id === c.rftId)}
                enrollment={getEnrollment(c.id, currentUser.id)}
                onStart={setActiveCourseId}
              />
            ))}
          </div>
        </div>
      )}

      {invitedCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
          <GraduationCap className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-base font-semibold">No courses assigned yet</p>
          <p className="text-sm mt-1">Your training coordinator will assign courses to you shortly.</p>
        </div>
      )}
    </div>
  );
}
