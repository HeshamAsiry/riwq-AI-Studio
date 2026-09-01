import React, { useState } from 'react';
import { X, Save, Globe, Clock, DollarSign, Video, Calendar } from 'lucide-react';
import { TeacherSettings } from '../types';
import { COMMON_TIMEZONES, DAYS_ARABIC } from '../data/timezones';

interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TeacherSettings;
  onSave: (newSettings: TeacherSettings) => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<TeacherSettings>({
    name: settings.name || '',
    title: settings.title || '',
    teacherCountry: settings.teacherCountry || 'مصر',
    teacherTimeZone: settings.teacherTimeZone || 'Africa/Cairo',
    defaultSessionDuration: settings.defaultSessionDuration || 60,
    currency: settings.currency || 'USD',
    defaultHourlyRate: settings.defaultHourlyRate || 15,
    workingDays: settings.workingDays || [0, 1, 2, 3, 4, 6],
    workingHoursStart: settings.workingHoursStart || '10:00',
    workingHoursEnd: settings.workingHoursEnd || '23:00',
    meetingLink: settings.meetingLink || '',
  });

  if (!isOpen) return null;

  const toggleDay = (dayIndex: number) => {
    setFormData(prev => {
      const exists = prev.workingDays.includes(dayIndex);
      return {
        ...prev,
        workingDays: exists
          ? prev.workingDays.filter(d => d !== dayIndex)
          : [...prev.workingDays, dayIndex].sort(),
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#E8E1D5] max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#36453A] text-[#FDFBF7] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-[#C8D7CC]" />
            <h2 className="text-lg font-bold">إعدادات المعلم والتوقيت المعتمد</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#C8D7CC] hover:text-white p-1 rounded-lg hover:bg-[#2B382D] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-[#2D3436]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Teacher Name */}
            <div>
              <label className="block text-xs font-semibold text-[#5D6567] mb-1">اسم المعلم / الشيخ</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none text-sm text-[#2D3436]"
                required
              />
            </div>

            {/* Teacher Title */}
            <div>
              <label className="block text-xs font-semibold text-[#5D6567] mb-1">الصفة / التخصص</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none text-sm text-[#2D3436]"
                placeholder="معلم القرآن الكريم واللغة العربية"
              />
            </div>

            {/* Teacher Country & Timezone (CRITICAL) */}
            <div className="md:col-span-2 bg-[#F8F5EE] border border-[#E8E1D5] rounded-xl p-4">
              <label className="block text-xs font-bold text-[#2D3436] mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#4A5D4E]" />
                <span>الدولة والمنطقة الزمنية المعتمدة لك (لحساب فروق التوقيت بدقة)</span>
              </label>
              <select
                value={formData.teacherTimeZone}
                onChange={e => {
                  const selectedTz = COMMON_TIMEZONES.find(t => t.id === e.target.value);
                  setFormData({
                    ...formData,
                    teacherTimeZone: e.target.value,
                    teacherCountry: selectedTz?.country || formData.teacherCountry,
                  });
                }}
                className="w-full px-3 py-2.5 bg-white border border-[#D8CFBF] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none text-sm font-medium text-[#2D3436]"
              >
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz.id} value={tz.id}>
                    {tz.flag} {tz.country} - {tz.name} ({tz.offset})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#4A5D4E] mt-2">
                * جميع المواعيد التي تدخلها في جدولك ستُعتبر بتوقيت هذه المنطقة، وسيقوم النظام تلقائياً بتحويلها وحسابها لطلابك حسب دولهم لمنع أي لبس أو تعارض.
              </p>
            </div>

            {/* Default Session Duration */}
            <div>
              <label className="block text-xs font-semibold text-[#5D6567] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>المدة الافتراضية للحصة (بالدقائق)</span>
              </label>
              <select
                value={formData.defaultSessionDuration}
                onChange={e => setFormData({ ...formData, defaultSessionDuration: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              >
                <option value={30}>30 دقيقة (نصف ساعة)</option>
                <option value={45}>45 دقيقة</option>
                <option value={60}>60 دقيقة (ساعة كاملة)</option>
                <option value={90}>90 دقيقة (ساعة ونصف)</option>
                <option value={120}>120 دقيقة (ساعتان)</option>
              </select>
            </div>

            {/* Currency & Default Rate */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#5D6567] mb-1">العملة</label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                >
                  <option value="USD">دولار أمريكي ($)</option>
                  <option value="SAR">ريال سعودي (ر.س)</option>
                  <option value="EGP">جنيه مصري (ج.م)</option>
                  <option value="AED">درهم إماراتي (د.إ)</option>
                  <option value="EUR">يورو (€)</option>
                  <option value="GBP">جنيه إسترليني (£)</option>
                  <option value="KWD">دينار كويتي (د.ك)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5D6567] mb-1">أجر الساعة</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.defaultHourlyRate}
                  onChange={e => setFormData({ ...formData, defaultHourlyRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                />
              </div>
            </div>

            {/* Daily Teaching Window Start & End */}
            <div>
              <label className="block text-xs font-semibold text-[#5D6567] mb-1">بداية فترات التدريس اليومية</label>
              <input
                type="time"
                value={formData.workingHoursStart}
                onChange={e => setFormData({ ...formData, workingHoursStart: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5D6567] mb-1">نهاية فترات التدريس اليومية</label>
              <input
                type="time"
                value={formData.workingHoursEnd}
                onChange={e => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              />
            </div>

            {/* Default Online Meeting Link */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#5D6567] mb-1 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>رابط الغرفة الافتراضية للحلقات (Zoom أو Google Meet أو Telegram)</span>
              </label>
              <input
                type="url"
                value={formData.meetingLink || ''}
                onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/... أو https://zoom.us/j/..."
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              />
            </div>

            {/* Working Days */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#5D6567] mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>أيام التدريس الأسبوعية المعتمدة:</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_ARABIC.map(day => {
                  const isSelected = formData.workingDays.includes(day.index);
                  return (
                    <button
                      key={day.index}
                      type="button"
                      onClick={() => toggleDay(day.index)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#4A5D4E] text-[#FDFBF7] border-[#4A5D4E] shadow-xs'
                          : 'bg-white text-[#5D6567] border-[#E8E1D5] hover:bg-[#F8F5EE]'
                      }`}
                    >
                      {day.name}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[#E8E1D5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#5D6567] hover:text-[#2D3436] text-sm font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-[#4A5D4E] hover:bg-[#3D4D40] active:scale-95 text-[#FDFBF7] text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
