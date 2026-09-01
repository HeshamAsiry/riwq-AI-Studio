import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Globe,
  Clock,
  BookOpen,
  Edit2,
  Trash2,
  MessageSquare,
  FileText,
  Calendar,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { Student, RecurringSlot, SessionRecord, TeacherSettings } from '../../types';
import { SUBJECT_LABELS, DAYS_ARABIC } from '../../data/timezones';
import { convertTeacherTimeToStudentTime, formatTime12 } from '../../utils/timezones';
import { StudentReportModal } from '../MonthlyHours/StudentReportModal';

interface StudentsListProps {
  students: Student[];
  slots: RecurringSlot[];
  sessions: SessionRecord[];
  settings: TeacherSettings;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onOpenWhatsAppReminder: (slot: RecurringSlot | null, student: Student) => void;
  onQuickLogSession: (studentId: string) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  students = [],
  slots = [],
  sessions = [],
  settings,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenWhatsAppReminder,
  onQuickLogSession,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReportStudent, setSelectedReportStudent] = useState<Student | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const filteredStudents = students.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.subjectDetail.toLowerCase().includes(q) ||
        s.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Actions Bar */}
      <div className="bg-[#F8F5EE] rounded-2xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#2D3436] font-quran">
              سجل وبيانات الطلاب
            </h2>
            <span className="bg-[#EAE4D9] text-[#4A5D4E] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {students.length} طالب مسجل
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5D6567] mt-0.5">
            إدارة بيانات الطلاب، المناطق الزمنية، المناهج المقررة، والتواصل المباشر.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#78716C] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو الدولة..."
              className="w-full pl-3 pr-9 py-2 bg-[#FDFBF7] border border-[#D8CFBF] rounded-xl text-xs text-[#2D3436] focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none transition"
            />
          </div>

          {/* Add Student Button */}
          <button
            onClick={onAddStudent}
            className="bg-[#4A5D4E] hover:bg-[#3D4D40] active:scale-95 text-[#FDFBF7] font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل طالب جديد</span>
          </button>
        </div>
      </div>

      {/* Students Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-[#F8F5EE] rounded-2xl border border-[#E8E1D5] p-12 text-center text-[#78716C] text-xs">
          لا يوجد طلاب مطابقين للبحث.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => {
            const studentSlots = slots.filter(s => s.studentId === student.id && s.active);
            const studentMonthSessions = sessions.filter(
              s => s.studentId === student.id && s.date.startsWith(currentMonth) && s.status === 'completed'
            );
            const completedMinutes = studentMonthSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
            const completedHours = completedMinutes / 60;
            const targetHours = student.monthlyTargetHours || 8;
            const percentage = Math.min(100, Math.round((completedHours / targetHours) * 100));

            const tzConversion = convertTeacherTimeToStudentTime(
              '16:00',
              settings.teacherTimeZone,
              student.timezone
            );

            return (
              <div
                key={student.id}
                className="bg-[#FDFBF7] rounded-2xl border border-[#E8E1D5] p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
                style={{ borderTopColor: student.color || '#4A5D4E', borderTopWidth: '4px' }}
              >
                <div>
                  {/* Card Top: Flag, Name, Subject */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{student.countryFlag}</span>
                      <div>
                        <h3 className="font-bold text-[#2D3436] text-sm sm:text-base leading-tight font-quran">
                          {student.name}
                        </h3>
                        <span className="text-xs text-[#5D6567] font-medium">
                          {student.country} • {student.level}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditStudent(student)}
                        className="p-1 rounded-lg text-[#78716C] hover:text-[#2D3436] hover:bg-[#EAE4D9] transition"
                        title="تعديل بيانات الطالب"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteStudent(student.id)}
                        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                        title="حذف الطالب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Course / Subject Detail */}
                  <div className="bg-[#F8F5EE] rounded-xl p-2.5 border border-[#E8E1D5] mb-3 text-xs">
                    <span className="text-[#78716C] block text-[11px]">المقرر الدراسي:</span>
                    <strong className="text-[#2D3436] font-medium block mt-0.5">
                      📖 {student.subjectDetail}
                    </strong>
                  </div>

                  {/* Timezone & WhatsApp bar */}
                  <div className="space-y-1.5 text-xs text-[#5D6567] mb-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[#78716C]">
                        <Globe className="w-3.5 h-3.5 text-[#4A5D4E]" />
                        المنطقة وفارق التوقيت:
                      </span>
                      <strong className="text-[#2D3436] text-[11px] font-mono">
                        {tzConversion.offsetDescription}
                      </strong>
                    </div>

                    {student.phone && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#78716C]">
                          <Phone className="w-3.5 h-3.5 text-[#4A5D4E]" />
                          الواتساب:
                        </span>
                        <a
                          href={`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[#4A5D4E] hover:underline text-[11px] font-bold dir-ltr inline-flex items-center gap-1"
                        >
                          <span>{student.phone}</span>
                          <ExternalLink className="w-3 h-3 text-[#4A5D4E]" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Recurring Slots List */}
                  <div className="bg-[#F8F5EE] rounded-xl p-2.5 border border-[#E8E1D5] mb-3 text-xs">
                    <span className="text-[#5D6567] block text-[11px] mb-1 font-bold">
                      المواعيد الأسبوعية المعتمدة ({studentSlots.length}):
                    </span>
                    {studentSlots.length === 0 ? (
                      <span className="text-[#78716C] text-[11px]">لا توجد مواعيد أسبوعية محددة</span>
                    ) : (
                      <div className="space-y-1">
                        {studentSlots.map(slot => {
                          const day = DAYS_ARABIC.find(d => d.index === slot.dayOfWeek)?.name;
                          const sTime = convertTeacherTimeToStudentTime(
                            slot.teacherStartTime,
                            settings.teacherTimeZone,
                            student.timezone
                          );
                          return (
                            <div
                              key={slot.id}
                              className="bg-[#FDFBF7] px-2 py-1 rounded border border-[#E8E1D5] text-[11px] flex items-center justify-between"
                            >
                              <span className="font-bold text-[#2D3436]">
                                {day} ({formatTime12(slot.teacherStartTime)})
                              </span>
                              <span className="text-[#A67C52] font-mono font-medium">
                                {sTime.studentTime12} عنده
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Monthly Hours Mini Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#78716C]">ساعات هذا الشهر:</span>
                      <span className="font-mono font-bold text-[#2D3436] text-xs">
                        <strong className="text-[#4A5D4E]">{completedHours.toFixed(1)}</strong> / {targetHours} ساعة
                      </span>
                    </div>
                    <div className="w-full bg-[#E8E1D5] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#4A5D4E] h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-[#E8E1D5] flex flex-wrap items-center justify-between gap-1.5 text-xs">
                  <button
                    onClick={() => onOpenWhatsAppReminder(studentSlots[0] || null, student)}
                    className="bg-[#EAE4D9] hover:bg-[#DDD6C8] text-[#4A5D4E] font-bold px-2.5 py-1.5 rounded-lg border border-[#D8CFBF] flex items-center gap-1 transition"
                    title="إرسال تذكير بالموعد ومراعاة التوقيت عبر واتساب"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>تذكير بالموعد</span>
                  </button>

                  <button
                    onClick={() => setSelectedReportStudent(student)}
                    className="bg-[#F8F5EE] hover:bg-[#EAE4D9] text-[#2D3436] font-medium px-2.5 py-1.5 rounded-lg border border-[#E8E1D5] flex items-center gap-1 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#5D6567]" />
                    <span>كشف الحساب</span>
                  </button>

                  <button
                    onClick={() => onQuickLogSession(student.id)}
                    className="bg-[#4A5D4E] hover:bg-[#3D4D40] text-[#FDFBF7] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs"
                    title="تسجيل إنجاز حصة"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تسجيل حصة</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Student Monthly Report Modal */}
      {selectedReportStudent && (
        <StudentReportModal
          isOpen={!!selectedReportStudent}
          onClose={() => setSelectedReportStudent(null)}
          student={selectedReportStudent}
          monthStr={currentMonth}
          sessions={sessions}
          settings={settings}
        />
      )}

    </div>
  );
};
