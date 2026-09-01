import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  ChevronRight,
  ChevronLeft,
  User,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  Star,
  Edit2,
  Trash2,
  Award,
  Filter,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Student, SessionRecord, TeacherSettings } from '../../types';
import { formatTime12 } from '../../utils/timezones';
import { StudentReportModal } from './StudentReportModal';

interface MonthlyHoursTrackerProps {
  students: Student[];
  sessions: SessionRecord[];
  settings: TeacherSettings;
  onAddSession: () => void;
  onEditSession: (session: SessionRecord) => void;
  onDeleteSession: (sessionId: string) => void;
  onQuickLogForStudent: (studentId: string) => void;
}

export const MonthlyHoursTracker: React.FC<MonthlyHoursTrackerProps> = ({
  students = [],
  sessions = [],
  settings,
  onAddSession,
  onEditSession,
  onDeleteSession,
  onQuickLogForStudent,
}) => {
  // Default to current month YYYY-MM
  const today = new Date();
  const currentMonthStr = today.toISOString().slice(0, 7); // e.g. "2026-09"
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected student for detailed report modal
  const [reportStudent, setReportStudent] = useState<Student | null>(null);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setSelectedMonth(prevDate.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setSelectedMonth(nextDate.toISOString().slice(0, 7));
  };

  // Filter sessions for selected month
  const monthSessions = sessions.filter(s => s.date.startsWith(selectedMonth));

  // Compute Aggregate Stats
  const completedMonthSessions = monthSessions.filter(s => s.status === 'completed');
  const totalCompletedMinutes = completedMonthSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalCompletedHours = totalCompletedMinutes / 60;

  const totalMonthlyTargetHours = students
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.monthlyTargetHours || 8), 0);

  const overallCompletionPercentage = totalMonthlyTargetHours > 0
    ? Math.min(100, Math.round((totalCompletedHours / totalMonthlyTargetHours) * 100))
    : 0;

  // Total estimated earnings
  const totalEstimatedEarnings = completedMonthSessions.reduce((sum, s) => {
    const stu = students.find(item => item.id === s.studentId);
    const rate = stu?.hourlyRate || settings.defaultHourlyRate || 15;
    return sum + (s.durationMinutes / 60) * rate;
  }, 0);

  // Format month name in Arabic
  const [year, month] = selectedMonth.split('-').map(Number);
  const monthDisplayDate = new Date(year, month - 1, 1);
  const monthLabelArabic = new Intl.DateTimeFormat('ar-EG', {
    month: 'long',
    year: 'numeric',
  }).format(monthDisplayDate);

  // Filtered session records for table
  const displayedSessions = monthSessions
    .filter(s => {
      if (studentFilter !== 'all' && s.studentId !== studentFilter) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      
      {/* Month Navigator Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#2D3436] font-quran">
              نظام متابعة الساعات الشهرية والتقارير
            </h2>
            <span className="bg-[#EAE4D9] text-[#4A5D4E] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {monthLabelArabic}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5D6567] mt-0.5">
            تتبع دقيق لساعات كل طالب المنجزة، وإجمالي ساعات التدريس للأكاديمية مع كشوف حساب تفصيلية.
          </p>
        </div>

        {/* Month Selector Controls & Add Action */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          
          <div className="flex items-center gap-1 bg-[#F8F5EE] p-1 rounded-xl border border-[#E8E1D5]">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-lg text-[#5D6567] hover:text-[#2D3436] transition"
              title="الشهر السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-xs sm:text-sm text-[#2D3436] font-quran min-w-[120px] text-center">
              {monthLabelArabic}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-lg text-[#5D6567] hover:text-[#2D3436] transition"
              title="الشهر التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onAddSession}
            className="bg-[#4A5D4E] hover:bg-[#3D4D40] active:scale-95 text-[#FDFBF7] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل حصة</span>
          </button>

        </div>

      </div>

      {/* Aggregate KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Hours Completed */}
        <div className="bg-gradient-to-br from-[#4A5D4E] to-[#36453A] text-[#FDFBF7] rounded-2xl p-4 shadow-sm border border-[#5E7564]">
          <div className="flex items-center justify-between text-[#C8D7CC] text-xs">
            <span>إجمالي الساعات المنجزة</span>
            <Clock className="w-4 h-4 text-[#D8E6DB]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {totalCompletedHours.toFixed(1)}
            </span>
            <span className="text-xs text-[#C8D7CC] font-medium">
              / {totalMonthlyTargetHours} س مستهدفة
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-[#242E25]/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#A67C52] h-full rounded-full transition-all duration-500"
              style={{ width: `${overallCompletionPercentage}%` }}
            />
          </div>
          <div className="mt-1.5 text-[11px] text-[#C8D7CC] text-left font-mono">
            نسبة الإنجاز: {overallCompletionPercentage}%
          </div>
        </div>

        {/* Total Sessions Count */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs">
          <div className="flex items-center justify-between text-[#78716C] text-xs">
            <span>الحصص المنفذة هذا الشهر</span>
            <CheckCircle2 className="w-4 h-4 text-[#4A5D4E]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#2D3436]">
              {completedMonthSessions.length}
            </span>
            <span className="text-xs text-[#78716C]">حصة مكتملة</span>
          </div>
          <div className="mt-3 text-xs text-[#5D6567] flex items-center gap-3 border-t border-[#F0EBE1] pt-2">
            <span className="text-[#4A5D4E] font-medium">
              ✅ {completedMonthSessions.length} منجزة
            </span>
            <span className="text-[#C05746] font-medium">
              ❌ {monthSessions.filter(s => s.status === 'absent' || s.status === 'student_cancelled').length} ملغية/غياب
            </span>
          </div>
        </div>

        {/* Active Students & Average Hours */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs">
          <div className="flex items-center justify-between text-[#78716C] text-xs">
            <span>الطلاب ومتوسط الساعات</span>
            <User className="w-4 h-4 text-[#4A5D4E]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#2D3436]">
              {students.filter(s => s.status === 'active').length}
            </span>
            <span className="text-xs text-[#78716C]">طالب نشط</span>
          </div>
          <div className="mt-3 text-xs text-[#5D6567] border-t border-[#F0EBE1] pt-2 flex items-center justify-between">
            <span>المعدل للطالب:</span>
            <strong className="font-mono text-[#4A5D4E]">
              {students.length > 0
                ? (totalCompletedHours / students.length).toFixed(1)
                : '0'}{' '}
              ساعة/طالب
            </strong>
          </div>
        </div>

        {/* Total Estimated Earnings */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-xs">
          <div className="flex items-center justify-between text-[#78716C] text-xs">
            <span>إجمالي العائد التقديري</span>
            <DollarSign className="w-4 h-4 text-[#A67C52]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#A67C52]">
              {totalEstimatedEarnings.toFixed(0)}
            </span>
            <span className="text-xs text-[#78716C] font-bold">{settings.currency}</span>
          </div>
          <div className="mt-3 text-xs text-[#78716C] border-t border-[#F0EBE1] pt-2 flex items-center justify-between">
            <span>بناءً على أجر الساعة لكل طالب</span>
          </div>
        </div>

      </div>

      {/* Per-Student Hours Breakdown Section */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-xs overflow-hidden">
        
        <div className="bg-[#F8F5EE] px-5 py-4 border-b border-[#E8E1D5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#4A5D4E]" />
            <h3 className="font-bold text-sm sm:text-base text-[#2D3436]">
              تفصيل ساعات كل طالب لشهر {monthLabelArabic}
            </h3>
          </div>
          <span className="text-xs text-[#78716C]">
            اضغط على "تقرير الطالب" لعرض وطباعة كشف الحساب
          </span>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#FDFBF7]">
          {students.map(student => {
            const studentMonthSessions = completedMonthSessions.filter(
              s => s.studentId === student.id
            );
            const studentCompletedMinutes = studentMonthSessions.reduce(
              (sum, s) => sum + s.durationMinutes,
              0
            );
            const studentCompletedHours = studentCompletedMinutes / 60;
            const target = student.monthlyTargetHours || 8;
            const studentPercentage = Math.min(
              100,
              Math.round((studentCompletedHours / target) * 100)
            );
            const rate = student.hourlyRate || settings.defaultHourlyRate || 15;
            const studentTotalEarnings = studentCompletedHours * rate;

            return (
              <div
                key={student.id}
                className="bg-white hover:border-[#D8CFBF] border border-[#E8E1D5] rounded-xl p-4 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Student Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{student.countryFlag}</span>
                      <div>
                        <h4 className="font-bold text-sm text-[#2D3436] leading-tight">
                          {student.name}
                        </h4>
                        <span className="text-[11px] text-[#78716C]">
                          {student.country} • {student.subjectDetail}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hours Metric & Progress Bar */}
                  <div className="my-3 bg-[#F8F5EE] p-3 rounded-xl border border-[#E8E1D5]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#5D6567] font-medium">الساعات المنجزة:</span>
                      <span className="font-mono font-bold text-[#2D3436]">
                        <strong className="text-[#4A5D4E] text-sm">
                          {studentCompletedHours.toFixed(1)}
                        </strong>{' '}
                        / {target} ساعة
                      </span>
                    </div>

                    <div className="w-full bg-[#E8E1D5] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          studentPercentage >= 100
                            ? 'bg-[#4A5D4E]'
                            : studentPercentage >= 50
                            ? 'bg-[#A67C52]'
                            : 'bg-[#C08A3E]'
                        }`}
                        style={{ width: `${studentPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#78716C] mt-1.5">
                      <span>{studentMonthSessions.length} حصص منفذة</span>
                      <span className="font-bold text-[#5D6567]">
                        {studentPercentage}% من الهدف
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-[#E8E1D5] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setReportStudent(student)}
                    className="text-xs bg-[#EAE4D9] hover:bg-[#DDD4C5] text-[#4A5D4E] font-bold px-3 py-1.5 rounded-lg border border-[#D8CFBF] flex items-center gap-1 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>تقرير وكشف حساب</span>
                  </button>

                  <button
                    onClick={() => onQuickLogForStudent(student.id)}
                    className="text-xs bg-[#F8F5EE] hover:bg-[#EFE9DD] text-[#2D3436] font-medium px-2.5 py-1.5 rounded-lg border border-[#E8E1D5] flex items-center gap-1 transition"
                    title="تسجيل حصة جديدة لهذا الطالب"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#5D6567]" />
                    <span>تسجيل حصة</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Detailed Session Logs History Section */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-xs overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-[#E8E1D5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#F8F5EE]">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#2D3436] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4A5D4E]" />
              <span>سجل الحصص المنفذة خلال شهر {monthLabelArabic}</span>
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              عرض تفصيلي لتواريخ الحصص، والمقرر الدراسي، والواجبات، وملاحظات التسميع.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={studentFilter}
              onChange={e => setStudentFilter(e.target.value)}
              className="text-xs bg-white border border-[#D8CFBF] rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
            >
              <option value="all">جميع الطلاب</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.countryFlag} {s.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-[#D8CFBF] rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
            >
              <option value="all">جميع الحالات</option>
              <option value="completed">مكتملة فقط</option>
              <option value="scheduled">مجدولة</option>
              <option value="absent">غياب</option>
              <option value="student_cancelled">ملغية</option>
            </select>
          </div>
        </div>

        {/* Sessions Table */}
        {displayedSessions.length === 0 ? (
          <div className="text-center py-12 text-[#78716C] text-xs">
            لا توجد حصص مسجلة مطابقة للفلاتر المحددة في هذا الشهر.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F8F5EE] text-[#5D6567] font-bold border-b border-[#E8E1D5]">
                <tr>
                  <th className="p-3">التاريخ والوقت</th>
                  <th className="p-3">الطالب والدولة</th>
                  <th className="p-3">المدة</th>
                  <th className="p-3">المنهج وما تم إنجازه</th>
                  <th className="p-3">الواجب والتكليف</th>
                  <th className="p-3 text-center">التقييم</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5] text-[#2D3436]">
                {displayedSessions.map(session => {
                  const student = students.find(s => s.id === session.studentId);
                  return (
                    <tr key={session.id} className="hover:bg-[#F8F5EE]/60 transition">
                      <td className="p-3 whitespace-nowrap font-mono">
                        <strong className="text-[#2D3436] block">{session.date}</strong>
                        <span className="text-[11px] text-[#78716C]">
                          {formatTime12(session.teacherStartTime)}
                        </span>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {student ? (
                          <div className="flex items-center gap-1.5">
                            <span>{student.countryFlag}</span>
                            <span className="font-bold text-[#2D3436]">{student.name}</span>
                          </div>
                        ) : (
                          'طالب غير محدد'
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap font-mono font-bold text-[#4A5D4E]">
                        {session.durationMinutes} دقيقة
                      </td>

                      <td className="p-3 max-w-xs">
                        <span className="font-bold text-[#2D3436] block">{session.subject}</span>
                        {session.progressNotes && (
                          <span className="text-[11px] text-[#5D6567] block mt-0.5 truncate">
                            {session.progressNotes}
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-[11px] text-[#5D6567] max-w-xs">
                        {session.homework ? (
                          <span className="truncate block">{session.homework}</span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="p-3 text-center whitespace-nowrap">
                        {session.rating ? (
                          <span className="inline-flex items-center gap-0.5 bg-[#FAF3E8] text-[#A67C52] px-2 py-0.5 rounded-full border border-[#E8D7C0] font-bold font-mono">
                            <span>{session.rating}</span>
                            <Star className="w-3 h-3 fill-[#A67C52] text-[#A67C52]" />
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="p-3 text-center whitespace-nowrap">
                        {session.status === 'completed' ? (
                          <span className="bg-[#EAE4D9] text-[#4A5D4E] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            مكتملة
                          </span>
                        ) : session.status === 'scheduled' ? (
                          <span className="bg-[#E4ECE6] text-[#36453A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            مجدولة
                          </span>
                        ) : (
                          <span className="bg-[#FAF0ED] text-[#C05746] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ملغية / غياب
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditSession(session)}
                            className="p-1 rounded-lg text-[#5D6567] hover:bg-[#EFE9DD] transition"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteSession(session.id)}
                            className="p-1 rounded-lg text-[#C05746] hover:bg-[#FAF0ED] transition"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Student Detailed Monthly Report Modal */}
      {reportStudent && (
        <StudentReportModal
          isOpen={!!reportStudent}
          onClose={() => setReportStudent(null)}
          student={reportStudent}
          monthStr={selectedMonth}
          sessions={sessions}
          settings={settings}
        />
      )}

    </div>
  );
};
