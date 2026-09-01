import React, { useState } from 'react';
import {
  Student,
  SessionRecord,
  TeacherSettings,
  ExamRecord,
  CurriculumTrack,
} from '../../types';
import {
  FileText,
  Printer,
  MessageCircle,
  Share2,
  TrendingUp,
  User,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Globe2,
} from 'lucide-react';

interface ReportsViewProps {
  students: Student[];
  sessions: SessionRecord[];
  teacherSettings: TeacherSettings;
  exams: ExamRecord[];
  curricula: CurriculumTrack[];
  onOpenWhatsAppModal?: (student: Student) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students = [],
  sessions = [],
  teacherSettings,
  exams = [],
  curricula = [],
  onOpenWhatsAppModal,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Sessions for this student in selected month
  const studentMonthSessions = sessions.filter(
    s => s.studentId === currentStudent?.id && s.date.startsWith(selectedMonth)
  );

  const completedSessions = studentMonthSessions.filter(s => s.status === 'completed');
  const totalCompletedMinutes = completedSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalCompletedHours = Math.round((totalCompletedMinutes / 60) * 10) / 10;

  // Student exams
  const studentExams = exams.filter(e => e.studentId === currentStudent?.id);

  // Overall teacher stats for this month
  const allMonthSessions = sessions.filter(s => s.date.startsWith(selectedMonth));
  const totalTeacherHours = Math.round(
    (allMonthSessions.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.durationMinutes, 0) / 60) * 10
  ) / 10;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header with Natural Tones */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#4A5D4E] text-xs font-bold mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>التقارير الشهرية والتحليلات البيانية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3436]">
            📊 تقارير الطلاب والأداء التعليمي
          </h1>
          <p className="text-sm text-[#5D6567] mt-1 max-w-2xl">
            توليد كشوف أداء وتقارير شهرية شاملة جاهزة للإرسال لأولياء الأمور عبر واتساب أو الطباعة، مع تحليلات إحصائية شاملة لإنتاجية المعلم.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-[#F8F5EE] border border-[#E8E1D5] px-4 py-2.5 rounded-2xl self-start md:self-center">
          <Calendar className="w-4 h-4 text-[#5D6567]" />
          <span className="text-xs font-bold text-[#5D6567]">الشهر المحدد:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#2D3436] focus:outline-none"
          />
        </div>
      </div>

      {/* 2. Monthly Student Report Card (Printable & Shareable) */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5]">
          <div>
            <span className="text-xs bg-[#F8F5EE] text-[#4A5D4E] font-bold px-3 py-1 rounded-xl mb-2 inline-block">
              تقرير الإنجاز الشهري للطالب
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-[#2D3436]">
                {currentStudent?.name} {currentStudent?.countryFlag}
              </h2>
              {currentStudent?.age && (
                <span className="text-xs bg-[#EFE9DD] text-[#5D6567] font-semibold px-2.5 py-1 rounded-lg">
                  {currentStudent.age} سنة
                </span>
              )}
            </div>
            <p className="text-xs text-[#5D6567] mt-1">
              المقرر: {currentStudent?.subjectDetail} | الدولة: {currentStudent?.country}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Student Picker */}
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="bg-[#F8F5EE] border border-[#E8E1D5] rounded-xl px-3 py-2 text-xs font-bold text-[#2D3436] focus:outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.countryFlag} {s.name}
                </option>
              ))}
            </select>

            {currentStudent && onOpenWhatsAppModal && (
              <button
                onClick={() => onOpenWhatsAppModal(currentStudent)}
                className="bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال للولي</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة PDF</span>
            </button>
          </div>
        </div>

        {/* Stats Grid inside report */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl p-4 text-center">
            <span className="text-xs text-[#5D6567] block mb-1">الساعات المنفذة</span>
            <span className="text-2xl font-black text-[#4A5D4E]">{totalCompletedHours} س</span>
            <span className="text-[11px] text-[#5D6567] block mt-0.5">
              من أصل {currentStudent?.monthlyTargetHours || 8} ساعات مستهدفة
            </span>
          </div>

          <div className="bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl p-4 text-center">
            <span className="text-xs text-[#5D6567] block mb-1">الحصص المنجزة</span>
            <span className="text-2xl font-black text-[#2D3436]">{completedSessions.length}</span>
            <span className="text-[11px] text-[#5D6567] block mt-0.5">حصة تم حضورها</span>
          </div>

          <div className="bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl p-4 text-center">
            <span className="text-xs text-[#5D6567] block mb-1">نسبة الالتزام والحضور</span>
            <span className="text-2xl font-black text-emerald-800">
              {studentMonthSessions.length > 0
                ? Math.round((completedSessions.length / studentMonthSessions.length) * 100)
                : 100}
              %
            </span>
            <span className="text-[11px] text-[#5D6567] block mt-0.5">انضباط ممتاز</span>
          </div>

          <div className="bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl p-4 text-center">
            <span className="text-xs text-[#5D6567] block mb-1">نتائج الاختبارات</span>
            <span className="text-2xl font-black text-[#D4A373]">
              {studentExams.length > 0 ? `${studentExams[0].totalScore}%` : 'ممتاز'}
            </span>
            <span className="text-[11px] text-[#5D6567] block mt-0.5">تقييم مستمر</span>
          </div>
        </div>

        {/* Skills Ratings Table (5 criteria) */}
        {currentStudent?.skills && (
          <div className="bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-[#2D3436] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#4A5D4E]" />
              <span>تقييم المهارات التعليمية واللغوية (من 5 نجوم):</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'القراءة والتهجي', val: currentStudent.skills.reading },
                { label: 'الاستماع والفهم', val: currentStudent.skills.listening },
                { label: 'المحادثة والنطق', val: currentStudent.skills.speaking },
                { label: 'الكتابة والإملاء', val: currentStudent.skills.writing },
                { label: 'المفردات والتراكيب', val: currentStudent.skills.vocabulary },
              ].map((sk, idx) => (
                <div key={idx} className="bg-white border border-[#E8E1D5] rounded-xl p-3 text-center">
                  <span className="text-xs text-[#5D6567] block mb-1 font-semibold">{sk.label}</span>
                  <div className="text-[#D4A373] text-sm tracking-widest font-black">
                    {'⭐'.repeat(sk.val)}
                  </div>
                  <span className="text-[10px] text-[#8A9396] block mt-1">{sk.val} / 5</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Curricula Progress for this student */}
        {currentStudent?.curricula && currentStudent.curricula.length > 0 && (
          <div className="bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-[#2D3436]">المسارات والمناهج المنجزة:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentStudent.curricula.map((cp, idx) => (
                <div key={idx} className="bg-white border border-[#E8E1D5] rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#2D3436]">{cp.curriculumName}</span>
                    <span className="text-xs font-bold text-[#4A5D4E]">{cp.progressPercent}%</span>
                  </div>
                  <div className="text-[11px] text-[#5D6567] mb-2">{cp.currentUnitOrPage}</div>
                  <div className="w-full h-1.5 bg-[#EFE9DD] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4A5D4E] rounded-full"
                      style={{ width: `${cp.progressPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teacher Notes & Recommendations */}
        <div className="bg-[#F8F5EE] border border-[#E8E1D5] rounded-2xl p-5 space-y-2">
          <h3 className="font-bold text-sm text-[#2D3436]">توصيات وملاحظات المعلم الختامية:</h3>
          <p className="text-xs text-[#5D6567] leading-relaxed">
            {currentStudent?.notes ||
              'الطالب يبدي تقدماً طيباً واهتماماً بالحفظ وحضور الحصص بانتظام. نوصي باستمرار المراجعة اليومية المنزلية لترسيخ الآيات وقواعد النطق السليم.'}
          </p>
        </div>
      </div>

      {/* 3. Overall Teacher Dashboard Analytics */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-[#2D3436] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#4A5D4E]" />
          <span>إحصائيات المعلم والإنتاجية العامة لشهر ({selectedMonth})</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl">
            <span className="text-xs text-[#5D6567] block mb-1">إجمالي ساعات التدريس</span>
            <span className="text-2xl font-black text-[#4A5D4E]">{totalTeacherHours} س</span>
            <span className="text-[11px] text-[#5D6567] block mt-0.5">منفذة لجميع الطلاب</span>
          </div>

          <div className="p-4 bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl">
            <span className="text-xs text-[#5D6567] block mb-1">تنوع دول الطلاب</span>
            <span className="text-2xl font-black text-[#2D3436]">
              {new Set(students.map(s => s.country)).size} دول
            </span>
            <span className="text-[11px] text-[#5D6567] block mt-0.5">فروق توقيت متعددة</span>
          </div>

          <div className="p-4 bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl">
            <span className="text-xs text-[#5D6567] block mb-1">متوسط ساعات كل طالب</span>
            <span className="text-2xl font-black text-[#D4A373]">
              {students.length > 0 ? (totalTeacherHours / students.length).toFixed(1) : 0} س
            </span>
            <span className="text-[11px] text-[#5D6567] block mt-0.5">معدل الإنجاز الفردي</span>
          </div>
        </div>
      </div>
    </div>
  );
};
