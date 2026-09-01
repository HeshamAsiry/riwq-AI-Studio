import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Star,
  BookOpen,
  FileText,
  DollarSign,
} from 'lucide-react';
import { Student, SessionRecord, RecurringSlot, TeacherSettings } from '../../types';
import confetti from 'canvas-confetti';

interface LogSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  settings: TeacherSettings;
  onSaveSession: (session: Omit<SessionRecord, 'id'>, editId?: string) => void;
  editingSession?: SessionRecord | null;
  preselectedSlot?: RecurringSlot | null;
  preselectedStudentId?: string;
}

export const LogSessionModal: React.FC<LogSessionModalProps> = ({
  isOpen,
  onClose,
  students,
  settings,
  onSaveSession,
  editingSession,
  preselectedSlot,
  preselectedStudentId,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [studentId, setStudentId] = useState<string>('');
  const [date, setDate] = useState<string>(todayStr);
  const [teacherStartTime, setTeacherStartTime] = useState<string>('16:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [status, setStatus] = useState<SessionRecord['status']>('completed');
  const [subject, setSubject] = useState<string>('');
  const [progressNotes, setProgressNotes] = useState<string>('');
  const [homework, setHomework] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [isPaid, setIsPaid] = useState<boolean>(true);

  useEffect(() => {
    if (editingSession) {
      setStudentId(editingSession.studentId);
      setDate(editingSession.date);
      setTeacherStartTime(editingSession.teacherStartTime);
      setDurationMinutes(editingSession.durationMinutes);
      setStatus(editingSession.status);
      setSubject(editingSession.subject);
      setProgressNotes(editingSession.progressNotes || '');
      setHomework(editingSession.homework || '');
      setRating(editingSession.rating || 5);
      setIsPaid(editingSession.isPaid ?? true);
    } else if (preselectedSlot) {
      setStudentId(preselectedSlot.studentId);
      setDate(todayStr);
      setTeacherStartTime(preselectedSlot.teacherStartTime);
      setDurationMinutes(preselectedSlot.durationMinutes);
      setStatus('completed');
      setSubject(preselectedSlot.subject);
      setProgressNotes('');
      setHomework('');
      setRating(5);
      setIsPaid(true);
    } else {
      const initialStudentId = preselectedStudentId || students[0]?.id || '';
      setStudentId(initialStudentId);
      setDate(todayStr);
      setTeacherStartTime('16:00');
      setDurationMinutes(settings.defaultSessionDuration || 60);
      setStatus('completed');
      const s = students.find(item => item.id === initialStudentId);
      setSubject(s ? s.subjectDetail : 'حلقة قرآنية');
      setProgressNotes('');
      setHomework('');
      setRating(5);
      setIsPaid(true);
    }
  }, [editingSession, preselectedSlot, preselectedStudentId, isOpen, students, settings.defaultSessionDuration]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      alert('يرجى تحديد الطالب');
      return;
    }

    onSaveSession(
      {
        studentId,
        date,
        teacherStartTime,
        durationMinutes,
        status,
        subject: subject.trim() || 'حصة تعليمية',
        progressNotes: progressNotes.trim(),
        homework: homework.trim(),
        rating,
        isPaid,
      },
      editingSession?.id
    );

    if (status === 'completed' && !editingSession) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {
        // Safe fallback
      }
    }

    onClose();
  };

  const selectedStudent = students.find(s => s.id === studentId);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#36453A] text-[#FDFBF7] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#C8D7CC]" />
            <h2 className="text-lg font-bold">
              {editingSession ? 'تعديل بيانات الحصة المسجلة' : 'تسجيل إنجاز وساعات حصة جديدة'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#C8D7CC] hover:text-white p-1 rounded-lg hover:bg-[#2B382D] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[#2D3436] text-sm bg-[#FDFBF7]">
          
          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#4A5D4E]" />
              <span>الطالب:</span>
            </label>
            <select
              value={studentId}
              onChange={e => {
                setStudentId(e.target.value);
                const s = students.find(stu => stu.id === e.target.value);
                if (s && !subject) setSubject(s.subjectDetail);
              }}
              className="w-full px-3 py-2.5 bg-white border border-[#D8CFBF] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none font-medium text-[#2D3436]"
              required
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.countryFlag} {s.name} ({s.country})
                </option>
              ))}
            </select>
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>تاريخ الحصة:</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>وقت البدء:</span>
              </label>
              <input
                type="time"
                value={teacherStartTime}
                onChange={e => setTeacherStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm font-mono font-bold text-[#2D3436] focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>المدة المستغرقة:</span>
              </label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              >
                <option value={30}>30 دقيقة (0.5 ساعة)</option>
                <option value={45}>45 دقيقة (0.75 ساعة)</option>
                <option value={60}>60 دقيقة (1.0 ساعة)</option>
                <option value={75}>75 دقيقة (1.25 ساعة)</option>
                <option value={90}>90 دقيقة (1.5 ساعة)</option>
                <option value={120}>120 دقيقة (2.0 ساعة)</option>
              </select>
            </div>
          </div>

          {/* Session Status & Star Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1">حالة الحصة:</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as SessionRecord['status'])}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              >
                <option value="completed">✅ تمت الحصة بنجاح</option>
                <option value="scheduled">⏳ مجدولة / قادمة</option>
                <option value="excused">🤝 اعتذار مسبق بعذر</option>
                <option value="absent">❌ غياب بدون إشعار</option>
                <option value="student_cancelled">⚠️ ألغاها الطالب</option>
                <option value="teacher_rescheduled">🔄 أُجلت من المعلم</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-[#A67C52]" />
                <span>تقييم أداء الطالب وتسميعه:</span>
              </label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-[#A67C52] text-[#A67C52]'
                          : 'text-[#D8CFBF] hover:text-[#C5A07D]'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-[#5D6567] mr-2">
                  {rating === 5 ? 'ممتاز جداً 🌟' : rating === 4 ? 'جيد جداً 👍' : rating === 3 ? 'جيد' : 'يحتاج مراجعة'}
                </span>
              </div>
            </div>
          </div>

          {/* Lesson Subject / Title */}
          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#4A5D4E]" />
              <span>عنوان الدرس أو المنهج:</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              placeholder="مثال: حفظ سورة النساء / النحو الواضح / تجويد"
            />
          </div>

          {/* Progress Notes */}
          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#4A5D4E]" />
              <span>ما تم إنجازه وتسميعه خلال الحصة:</span>
            </label>
            <textarea
              rows={2}
              value={progressNotes}
              onChange={e => setProgressNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              placeholder="مثال: تم تسميع الآيات 1-35 من سورة النساء، مع مراجعة أحكام الإخفاء الحقيقي وتفخيم الراء."
            />
          </div>

          {/* Homework Assignment */}
          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1">الواجب والتكليفات المطلوبة للحصة القادمة:</label>
            <input
              type="text"
              value={homework}
              onChange={e => setHomework(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              placeholder="مثال: حفظ الآيات 36-50 + مراجعة 5 أوجه من البقرة."
            />
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
              className="bg-[#4A5D4E] hover:bg-[#3D4D40] active:scale-95 text-[#FDFBF7] font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ سجل الحصة</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
