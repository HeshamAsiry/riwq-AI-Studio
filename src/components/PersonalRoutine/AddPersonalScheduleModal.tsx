import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  Check,
  X,
  Repeat,
  CalendarDays,
  Sparkles,
  Layers,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { PersonalScheduleItem, RecurrenceFrequency } from '../../types';
import { DAYS_ARABIC } from '../../data/timezones';

interface AddPersonalScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PersonalScheduleItem) => void;
  editingItem?: PersonalScheduleItem | null;
}

// Ordered starting from Saturday to Friday
const ORDERED_DAYS = [
  { index: 6, name: 'السبت', short: 'سبت' },
  { index: 0, name: 'الأحد', short: 'أحد' },
  { index: 1, name: 'الإثنين', short: 'إثنين' },
  { index: 2, name: 'الثلاثاء', short: 'ثلاثاء' },
  { index: 3, name: 'الأربعاء', short: 'أربعاء' },
  { index: 4, name: 'الخميس', short: 'خميس' },
  { index: 5, name: 'الجمعة', short: 'جمعة' },
];

const CATEGORY_OPTIONS = [
  { value: 'quran_hifz', label: '📖 ورد حفظ قرآن جديد', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'quran_revision', label: '🌿 مراجعة وتثبيت المحراب', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  { value: 'islamic_study', label: '📚 طلب علم شرعي ومدارسة متون', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { value: 'listening', label: '🎧 استماع وتدبر بأصوات القراء', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'preparation', label: '📝 تحضير وتجهيز دروس الطلاب', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'public_lesson', label: '🕌 درس عام / محاضرة', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { value: 'personal_task', label: '📌 موعد / مهمة شخصية', color: 'text-stone-700 bg-stone-50 border-stone-200' },
];

export const AddPersonalScheduleModal: React.FC<AddPersonalScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('quran_hifz');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('weekly');
  const [specificDate, setSpecificDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedDays, setSelectedDays] = useState<number[]>([0]); // Default Sunday
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('07:00');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
      setCategory(editingItem.category || editingItem.type || 'quran_hifz');
      
      const freq: RecurrenceFrequency =
        editingItem.frequency ||
        editingItem.recurrenceType ||
        (editingItem.specificDate ? 'once' : editingItem.isRecurring === false ? 'once' : 'weekly');
      setFrequency(freq);

      if (editingItem.specificDate) {
        setSpecificDate(editingItem.specificDate);
      } else {
        setSpecificDate(new Date().toISOString().slice(0, 10));
      }

      if (Array.isArray(editingItem.daysOfWeek) && editingItem.daysOfWeek.length > 0) {
        setSelectedDays(editingItem.daysOfWeek);
      } else if (typeof editingItem.dayOfWeek === 'number') {
        setSelectedDays([editingItem.dayOfWeek]);
      } else {
        setSelectedDays([0]);
      }

      setStartTime(editingItem.startTime || '06:00');
      setEndTime(editingItem.endTime || '07:00');
      setNotes(editingItem.notes || '');
    } else {
      // Reset defaults
      setTitle('');
      setCategory('quran_hifz');
      setFrequency('weekly');
      setSpecificDate(new Date().toISOString().slice(0, 10));
      setSelectedDays([0]);
      setStartTime('06:00');
      setEndTime('07:00');
      setNotes('');
    }
    setErrorMsg('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  // Toggle a day selection
  const toggleDay = (dayIdx: number) => {
    if (selectedDays.includes(dayIdx)) {
      if (selectedDays.length === 1) {
        setErrorMsg('يجب اختيار يوم واحد على الأقل للموعد الأسبوعي');
        return;
      }
      setErrorMsg('');
      setSelectedDays(selectedDays.filter(d => d !== dayIdx));
    } else {
      setErrorMsg('');
      setSelectedDays([...selectedDays, dayIdx].sort());
    }
  };

  // Helper to adjust end time based on duration preset
  const setDurationPreset = (minutes: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const endH = Math.floor((totalMinutes % (24 * 60)) / 60);
    const endM = totalMinutes % 60;
    setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
  };

  // Calculate current duration
  const startMin = parseInt(startTime.split(':')[0], 10) * 60 + parseInt(startTime.split(':')[1], 10);
  const endMin = parseInt(endTime.split(':')[0], 10) * 60 + parseInt(endTime.split(':')[1], 10);
  const duration = Math.max(15, endMin >= startMin ? endMin - startMin : 24 * 60 - startMin + endMin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('يرجى كتابة عنوان الموعد أو الورد');
      return;
    }

    if (frequency === 'weekly' && selectedDays.length === 0) {
      setErrorMsg('يرجى اختيار يوم واحد على الأقل في الجدول الأسبوعي');
      return;
    }

    if (frequency === 'once' && !specificDate) {
      setErrorMsg('يرجى اختيار تاريخ الموعد');
      return;
    }

    const item: PersonalScheduleItem = {
      id: editingItem ? editingItem.id : `sched-${Date.now()}`,
      title: title.trim(),
      category,
      type: category,
      frequency,
      recurrenceType: frequency,
      isRecurring: frequency !== 'once',
      dayOfWeek: frequency === 'weekly' ? selectedDays[0] : frequency === 'daily' ? 0 : undefined,
      daysOfWeek: frequency === 'weekly' ? selectedDays : frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : undefined,
      specificDate: frequency === 'once' ? specificDate : undefined,
      startTime,
      endTime,
      durationMinutes: duration,
      notes: notes.trim(),
      isActive: true,
      completedToday: editingItem?.completedToday || false,
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-fadeIn my-8 text-right font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#4A5D4E]/10 text-[#4A5D4E] rounded-2xl">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#2D3436]">
                {editingItem ? 'تعديل موعد في جدولي الشخصي' : 'إضافة موعد لجدولي الشخصي'}
              </h3>
              <p className="text-xs text-[#5D6567] mt-0.5">
                تحديد طبيعة الموعد (لمرة واحدة، يومياً، أو أسبوعياً بعدة أيام)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#5D6567] hover:text-[#2D3436] p-2 rounded-xl hover:bg-[#F8F5EE] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. Title */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
              عنوان الموعد / الورد الشخصي *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: ورد حفظ وتثبيت سورة هود، مراجعة زاد المستقنع..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm text-[#2D3436] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition"
            />
          </div>

          {/* 2. Category */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
              تصنيف النشاط
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm text-[#2D3436] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition"
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Recurrence / Frequency Selector (Once / Daily / Weekly) */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-2">
              تكرار الموعد في الجدول *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Option 1: Once */}
              <button
                type="button"
                onClick={() => setFrequency('once')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                  frequency === 'once'
                    ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 text-[#4A5D4E] font-extrabold shadow-xs'
                    : 'border-[#E8E1D5] bg-[#FDFBF7] text-[#5D6567] hover:border-[#4A5D4E]/40 font-medium'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="text-xs">لمرة واحدة</span>
                <span className="text-[10px] opacity-75">تاريخ محدد</span>
              </button>

              {/* Option 2: Daily */}
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                  frequency === 'daily'
                    ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 text-[#4A5D4E] font-extrabold shadow-xs'
                    : 'border-[#E8E1D5] bg-[#FDFBF7] text-[#5D6567] hover:border-[#4A5D4E]/40 font-medium'
                }`}
              >
                <Repeat className="w-5 h-5" />
                <span className="text-xs">يومياً</span>
                <span className="text-[10px] opacity-75">طوال الأسبوع</span>
              </button>

              {/* Option 3: Weekly Multi-Day */}
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                  frequency === 'weekly'
                    ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 text-[#4A5D4E] font-extrabold shadow-xs'
                    : 'border-[#E8E1D5] bg-[#FDFBF7] text-[#5D6567] hover:border-[#4A5D4E]/40 font-medium'
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                <span className="text-xs">أسبوعياً</span>
                <span className="text-[10px] opacity-75">أيام محددة</span>
              </button>
            </div>
          </div>

          {/* Conditional: Once Date Picker */}
          {frequency === 'once' && (
            <div className="p-4 bg-[#F8F5EE] border border-[#E8E1D5] rounded-2xl space-y-2 animate-fadeIn">
              <label className="block text-xs font-bold text-[#2D3436]">
                اختر تاريخ الموعد
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  required
                  value={specificDate}
                  onChange={e => setSpecificDate(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#E8E1D5] bg-white text-sm focus:outline-none focus:border-[#4A5D4E]"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSpecificDate(new Date().toISOString().slice(0, 10))}
                    className="px-2.5 py-1.5 bg-white border border-[#E8E1D5] hover:bg-[#FDFBF7] text-xs font-bold rounded-lg text-[#4A5D4E] transition"
                  >
                    اليوم
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setSpecificDate(tomorrow.toISOString().slice(0, 10));
                    }}
                    className="px-2.5 py-1.5 bg-white border border-[#E8E1D5] hover:bg-[#FDFBF7] text-xs font-bold rounded-lg text-[#4A5D4E] transition"
                  >
                    غداً
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-[#5D6567]">
                هذا الموعد سيظهر لمرة واحدة في التاريخ المحدد فقط ويحجز الوقت لمنع التعارض.
              </p>
            </div>
          )}

          {/* Conditional: Daily Info Banner */}
          {frequency === 'daily' && (
            <div className="p-3.5 bg-[#4A5D4E]/10 border border-[#4A5D4E]/20 rounded-2xl text-xs text-[#4A5D4E] flex items-center gap-2 animate-fadeIn">
              <Repeat className="w-4 h-4 shrink-0" />
              <span>
                <strong>موعد يومي ثابت:</strong> سيتكرر هذا الورد أو النشاط كل يوم طوال أيام الأسبوع (السبت - الجمعة).
              </span>
            </div>
          )}

          {/* Conditional: Weekly Multi-Day Selector */}
          {frequency === 'weekly' && (
            <div className="p-4 bg-[#F8F5EE] border border-[#E8E1D5] rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#2D3436]">
                  اختر أيام الأسبوع (يمكنك اختيار أكثر من يوم) *
                </label>
                <span className="text-[11px] font-bold text-[#4A5D4E]">
                  تم اختيار: {selectedDays.length} أيام
                </span>
              </div>

              {/* Day chips/toggle buttons */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {ORDERED_DAYS.map(day => {
                  const isSelected = selectedDays.includes(day.index);
                  return (
                    <button
                      key={day.index}
                      type="button"
                      onClick={() => toggleDay(day.index)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'bg-[#4A5D4E] border-[#4A5D4E] text-[#FDFBF7] shadow-xs scale-102'
                          : 'bg-white border-[#E8E1D5] text-[#5D6567] hover:border-[#4A5D4E]/40 hover:bg-[#FDFBF7]'
                      }`}
                    >
                      <span>{day.short}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <span className="w-3.5 h-3.5 block rounded-full border border-stone-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E8E1D5]/60 text-[11px]">
                <span className="text-[#5D6567] font-medium ml-1">تحديد سريع:</span>
                <button
                  type="button"
                  onClick={() => setSelectedDays([0, 1, 2, 3, 4])}
                  className="px-2 py-0.5 bg-white border border-[#E8E1D5] rounded-lg text-[#2D3436] hover:bg-[#FDFBF7] transition font-bold"
                >
                  أيام العمل (أحد-خميس)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDays([5, 6])}
                  className="px-2 py-0.5 bg-white border border-[#E8E1D5] rounded-lg text-[#2D3436] hover:bg-[#FDFBF7] transition font-bold"
                >
                  عطلة (جمعة وسبت)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDays([6, 1, 3])}
                  className="px-2 py-0.5 bg-white border border-[#E8E1D5] rounded-lg text-[#2D3436] hover:bg-[#FDFBF7] transition font-bold"
                >
                  سبت/إثنين/أربعاء
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDays([0, 2, 4])}
                  className="px-2 py-0.5 bg-white border border-[#E8E1D5] rounded-lg text-[#2D3436] hover:bg-[#FDFBF7] transition font-bold"
                >
                  أحد/ثلاثاء/خميس
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDays([0, 1, 2, 3, 4, 5, 6])}
                  className="px-2 py-0.5 bg-white border border-[#E8E1D5] rounded-lg text-[#2D3436] hover:bg-[#FDFBF7] transition font-bold"
                >
                  كل الأيام
                </button>
              </div>
            </div>
          )}

          {/* 4. Time Selection & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                من الساعة (البداية) *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm text-[#2D3436] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                إلى الساعة (النهاية) *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm text-[#2D3436] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Duration info & quick duration buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#FDFBF7] border border-[#EFE9DD] rounded-xl text-xs">
            <div className="flex items-center gap-1.5 text-[#4A5D4E] font-bold">
              <Clock className="w-4 h-4" />
              <span>المدة الإجمالية: {duration} دقيقة</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[#5D6567] ml-1">تحديد مدة:</span>
              {[30, 45, 60, 90].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationPreset(mins)}
                  className="px-2 py-0.5 bg-white border border-[#E8E1D5] hover:bg-[#F8F5EE] rounded text-[11px] font-bold text-[#2D3436] transition"
                >
                  {mins} د
                </button>
              ))}
            </div>
          </div>

          {/* 5. Notes */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
              ملاحظات إضافية (اختياري)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: مراجعة مع تفسير الآيات، تسميع للشيخ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm text-[#2D3436] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E1D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E8E1D5] text-xs font-bold text-[#5D6567] hover:bg-[#F8F5EE] transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3D4C40] text-[#FDFBF7] text-xs font-bold shadow-xs hover:shadow-sm transition"
            >
              {editingItem ? 'حفظ التعديلات' : 'إضافة الموعد للجدول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
