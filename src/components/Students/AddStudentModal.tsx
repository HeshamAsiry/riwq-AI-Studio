import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Globe,
  Phone,
  BookOpen,
  Clock,
  DollarSign,
  Save,
  Video,
} from 'lucide-react';
import { Student, SubjectType, TeacherSettings } from '../../types';
import { COMMON_TIMEZONES, SUBJECT_LABELS } from '../../data/timezones';
import { convertTeacherTimeToStudentTime } from '../../utils/timezones';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStudent: (student: Omit<Student, 'id'>, editId?: string) => void;
  editingStudent?: Student | null;
  settings: TeacherSettings;
}

const BADGE_COLORS = [
  '#4A5D4E', // Sage Forest Green
  '#A67C52', // Warm Leather Brown
  '#5B7065', // Muted Olive
  '#8C6D4F', // Earth Clay
  '#3D5A6C', // Slate Blue
  '#9E5A44', // Terracotta
  '#625261', // Dusty Plum
  '#7A6F5D', // Warm Khaki
];

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSaveStudent,
  editingStudent,
  settings,
}) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('Europe/London');
  const [country, setCountry] = useState<string>('بريطانيا');
  const [countryFlag, setCountryFlag] = useState<string>('🇬🇧');
  const [subject, setSubject] = useState<SubjectType>('quran_memorization');
  const [subjectDetail, setSubjectDetail] = useState<string>('');
  const [level, setLevel] = useState<string>('متوسط');
  const [monthlyTargetHours, setMonthlyTargetHours] = useState<number>(8);
  const [hourlyRate, setHourlyRate] = useState<number>(settings.defaultHourlyRate || 15);
  const [preferredPlatform, setPreferredPlatform] = useState<Student['preferredPlatform']>('zoom');
  const [meetingLink, setMeetingLink] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<Student['status']>('active');
  const [color, setColor] = useState<string>(BADGE_COLORS[0]);

  useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name);
      setPhone(editingStudent.phone);
      setTimezone(editingStudent.timezone);
      setCountry(editingStudent.country);
      setCountryFlag(editingStudent.countryFlag);
      setSubject(editingStudent.subject);
      setSubjectDetail(editingStudent.subjectDetail);
      setLevel(editingStudent.level);
      setMonthlyTargetHours(editingStudent.monthlyTargetHours);
      setHourlyRate(editingStudent.hourlyRate || settings.defaultHourlyRate || 15);
      setPreferredPlatform(editingStudent.preferredPlatform);
      setMeetingLink(editingStudent.meetingLink || '');
      setNotes(editingStudent.notes || '');
      setStatus(editingStudent.status);
      setColor(editingStudent.color || BADGE_COLORS[0]);
    } else {
      setName('');
      setPhone('');
      setTimezone('Europe/London');
      setCountry('بريطانيا');
      setCountryFlag('🇬🇧');
      setSubject('quran_memorization');
      setSubjectDetail('');
      setLevel('متوسط');
      setMonthlyTargetHours(8);
      setHourlyRate(settings.defaultHourlyRate || 15);
      setPreferredPlatform('zoom');
      setMeetingLink(settings.meetingLink || '');
      setNotes('');
      setStatus('active');
      setColor(BADGE_COLORS[Math.floor(Math.random() * BADGE_COLORS.length)]);
    }
  }, [editingStudent, isOpen, settings]);

  if (!isOpen) return null;

  const handleTimezoneChange = (tzId: string) => {
    setTimezone(tzId);
    const found = COMMON_TIMEZONES.find(t => t.id === tzId);
    if (found) {
      setCountry(found.country);
      setCountryFlag(found.flag);
    }
  };

  const previewConversion = convertTeacherTimeToStudentTime(
    '16:00',
    settings.teacherTimeZone,
    timezone
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى إدخال اسم الطالب');
      return;
    }

    onSaveStudent(
      {
        name: name.trim(),
        phone: phone.trim(),
        country,
        countryFlag,
        timezone,
        subject,
        subjectDetail: subjectDetail.trim() || SUBJECT_LABELS[subject]?.label || 'حلقة قرآنية',
        level,
        monthlyTargetHours,
        hourlyRate,
        preferredPlatform,
        meetingLink: meetingLink.trim(),
        notes: notes.trim(),
        status,
        joinedDate: editingStudent?.joinedDate || new Date().toISOString().slice(0, 10),
        color,
      },
      editingStudent?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#E8E1D5] max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#36453A] text-[#FDFBF7] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-[#C8D7CC]" />
            <h2 className="text-lg font-bold">
              {editingStudent ? 'تعديل بيانات الطالب' : 'تسجيل طالب جديد'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#C8D7CC] hover:text-white p-1 rounded-lg hover:bg-[#2B382D] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[#2D3436] text-sm">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Student Name */}
            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1">اسم الطالب:</label>
              <input
                type="text"
                value={name || ''}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none font-semibold text-[#2D3436]"
                placeholder="مثال: عمر أحمد، مريم خالد..."
                required
              />
            </div>

            {/* WhatsApp Phone */}
            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>رقم هاتف الواتساب (مع كود الدولة):</span>
              </label>
              <input
                type="tel"
                value={phone || ''}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl font-mono text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                placeholder="+447911123456 أو +966501234567"
              />
            </div>

            {/* Student Country & Timezone */}
            <div className="md:col-span-2 bg-[#F8F5EE] border border-[#E8E1D5] rounded-xl p-3.5">
              <label className="block text-xs font-bold text-[#2D3436] mb-1 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#4A5D4E]" />
                <span>بلد الطالب والمنطقة الزمنية (لحساب فارق التوقيت تلقائياً):</span>
              </label>
              <select
                value={timezone || 'Europe/London'}
                onChange={e => handleTimezoneChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              >
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz.id} value={tz.id}>
                    {tz.flag} {tz.country} - {tz.name} ({tz.offset})
                  </option>
                ))}
              </select>

              <div className="text-xs text-[#4A5D4E] mt-2 flex items-center justify-between">
                <span>فارق التوقيت معك: <strong>{previewConversion.offsetDescription}</strong></span>
                <span className="text-[#5D6567]">(مثال: 04:00 م عندك = {previewConversion.studentTime12} عند الطالب)</span>
              </div>
            </div>

            {/* Subject Type & Detail */}
            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1">المسار التعليمي:</label>
              <select
                value={subject || 'quran_memorization'}
                onChange={e => setSubject(e.target.value as SubjectType)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              >
                <option value="quran_memorization">📖 حفظ القرآن الكريم</option>
                <option value="quran_recitation_tajweed">🎙️ تلاوة وتجويد وإتقان</option>
                <option value="arabic_language">📚 اللغة العربية وقواعدها</option>
                <option value="islamic_studies">🕌 دراسات وعلوم شرعية</option>
                <option value="mixed">✨ قرآن + لغة عربية</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1">مستوى الطالب:</label>
              <select
                value={level || 'متوسط'}
                onChange={e => setLevel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              >
                <option value="مبتدئ">مبتدئ (تأسيس وقاعدة نورانية)</option>
                <option value="متوسط">متوسط</option>
                <option value="متقدم">متقدم</option>
                <option value="خاتم">خاتم للقرآن</option>
                <option value="طالب إجازة">طالب إجازة وسند متصل</option>
                <option value="ناشئة وأطفال">ناشئة وأطفال</option>
              </select>
            </div>

            {/* Subject Detail Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#5D6567] mb-1">تفاصيل المنهج والسورة المقررة:</label>
              <input
                type="text"
                value={subjectDetail || ''}
                onChange={e => setSubjectDetail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                placeholder="مثال: حفظ سورة البقرة + دراسة كتاب النحو الواضح"
              />
            </div>

            {/* Target Hours & Hourly Rate */}
            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>الهدف الشهري للساعات:</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={monthlyTargetHours ?? 8}
                onChange={e => setMonthlyTargetHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl font-mono text-sm font-bold text-[#2D3436] focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>أجر الساعة ({settings.currency || 'USD'}):</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hourlyRate ?? (settings.defaultHourlyRate || 15)}
                onChange={e => setHourlyRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl font-mono text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              />
            </div>

            {/* Preferred Meeting Platform & Link */}
            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1">المنصة المفضلة:</label>
              <select
                value={preferredPlatform || 'zoom'}
                onChange={e => setPreferredPlatform(e.target.value as Student['preferredPlatform'])}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              >
                <option value="zoom">Zoom</option>
                <option value="google_meet">Google Meet</option>
                <option value="whatsapp">WhatsApp Call</option>
                <option value="telegram">Telegram</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1">رابط الغرفة الخاص بالطالب:</label>
              <input
                type="url"
                value={meetingLink || ''}
                onChange={e => setMeetingLink(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                placeholder="https://..."
              />
            </div>

            {/* Badge Color for Calendar */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#5D6567] mb-1.5">لون تمييز الطالب في الجدول:</label>
              <div className="flex items-center gap-2">
                {BADGE_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-[#4A5D4E] ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#5D6567] mb-1">ملاحظات إضافية عن الطالب:</label>
              <textarea
                rows={2}
                value={notes || ''}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                placeholder="ملاحظات حول طريقة الحفظ، نقاط القوة والضعف..."
              />
            </div>

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
              <Save className="w-4 h-4" />
              <span>حفظ بيانات الطالب</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
