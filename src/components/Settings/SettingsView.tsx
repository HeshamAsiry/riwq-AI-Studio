import React, { useState } from 'react';
import { TeacherSettings } from '../../types';
import {
  Settings,
  Globe2,
  Clock,
  Video,
  MessageCircle,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Save,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { TIMEZONE_OPTIONS, DAYS_ARABIC } from '../../data/timezones';
import { exportAllData, importAllData, resetAllDataToDefaults } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';
import { Cloud, ShieldCheck, LogIn, LogOut, User as UserIcon } from 'lucide-react';

interface SettingsViewProps {
  settings: TeacherSettings;
  onSaveSettings: (settings: TeacherSettings) => void;
  onOpenAuthModal?: () => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onOpenAuthModal,
  onManualSync,
  isSyncing = false,
}) => {
  const { user, userProfile, signOut } = useAuth();
  const [formData, setFormData] = useState<TeacherSettings>({
    name: settings.name || '',
    teacherName: settings.teacherName || settings.name || '',
    title: settings.title || '',
    teacherCountry: settings.teacherCountry || settings.city || 'مصر',
    city: settings.city || settings.teacherCountry || 'مصر',
    teacherTimeZone: settings.teacherTimeZone || settings.timezone || 'Africa/Cairo',
    timezone: settings.timezone || settings.teacherTimeZone || 'Africa/Cairo',
    defaultSessionDuration: settings.defaultSessionDuration || 60,
    currency: settings.currency || 'USD',
    defaultHourlyRate: settings.defaultHourlyRate || 15,
    workingDays: settings.workingDays || [0, 1, 2, 3, 4, 6],
    workingHoursStart: settings.workingHoursStart || '10:00',
    workingHoursEnd: settings.workingHoursEnd || '23:00',
    meetingLink: settings.meetingLink || '',
    whatsappReminderTemplate:
      settings.whatsappReminderTemplate ||
      'السلام عليكم ورحمة الله وبركاته يا {student_name}، نذكرك بموعد حلقتنا المباركة اليوم الساعة {student_time} بتوقيتكم. رابط القاعة: {meeting_link}',
    whatsappPaymentTemplate:
      settings.whatsappPaymentTemplate ||
      'السلام عليكم ورحمة الله وبركاته، نود تذكيركم بمستحقات الشهر لحصص القرآن واللغة العربية للطالب {student_name}. نسأل الله أن يبارك فيكم.',
    whatsappMonthlyReportTemplate:
      settings.whatsappMonthlyReportTemplate ||
      'تقرير الإنجاز الشهري للطالب {student_name}: تم إنجاز {completed_hours} ساعة بنجاح مع تقدم متميز في الحفظ والتجويد.',
  });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'whatsapp' | 'backup'>('general');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: TeacherSettings = {
      ...formData,
      name: formData.teacherName || formData.name,
      teacherCountry: formData.city || formData.teacherCountry,
      teacherTimeZone: formData.timezone || formData.teacherTimeZone,
    };
    onSaveSettings(updatedSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleWorkingDay = (dayIndex: number) => {
    const current = formData.workingDays || [0, 1, 2, 3, 4, 6];
    if (current.includes(dayIndex)) {
      setFormData({ ...formData, workingDays: current.filter(d => d !== dayIndex) });
    } else {
      setFormData({ ...formData, workingDays: [...current, dayIndex].sort() });
    }
  };

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran_teacher_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        const success = importAllData(content);
        if (success) {
          alert('تم استيراد البيانات والنسخة الاحتياطية بنجاح! سيتم إعادة تحميل الصفحة.');
          window.location.reload();
        } else {
          alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من استعادة البيانات الافتراضية؟ سيتم مسح التغييرات الحالية.')) {
      resetAllDataToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header with Natural Tones */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#4A5D4E] text-xs font-bold mb-1">
            <Settings className="w-4 h-4" />
            <span>تهيئة النظام وتخصيص تجربة المعلم</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3436]">
            ⚙️ إعدادات المقرأة وحساب المعلم
          </h1>
          <p className="text-sm text-[#5D6567] mt-1 max-w-2xl">
            ضبط التوقيت والمنطقة الزمنية، ساعات وأيام العمل المتاحة للتدريس، منصة البث، قوالب رسائل واتساب، والنسخ الاحتياطي.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم حفظ الإعدادات بنجاح!</span>
          </div>
        )}
      </div>

      {/* 2. Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E1D5] pb-2">
        {[
          { id: 'general', label: '🌍 التوقيت والبيانات الأساسية' },
          { id: 'hours', label: '⏰ ساعات وأيام العمل والمنصات' },
          { id: 'whatsapp', label: '💬 قوالب رسائل واتساب' },
          { id: 'backup', label: '💾 النسخ الاحتياطي والاستيراد' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all ${
              activeTab === tab.id
                ? 'bg-[#4A5D4E] text-white shadow-xs'
                : 'text-[#5D6567] hover:bg-[#F8F5EE] hover:text-[#2D3436]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Settings Form */}
      <form onSubmit={handleSave}>
        {activeTab === 'general' && (
          <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-[#2D3436] flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-[#4A5D4E]" />
              <span>بيانات المعلم والتوقيت المرجعي</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1.5">اسم المعلم / الشيخ</label>
                <input
                  type="text"
                  required
                  value={formData.teacherName || ''}
                  onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1.5">الدولة والمدينة</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                  المنطقة الزمنية للمعلم (المرجع الزمني الأساسي)
                </label>
                <select
                  value={formData.timezone || 'Africa/Cairo'}
                  onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                >
                  {TIMEZONE_OPTIONS.map(tz => (
                    <option key={tz.id} value={tz.id}>
                      {tz.flag} {tz.name} ({tz.offset}) — {tz.country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1.5">العملة الافتراضية</label>
                <select
                  value={formData.currency || 'USD'}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                >
                  <option value="USD">دولار أمريكي (USD $)</option>
                  <option value="EUR">يورو (EUR €)</option>
                  <option value="GBP">جنيه إسترليني (GBP £)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                  <option value="EGP">جنيه مصري (EGP)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-[#2D3436] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#4A5D4E]" />
              <span>أوقات وساعات العمل المتاحة للتدريس</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1.5">بدء ساعات العمل اليومية</label>
                <input
                  type="time"
                  value={formData.workingHoursStart || '10:00'}
                  onChange={e => setFormData({ ...formData, workingHoursStart: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1.5">انتهاء ساعات العمل اليومية</label>
                <input
                  type="time"
                  value={formData.workingHoursEnd || '23:00'}
                  onChange={e => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#2D3436] mb-2">أيام العمل الأسبوعية المتاحة:</label>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  {DAYS_ARABIC.map(day => {
                    const isSelected = (formData.workingDays || [0, 1, 2, 3, 4, 6]).includes(day.index);
                    return (
                      <button
                        type="button"
                        key={day.index}
                        onClick={() => toggleWorkingDay(day.index)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#4A5D4E] text-white border-[#4A5D4E]'
                            : 'bg-[#FDFBF7] text-[#5D6567] border-[#E8E1D5] hover:bg-[#F8F5EE]'
                        }`}
                      >
                        {day.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                  رابط قاعة البث الافتراضي (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  value={formData.meetingLink || ''}
                  onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-[#2D3436] flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-700" />
              <span>قوالب رسائل واتساب الجاهزة</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">
                  1. قالب التذكير بموعد الحصة القادمة
                </label>
                <textarea
                  rows={3}
                  value={formData.whatsappReminderTemplate || ''}
                  onChange={e => setFormData({ ...formData, whatsappReminderTemplate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-xs focus:outline-none focus:border-[#4A5D4E] leading-relaxed"
                />
                <span className="text-[10px] text-[#8A9396]">
                  المتغيرات المتاحة: {'{student_name}'}, {'{student_time}'}, {'{meeting_link}'}, {'{teacher_name}'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">
                  2. قالب إشعار الفاتورة والمستحقات الشهرية
                </label>
                <textarea
                  rows={3}
                  value={formData.whatsappPaymentTemplate || ''}
                  onChange={e => setFormData({ ...formData, whatsappPaymentTemplate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-xs focus:outline-none focus:border-[#4A5D4E] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">
                  3. قالب تقرير الطالب الشهري
                </label>
                <textarea
                  rows={3}
                  value={formData.whatsappMonthlyReportTemplate || ''}
                  onChange={e => setFormData({ ...formData, whatsappMonthlyReportTemplate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-xs focus:outline-none focus:border-[#4A5D4E] leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Cloud Sync Status Banner */}
            <div className="bg-[#FDFBF7] border border-[#E8E1D5] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#4A5D4E]/10 text-[#4A5D4E] rounded-xl">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D3436]">
                    {user ? 'المزامنة السحابية النشطة (Firebase Firestore)' : 'المزامنة السحابية غير مفعلة'}
                  </h3>
                  <p className="text-xs text-[#5D6567]">
                    {user
                      ? `مرتبط بحساب: ${user.email} (${userProfile?.displayName || user.displayName || 'معلم'})`
                      : 'سجل دخولك ليتم حفظ وتحديث جداولك وبيانات طلابك تلقائياً في السحابة ومزامنتها بين أجهزتك.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {user ? (
                  <>
                    {onManualSync && (
                      <button
                        type="button"
                        onClick={onManualSync}
                        disabled={isSyncing}
                        className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#3D4C40] text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center gap-1.5"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة السحابة الآن'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition border border-rose-200"
                    >
                      تسجيل خروج
                    </button>
                  </>
                ) : (
                  onOpenAuthModal && (
                    <button
                      type="button"
                      onClick={onOpenAuthModal}
                      className="px-5 py-2.5 bg-[#D4A373] hover:bg-[#B5824C] text-[#2D3436] text-xs font-black rounded-xl transition shadow-2xs flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>تسجيل الدخول / إنشاء حساب</span>
                    </button>
                  )
                )}
              </div>
            </div>

            <h2 className="text-lg font-bold text-[#2D3436] flex items-center gap-2">
              <Download className="w-5 h-5 text-[#4A5D4E]" />
              <span>النسخ الاحتياطي المحلي وحفظ وتصدير البيانات</span>
            </h2>
            <p className="text-xs text-[#5D6567]">
              يمكنك تصدير ملف كامل يحتوي على جميع الطلاب والمواعيد وسجلات القرآن والمقررات والمدفوعات، أو استيراد نسخة سابقة.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <button
                type="button"
                onClick={handleExport}
                className="p-5 bg-[#FDFBF7] border border-[#E8E1D5] hover:border-[#4A5D4E] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group"
              >
                <Download className="w-6 h-6 text-[#4A5D4E] group-hover:scale-110 transition-transform" />
                <span className="font-bold text-xs text-[#2D3436]">تصدير نسخة احتياطية (JSON)</span>
                <span className="text-[10px] text-[#5D6567]">حفظ جميع البيانات محلياً</span>
              </button>

              <label className="p-5 bg-[#FDFBF7] border border-[#E8E1D5] hover:border-[#4A5D4E] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group">
                <Upload className="w-6 h-6 text-[#D4A373] group-hover:scale-110 transition-transform" />
                <span className="font-bold text-xs text-[#2D3436]">استيراد نسخة احتياطية</span>
                <span className="text-[10px] text-[#5D6567]">رفع ملف JSON سابق</span>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>

              <button
                type="button"
                onClick={handleReset}
                className="p-5 bg-[#FDFBF7] border border-[#E8E1D5] hover:border-rose-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group"
              >
                <RotateCcw className="w-6 h-6 text-rose-600 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-xs text-rose-700">استعادة الضبط الافتراضي</span>
                <span className="text-[10px] text-[#5D6567]">إعادة تحميل البيانات التجريبية</span>
              </button>
            </div>
          </div>
        )}

        {/* Save button footer */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>حفظ جميع التغييرات</span>
          </button>
        </div>
      </form>
    </div>
  );
};
