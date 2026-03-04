import { BookOpen, Users, GitBranch, CheckCircle, BarChart2, ArrowRight, Clock, Shield, Award } from 'lucide-react';

const Section = ({ icon: Icon, title, color, children }) => (
  <section className="mb-10">
    <div className={`flex items-center gap-3 mb-4 pb-3 border-b-2 ${color.border}`}>
      <div className={`w-9 h-9 rounded-lg ${color.bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color.icon}`} />
      </div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    </div>
    {children}
  </section>
);

const RoleCard = ({ number, role, description, color }) => (
  <div className={`flex gap-4 p-4 rounded-xl border ${color.border} ${color.bg} mb-3`}>
    <div className={`w-8 h-8 rounded-full ${color.badge} text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5`}>
      {number}
    </div>
    <div>
      <p className={`font-semibold text-sm ${color.title} mb-0.5`}>{role}</p>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

const StageCard = ({ stage, title, color, children }) => (
  <div className={`rounded-xl border ${color.border} overflow-hidden mb-4`}>
    <div className={`px-5 py-3 ${color.header} flex items-center gap-3`}>
      <span className={`w-7 h-7 rounded-full ${color.badge} text-white text-xs font-bold flex items-center justify-center`}>
        {stage}
      </span>
      <h3 className={`font-bold text-sm ${color.title}`}>{title}</h3>
    </div>
    <div className="px-5 py-4 bg-white">
      {children}
    </div>
  </div>
);

const Step = ({ num, text }) => (
  <div className="flex items-start gap-3 mb-2">
    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
      {num}
    </span>
    <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
  </div>
);

const FlowArrow = () => (
  <div className="flex items-center justify-center my-1">
    <ArrowRight className="w-4 h-4 text-slate-300" />
  </div>
);

export default function ManualPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden mb-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-40 h-40 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-blue-200 text-sm font-medium">Official Documentation</p>
              <h1 className="text-2xl font-bold leading-tight">CMG Corporate Training & LMS</h1>
            </div>
          </div>
          <p className="text-blue-100 text-base leading-relaxed max-w-2xl">
            คู่มือการใช้งานระบบบริหารจัดการการอบรมออนไลน์ — ฉบับสมบูรณ์สำหรับทุกบทบาทในองค์กร
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            {['5 บทบาทผู้ใช้งาน', '6 ขั้นตอนหลัก', 'มาตรฐาน SOP'].map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-medium text-white">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1: Roles */}
      <Section icon={Users} title="ผู้ที่เกี่ยวข้องและบทบาทความรับผิดชอบ" color={{ border: 'border-blue-200', bg: '', icon: 'text-blue-600', title: '' }}>
        <RoleCard
          number="1"
          role="Requestor / AI Trainer"
          description="ผู้ขอจัดอบรม สร้างเนื้อหาและข้อสอบ (True/False) และกำหนดเวลาเรียน — รับผิดชอบตั้งแต่การยื่น RFT จนถึงการสร้างหลักสูตรทั้งหมด"
          color={{ border: 'border-blue-200', bg: 'bg-blue-50', badge: 'bg-blue-600', title: 'text-blue-800' }}
        />
        <RoleCard
          number="2"
          role="HRM (Human Resource Manager)"
          description="ผู้ตรวจสอบความเหมาะสมและงบประมาณเบื้องต้น — สามารถ Approve หรือ Reject พร้อมระบุเหตุผลได้"
          color={{ border: 'border-purple-200', bg: 'bg-purple-50', badge: 'bg-purple-600', title: 'text-purple-800' }}
        />
        <RoleCard
          number="3"
          role="GM (General Manager)"
          description="ผู้อนุมัติสูงสุดของโครงการอบรม — ตรวจสอบและอนุมัติ RFT ที่ผ่านการกลั่นกรองจาก HRM แล้ว"
          color={{ border: 'border-amber-200', bg: 'bg-amber-50', badge: 'bg-amber-600', title: 'text-amber-800' }}
        />
        <RoleCard
          number="4"
          role="MD (Managing Director)"
          description="รับแจ้งเตือนและดูรายงานสรุปผลภาพรวม — มีสิทธิ์เข้าถึงเฉพาะหลักสูตรที่ได้รับอนุมัติแล้วและ Dashboard"
          color={{ border: 'border-rose-200', bg: 'bg-rose-50', badge: 'bg-rose-600', title: 'text-rose-800' }}
        />
        <RoleCard
          number="5"
          role="Training Staff (Attendee)"
          description="ผู้เข้าเรียน — ทำแบบทดสอบก่อน/หลังเรียน และศึกษาเนื้อหาตามเวลาที่กำหนด ต้องได้คะแนน ≥ 80% เพื่อสำเร็จหลักสูตร"
          color={{ border: 'border-emerald-200', bg: 'bg-emerald-50', badge: 'bg-emerald-600', title: 'text-emerald-800' }}
        />
      </Section>

      {/* Section 2: SOP */}
      <Section icon={GitBranch} title="ขั้นตอนการทำงานมาตรฐาน (SOP)" color={{ border: 'border-indigo-200', bg: '', icon: 'text-indigo-600', title: '' }}>

        <StageCard stage="1" title="Stage 1 — การขออนุมัติโครงการอบรม (RFT Workflow)"
          color={{ border: 'border-blue-200', header: 'bg-blue-50', badge: 'bg-blue-600', title: 'text-blue-800' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
            {[
              { actor: 'Requestor', action: 'สร้าง RFT', bg: 'bg-blue-100 text-blue-800' },
              { arrow: true },
              { actor: 'HRM', action: 'ตรวจสอบ & Approve/Reject', bg: 'bg-purple-100 text-purple-800' },
              { arrow: true },
              { actor: 'GM', action: 'อนุมัติ/ปฏิเสธขั้นสุดท้าย', bg: 'bg-amber-100 text-amber-800' },
            ].map((item, i) =>
              item.arrow ? (
                <ArrowRight key={i} className="w-5 h-5 text-slate-300 shrink-0" />
              ) : (
                <div key={i} className={`px-3 py-2 rounded-lg ${item.bg} text-center`}>
                  <p className="text-xs font-bold">{item.actor}</p>
                  <p className="text-xs">{item.action}</p>
                </div>
              )
            )}
          </div>
          <p className="text-sm text-slate-500 mt-3 italic">
            หาก Reject — RFT จะถูกส่งกลับมาให้ Requestor แก้ไขพร้อมหมายเหตุ
          </p>
        </StageCard>

        <StageCard stage="2" title="Stage 2 — การสร้างหลักสูตร (Course Builder)"
          color={{ border: 'border-indigo-200', header: 'bg-indigo-50', badge: 'bg-indigo-600', title: 'text-indigo-800' }}>
          <Step num="1" text="เมื่อ RFT ได้รับอนุมัติแล้ว Requestor/AITrainer กดสร้างหลักสูตรใหม่" />
          <Step num="2" text="สร้าง Pre-test: เพิ่มคำถาม True/False จำนวน 10 ข้อ (คำตอบที่ถูกต้องจะถูกซ่อนจากผู้เรียน)" />
          <Step num="3" text="ตั้งค่าสื่อการสอน: ใส่ลิงก์วิดีโอ/สื่อ และกำหนดเวลาขั้นต่ำที่ต้องรับชม (นาที)" />
          <Step num="4" text="ระบบจะ Auto-clone คำถามจาก Pre-test ไปยัง Post-test โดยอัตโนมัติ" />
        </StageCard>

        <StageCard stage="3" title="Stage 3 — การลงทะเบียนเข้าเรียน (Enrollment)"
          color={{ border: 'border-teal-200', header: 'bg-teal-50', badge: 'bg-teal-600', title: 'text-teal-800' }}>
          <Step num="1" text="ระบบแจ้งเตือนพนักงานเป้าหมายที่ถูกระบุใน RFT ว่ามีหลักสูตรใหม่" />
          <Step num="2" text="พนักงาน (Staff) เข้าสู่ My Learning Portal และกดปุ่ม 'Register' เพื่อลงทะเบียน" />
        </StageCard>

        <StageCard stage="4" title="Stage 4 — กระบวนการเรียนรู้ (Learning Execution) ★ สำคัญมาก"
          color={{ border: 'border-violet-200', header: 'bg-violet-50', badge: 'bg-violet-600', title: 'text-violet-800' }}>
          <div className="space-y-1">
            <Step num="1" text="ทำแบบทดสอบก่อนเรียน (Pre-test) — True/False 10 ข้อ เพื่อวัดความรู้เดิม" />
            <FlowArrow />
            <Step num="2" text="เปิดสื่อการสอน — ระบบจะเริ่มนับถอยหลังอัตโนมัติ จะกดทำข้อสอบไม่ได้จนกว่าเวลาจะหมด (Anti-Skip)" />
            <FlowArrow />
            <Step num="3" text="ทำแบบทดสอบหลังเรียน (Post-test) — True/False 10 ข้อเดิม" />
            <FlowArrow />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-700">สอบผ่าน (≥ 80%)</p>
                </div>
                <p className="text-xs text-emerald-600">ถือว่าจบหลักสูตรสมบูรณ์ — ได้รับ Certificate of Completion</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-red-500" />
                  <p className="text-sm font-bold text-red-700">สอบไม่ผ่าน (&lt; 80%)</p>
                </div>
                <p className="text-xs text-red-600">ระบบบังคับให้กลับไปดูสื่อใหม่ รอเวลาให้ครบ แล้วทำ Post-test ใหม่อีกครั้ง</p>
              </div>
            </div>
          </div>
        </StageCard>

        <StageCard stage="5" title="Stage 5 — แดชบอร์ดและรายงาน (Analytics Dashboard)"
          color={{ border: 'border-rose-200', header: 'bg-rose-50', badge: 'bg-rose-600', title: 'text-rose-800' }}>
          <Step num="1" text="ผู้บริหารและ HR เข้าดูสถิติการเรียนรู้แบบ Real-time" />
          <Step num="2" text="ดูกราฟ Pie Chart อัตราการสอบผ่าน/ไม่ผ่าน" />
          <Step num="3" text="เปรียบเทียบคะแนนเฉลี่ย Pre-test vs Post-test แบบ Bar Chart" />
          <Step num="4" text="ดูรายชื่อผู้เข้าเรียนทั้งหมดพร้อมสถานะและคะแนนแต่ละคน" />
        </StageCard>
      </Section>

      {/* Section 3: Key Rules */}
      <Section icon={Shield} title="กฎสำคัญของระบบ (System Rules)" color={{ border: 'border-amber-200', bg: '', icon: 'text-amber-600', title: '' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: CheckCircle,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50 border-emerald-200',
              title: 'เกณฑ์การสอบผ่าน',
              desc: 'ต้องได้คะแนน ≥ 80% (8 จาก 10 ข้อ) ในการทำ Post-test จึงจะถือว่าผ่านหลักสูตร',
            },
            {
              icon: Clock,
              color: 'text-blue-600',
              bg: 'bg-blue-50 border-blue-200',
              title: 'Anti-Skip Timer',
              desc: 'ระบบนับถอยหลังตามเวลาที่กำหนด ปุ่ม "ทำ Post-test" จะถูกล็อคจนกว่าตัวนับจะถึง 00:00',
            },
            {
              icon: GitBranch,
              color: 'text-purple-600',
              bg: 'bg-purple-50 border-purple-200',
              title: 'ลำดับขั้นตอนที่เข้มงวด',
              desc: 'ไม่สามารถข้ามขั้นตอนได้ ต้องทำ Pre-test → เรียน → Post-test ตามลำดับเท่านั้น',
            },
            {
              icon: Users,
              color: 'text-amber-600',
              bg: 'bg-amber-50 border-amber-200',
              title: 'การอนุมัติ 2 ชั้น',
              desc: 'RFT ต้องผ่านการอนุมัติจาก HRM ก่อน จึงจะส่งต่อให้ GM — ไม่สามารถข้ามขั้นตอนนี้ได้',
            },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className={`p-4 rounded-xl border ${bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <p className={`text-sm font-bold ${color.replace('text-', 'text-').replace('600', '800')}`}>{title}</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <div className="text-center py-8 border-t border-slate-200 mt-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-700">CMG LMS Documentation</span>
        </div>
        <p className="text-xs text-slate-400">Version 1.0 · Corporate Training & Learning Management System</p>
      </div>
    </div>
  );
}
