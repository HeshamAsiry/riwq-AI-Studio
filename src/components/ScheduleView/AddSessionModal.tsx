import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Plus,
  BookOpen,
} from 'lucide-react';
import {
  Student,
  RecurringSlot,
  TeacherSettings,
  TimeConflict,
  SessionRecord,
} from '../../types';
import { DAYS_ARABIC } from '../../data/timezones';
import {
  convertTeacherTimeToStudentTime,
  formatTime12,
} from '../../utils/timezones';
import {
  checkRecurringSlotConflict,
  suggestNextAvailableTime,
} from '../../utils/conflictDetector';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  settings: TeacherSettings;
  existingSlots: RecurringSlot[];
  onSaveSlot: (slot: Omit<RecurringSlot, 'id'>, editId?: string) => void;
  editingSlot?: RecurringSlot | null;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
  isOpen,
  onClose,
  students,
  settings,
  existingSlots,
  onSaveSlot,
  editingSlot,
}) => {
  const [studentId, setStudentId] = useState<string>(
    editingSlot?.studentId || students[0]?.id || ''
  );
  const [dayOfWeek, setDayOfWeek] = useState<number>(
    editingSlot?.dayOfWeek ?? 0
  );
  const [teacherStartTime, setTeacherStartTime] = useState<string>(
    editingSlot?.teacherStartTime || '16:00'
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    editingSlot?.durationMinutes || settings.defaultSessionDuration || 60
  );
  const [subject, setSubject] = useState<string>(
    editingSlot?.subject || ''
  );
  const [active, setActive] = useState<boolean>(
    editingSlot?.active ?? true
  );

  // Initialize or update fields when editingSlot changes
  useEffect(() => {
    if (editingSlot) {
      setStudentId(editingSlot.studentId);
      setDayOfWeek(editingSlot.dayOfWeek);
      setTeacherStartTime(editingSlot.teacherStartTime);
      setDurationMinutes(editingSlot.durationMinutes);
      setSubject(editingSlot.subject);
      setActive(editingSlot.active);
    } else {
      setStudentId(students[0]?.id || '');
      setDayOfWeek(0);
      setTeacherStartTime('16:00');
      setDurationMinutes(settings.defaultSessionDuration || 60);
      const firstStudent = students[0];
      setSubject(firstStudent ? firstStudent.subjectDetail : 'حفظ ومراجعة القرآن الكريم');
      setActive(true);
    }
  }, [editingSlot, isOpen, students, settings.defaultSessionDuration]);

  // When student changes, default subject to student's subjectDetail if empty
  const handleStudentChange = (newStudentId: string) => {
    setStudentId(newStudentId);
    const stu = students.find(s => s.id === newStudentId);
    if (stu && (!subject || subject === 'حفظ ومراجعة القرآن الكريم')) {
      setSubject(stu.subjectDetail);
    }
  };

  const selectedStudent = students.find(s => s.id === studentId);

  // Live conversion to student's timezone
  const studentConversion = selectedStudent
    ? convertTeacherTimeToStudentTime(
        teacherStartTime,
        settings.teacherTimeZone,
        selectedStudent.timezone
      )
    : null;

  // Real-time conflict checking
  const conflict: TimeConflict | null = checkRecurringSlotConflict(
    {
      id: editingSlot?.id,
      studentId,
      dayOfWeek,
      teacherStartTime,
      durationMinutes,
    },
    existingSlots,
    students
  );

  // Suggested free slots if conflict occurs or to help teacher pick
  const suggestedSlots = suggestNextAvailableTime(
    dayOfWeek,
    durationMinutes,
    existingSlots,
    settings.workingHoursStart,
    settings.workingHoursEnd
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      alert('يرجى اختيار الطالب');
      return;
    }

    onSaveSlot(
      {
        studentId,
        dayOfWeek,
        teacherStartTime,
        durationMinutes,
        subject: subject.trim() || 'حلقة قرآنية',
        active,
      },
      editingSlot?.id
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#36453A] text-[#FDFBF7] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-[#C8D7CC]" />
            <h2 className="text-lg font-bold">
              {editingSlot ? 'تعديل موعد الحلقة الأسبوعية' : 'إضافة موعد حلقة أسبوعية جديدة'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#C8D7CC] hover:text-white p-1 rounded-lg hover:bg-[#2B382D] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[#2D3436] text-sm bg-[#FDFBF7]">
          
          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#4A5D4E]" />
              <span>اختر الطالب:</span>
            </label>
            <select
              value={studentId}
              onChange={e => handleStudentChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#D8CFBF] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none font-medium"
              required
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.countryFlag} {s.name} ({s.country} - {s.timezone.split('/')[1] || s.timezone})
                </option>
              ))}
            </select>
          </div>

          {/* Day of Week Selector */}
          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#4A5D4E]" />
              <span>يوم الحلقة:</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {DAYS_ARABIC.map(day => {
                const isSelected = dayOfWeek === day.index;
                return (
                  <button
                    key={day.index}
                    type="button"
                    onClick={() => setDayOfWeek(day.index)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#4A5D4E] text-[#FDFBF7] shadow-xs'
                        : 'bg-[#F8F5EE] text-[#5D6567] border border-[#E8E1D5] hover:bg-[#EFE9DD]'
                    }`}
                  >
                    {day.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#4A5D4E]" />
                <span>توقيت البداية (بتوقيتك: {settings.teacherCountry})</span>
              </label>
              <input
                type="time"
                value={teacherStartTime}
                onChange={e => setTeacherStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none font-mono text-base font-bold text-[#2D3436]"
                required
              />
              <span className="text-[11px] text-[#78716C] mt-1 block">
                {formatTime12(teacherStartTime)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#4A5D4E]" />
                <span>مدة الحلقة:</span>
              </label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              >
                <option value={30}>30 دقيقة</option>
                <option value={45}>45 دقيقة</option>
                <option value={60}>60 دقيقة (ساعة)</option>
                <option value={90}>90 دقيقة (ساعة ونصف)</option>
                <option value={120}>120 دقيقة (ساعتان)</option>
              </select>
            </div>
          </div>

          {/* Live Dual-Time Info Box */}
          {selectedStudent && studentConversion && (
            <div className="bg-[#F8F5EE] border border-[#E8E1D5] rounded-xl p-3.5 flex items-center justify-between text-xs text-[#2D3436]">
              <div>
                <div className="font-bold flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>توقيت الطالب ({selectedStudent.name}):</span>
                </div>
                <div className="text-[#5D6567] mt-0.5">
                  الدولة: {selectedStudent.country} {selectedStudent.countryFlag} ({studentConversion.offsetDescription})
                </div>
              </div>
              <div className="text-left">
                <span className="text-base font-extrabold text-[#A67C52] font-mono">
                  {studentConversion.studentTime12}
                </span>
                {studentConversion.dayOffset !== 0 && (
                  <span className="block text-[10px] font-bold text-[#C05746]">
                    {studentConversion.dayOffset > 0 ? 'اليوم التالي' : 'اليوم السابق'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Conflict Alert in Modal if detected! */}
          {conflict && (
            <div className="bg-[#FAF0ED] border-2 border-[#E08F81] rounded-xl p-3 text-[#6B2020] text-xs">
              <div className="flex items-center gap-2 font-bold text-[#521919] mb-1">
                <AlertTriangle className="w-4 h-4 text-[#C05746] shrink-0" />
                <span>تحذير: هذا الموعد يتعارض مع موعد آخر مسجل!</span>
              </div>
              <p className="text-[#7A2B2B]">{conflict.details}</p>

              {/* Suggestions */}
              {suggestedSlots.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#E9C3BC]">
                  <span className="font-semibold text-[#521919] block mb-1">
                    أوقات متاحة وغير متعارضة في نفس اليوم:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedSlots.map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setTeacherStartTime(time)}
                        className="bg-white hover:bg-[#F4EFE6] border border-[#D8CFBF] text-[#4A5D4E] font-mono font-bold px-2 py-1 rounded text-xs transition"
                      >
                        {formatTime12(time)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subject / Details */}
          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#4A5D4E]" />
              <span>محتوى الحصة / المنهج المقرر:</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              placeholder="مثال: حفظ سورة النساء + مراجعة البقرة وتطبيق التجويد"
            />
          </div>

          {/* Active status toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="activeSlot"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="w-4 h-4 text-[#4A5D4E] rounded focus:ring-[#4A5D4E] accent-[#4A5D4E]"
            />
            <label htmlFor="activeSlot" className="text-xs font-medium text-[#5D6567]">
              الموعد مفعل ونشط في الجدول الأسبوعي
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#5D6567] hover:text-[#2D3436] text-sm font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-bold text-sm text-[#FDFBF7] shadow-sm flex items-center gap-1.5 transition ${
                conflict
                  ? 'bg-[#A67C52] hover:bg-[#8F673E]'
                  : 'bg-[#4A5D4E] hover:bg-[#3D4D40]'
              }`}
            >
              {conflict ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{conflict ? 'حفظ رغم التداخل' : 'حفظ الموعد'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
