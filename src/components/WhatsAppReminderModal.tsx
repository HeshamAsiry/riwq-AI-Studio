import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Copy, Check, ExternalLink, Globe, Clock } from 'lucide-react';
import { Student, RecurringSlot, TeacherSettings } from '../types';
import { convertTeacherTimeToStudentTime, formatTime12 } from '../utils/timezones';
import { DAYS_ARABIC } from '../data/timezones';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  slot: RecurringSlot | null;
  settings: TeacherSettings;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  student,
  slot,
  settings,
}) => {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!student) return;

    const dayName = slot ? DAYS_ARABIC.find(d => d.index === slot.dayOfWeek)?.name : 'اليوم';
    const teacherTime = slot ? slot.teacherStartTime : '16:00';
    const duration = slot ? slot.durationMinutes : 60;
    const subject = slot ? slot.subject : student.subjectDetail;

    const conversion = convertTeacherTimeToStudentTime(
      teacherTime,
      settings.teacherTimeZone,
      student.timezone
    );

    const meetingLink = student.meetingLink || settings.meetingLink || 'سأرسل لك الرابط قبيل البدء';

    const defaultMsg = `السلام عليكم ورحمة الله وبركاته يا ${student.name} 🌹

نذكرك بموعد حلقتنا المباركة اليوم:
🗓️ اليوم: ${dayName}
⏰ التوقيت بتوقيتك (${student.country} ${student.countryFlag}): *${conversion.studentTime12}*
(الموافق ${formatTime12(teacherTime)} بتوقيتي في ${settings.teacherCountry})
⌛ مدة الحلقة: ${duration} دقيقة
📖 المقرر: ${subject}

🔗 رابط الدخول: ${meetingLink}

نسأل الله لك التوفيق والبركة والسداد.`;

    setMessage(defaultMsg);
  }, [student, slot, settings, isOpen]);

  if (!isOpen || !student) return null;

  const dayName = slot ? DAYS_ARABIC.find(d => d.index === slot.dayOfWeek)?.name : 'اليوم';
  const teacherTime = slot ? slot.teacherStartTime : '16:00';
  const conversion = convertTeacherTimeToStudentTime(
    teacherTime,
    settings.teacherTimeZone,
    student.timezone
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = student.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#E8E1D5] max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#36453A] text-[#FDFBF7] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-[#C8D7CC]" />
            <h3 className="font-bold text-base">رسالة تذكير بالموعد ومراعاة التوقيت</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#C8D7CC] hover:text-white p-1 rounded-lg hover:bg-[#2B382D] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-[#2D3436] text-sm">
          
          {/* Dual Time Summary info */}
          <div className="bg-[#F8F5EE] border border-[#E8E1D5] rounded-xl p-3 text-xs flex items-center justify-between">
            <div>
              <span className="text-[#5D6567] block">الطالب والدولة:</span>
              <strong className="text-[#2D3436] text-sm">
                {student.countryFlag} {student.name} ({student.country})
              </strong>
            </div>
            <div className="text-left font-mono">
              <div className="text-[#4A5D4E] font-bold">
                {conversion.studentTime12} (توقيت الطالب)
              </div>
              <div className="text-[#5D6567] text-[11px]">
                {formatTime12(teacherTime)} (توقيتك)
              </div>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1">
              نص رسالة التذكير المعدة تلقائياً:
            </label>
            <textarea
              rows={8}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-xs sm:text-sm font-sans focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none leading-relaxed text-[#2D3436]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-[#E8E1D5] flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="bg-[#F8F5EE] hover:bg-[#EAE5D9] text-[#2D3436] border border-[#D8CFBF] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-[#4A5D4E]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الرسالة'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="bg-[#4A5D4E] hover:bg-[#3D4D40] active:scale-95 text-[#FDFBF7] text-xs sm:text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>إرسال مباشرة عبر واتساب</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
