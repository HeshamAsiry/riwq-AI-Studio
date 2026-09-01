import React, { useState, useEffect } from 'react';
import {
  Clock,
  Globe,
  Settings,
  BookOpen,
  Calendar,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Bell,
} from 'lucide-react';
import { TeacherSettings, Student, SessionRecord, QuranPersonalGoal } from '../types';
import { exportAllData, importAllData, resetAllDataToDefaults } from '../utils/storage';
import { UserMenu } from './Auth/UserMenu';

interface HeaderProps {
  settings: TeacherSettings;
  onOpenSettings: () => void;
  students: Student[];
  sessions: SessionRecord[];
  quranGoals: QuranPersonalGoal[];
  onDataRefreshed: () => void;
  onQuickLogSession: () => void;
  onNavigateToNotifications?: () => void;
  unreadNotifsCount?: number;
  onOpenAuthModal: () => void;
  isSyncing?: boolean;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
  students = [],
  sessions = [],
  quranGoals = [],
  onDataRefreshed,
  onQuickLogSession,
  onNavigateToNotifications,
  unreadNotifsCount = 0,
  onOpenAuthModal,
  isSyncing = false,
  onManualSync,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const updateLiveTime = () => {
      try {
        const now = new Date();
        const tz = settings.timezone || settings.teacherTimeZone || 'Africa/Cairo';
        const timeFormatter = new Intl.DateTimeFormat('ar-EG', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        const dateFormatter = new Intl.DateTimeFormat('ar-EG', {
          timeZone: tz,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        setCurrentTime(timeFormatter.format(now));
        setCurrentDate(dateFormatter.format(now));
      } catch (e) {
        console.error(e);
      }
    };

    updateLiveTime();
    const interval = setInterval(updateLiveTime, 1000);
    return () => clearInterval(interval);
  }, [settings.timezone, settings.teacherTimeZone]);

  // Calculate quick stats
  const activeStudentsCount = students.filter(s => s.status === 'active').length;
  
  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-08"
  const currentMonthSessions = sessions.filter(
    s => s.date.startsWith(currentMonth) && s.status === 'completed'
  );
  const totalCompletedHoursThisMonth = (
    currentMonthSessions.reduce((sum, s) => sum + s.durationMinutes, 0) / 60
  ).toFixed(1);

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran_teacher_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowBackupMenu(false);
    setNotification('تم تصدير نسخة احتياطية من جميع البيانات بنجاح.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content && importAllData(content)) {
        onDataRefreshed();
        setNotification('تم استيراد البيانات بنجاح!');
        setTimeout(() => setNotification(null), 4000);
      } else {
        alert('حدث خطأ في قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
    setShowBackupMenu(false);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'هل أنت متأكد من رغبتك في استعادة البيانات التجريبية الافتراضية؟ سيتم استبدال البيانات الحالية.'
      )
    ) {
      resetAllDataToDefaults();
      onDataRefreshed();
      setShowBackupMenu(false);
      setNotification('تمت استعادة البيانات الافتراضية بنجاح.');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <header className="bg-[#4A5D4E] text-[#FDFBF7] border-b border-[#3D4C40] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Brand & Teacher Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3D4C40] flex items-center justify-center text-white shadow-inner border border-white/10">
              <BookOpen className="w-5 h-5 text-[#D4A373]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#FDFBF7]">
                  مَقْرَأَةُ المُعَلِّم
                </h1>
                <span className="bg-[#3D4C40] text-[#E2EBD8] border border-white/10 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                  قرآن ولغة عربية
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">
                {settings.teacherName || settings.name} • <span className="text-[#D4A373]">{settings.title || 'معلم القرآن والقراءات'}</span>
              </p>
            </div>
          </div>

          {/* Live Teacher Time & Location Badge */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-start md:justify-end">
            <div className="bg-[#3D4C40] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Globe className="w-4 h-4 text-[#D4A373]" />
              <div className="text-right">
                <div className="text-[11px] text-white/80 flex items-center gap-1">
                  <span>توقيتك ({settings.teacherCountry || 'مصر'})</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white font-mono tracking-wide">
                  {currentTime || '--:--:--'}
                </div>
              </div>
            </div>

            {/* Quick Action: Log Session */}
            <button
              onClick={onQuickLogSession}
              className="bg-[#D4A373] hover:bg-[#B5824C] text-[#2D3436] font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
              title="تسجيل حصة تمت مع طالب وتدوين الملاحظات"
            >
              <CheckCircle2 className="w-4 h-4 text-[#2D3436]" />
              <span>تسجيل حصة</span>
            </button>

            {/* Notifications Bell */}
            {onNavigateToNotifications && (
              <button
                onClick={onNavigateToNotifications}
                className="relative bg-[#3D4C40] hover:bg-[#344136] text-white p-2 rounded-xl border border-white/10 transition"
                title="مركز التنبيهات"
              >
                <Bell className="w-4 h-4 text-[#E2EBD8]" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C05746] text-white text-[10px] w-4 h-4 rounded-full font-black flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>
            )}

            {/* Backup & Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBackupMenu(!showBackupMenu)}
                className="bg-[#3D4C40] hover:bg-[#344136] text-white p-2 rounded-xl border border-white/10 transition"
                title="النسخ الاحتياطي وإدارة البيانات"
              >
                <Download className="w-4 h-4" />
              </button>

              {showBackupMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-[#FFFFFF] border border-[#E8E1D5] text-[#2D3436] rounded-2xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-1 text-[#5D6567] font-bold border-b border-[#EFE9DD] mb-1">
                    إدارة البيانات والنسخ الاحتياطي
                  </div>
                  <button
                    onClick={handleExport}
                    className="w-full text-right px-3 py-2 text-[#2D3436] hover:bg-[#F8F5EE] flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-[#4A5D4E]" />
                    <span>تصدير ملف نسخة احتياطية (JSON)</span>
                  </button>

                  <label className="w-full text-right px-3 py-2 text-[#2D3436] hover:bg-[#F8F5EE] flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-[#D4A373]" />
                    <span>استيراد نسخة سابقة</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleReset}
                    className="w-full text-right px-3 py-2 text-rose-700 hover:bg-rose-50 flex items-center gap-2 border-t border-[#EFE9DD] mt-1"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <span>استعادة البيانات الافتراضية</span>
                  </button>
                </div>
              )}
            </div>

            {/* Teacher Settings Button */}
            <button
              onClick={onOpenSettings}
              className="bg-[#3D4C40] hover:bg-[#344136] text-white px-3 py-2 rounded-xl border border-white/10 flex items-center gap-1.5 text-xs font-bold transition"
              title="إعدادات بلد المعلم والتوقيت"
            >
              <Settings className="w-4 h-4 text-[#E2EBD8]" />
              <span>الإعدادات</span>
            </button>

            {/* Integrated User Login / Profile Menu */}
            <UserMenu
              onOpenAuthModal={onOpenAuthModal}
              isSyncing={isSyncing}
              onManualSync={onManualSync}
            />
          </div>
        </div>

        {/* Date and mini status strip */}
        <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-white/80 gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>{currentDate || '...'}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              الطلاب: <strong className="text-white">{activeStudentsCount}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
              ساعات الشهر: <strong className="text-white">{totalCompletedHoursThisMonth} س</strong>
            </span>
          </div>
        </div>

        {/* Notification banner if any */}
        {notification && (
          <div className="mt-2 bg-[#3D4C40] border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>
    </header>
  );
};
