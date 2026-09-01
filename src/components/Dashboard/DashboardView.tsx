import React, { useState, useEffect } from 'react';
import {
  Student,
  RecurringSlot,
  SessionRecord,
  TeacherSettings,
  PersonalScheduleItem,
  PaymentRecord,
  ExamRecord,
  AppNotification,
} from '../../types';
import {
  Clock,
  Calendar,
  Users,
  BookOpen,
  CheckCircle2,
  Video,
  MessageCircle,
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
  Wallet,
  Compass,
  ChevronLeft,
  BookMarked,
  Layers,
} from 'lucide-react';
import { formatTime12, getCurrentTimeInZone, convertTeacherToStudentTime } from '../../utils/timezones';
import { DAYS_ARABIC } from '../../data/timezones';
import { doesPersonalItemApplyToDay } from '../../utils/conflictDetector';

interface DashboardViewProps {
  students?: Student[];
  recurringSlots?: RecurringSlot[];
  sessions?: SessionRecord[];
  teacherSettings: TeacherSettings;
  personalSchedule?: PersonalScheduleItem[];
  payments?: PaymentRecord[];
  exams?: ExamRecord[];
  notifications?: AppNotification[];
  onNavigate: (tab: any) => void;
  onOpenQuickSession?: (studentId: string) => void;
  onOpenWhatsAppModal?: (student: Student, slot?: RecurringSlot) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students = [],
  recurringSlots = [],
  sessions = [],
  teacherSettings,
  personalSchedule = [],
  payments = [],
  exams = [],
  notifications = [],
  onNavigate,
  onOpenQuickSession,
  onOpenWhatsAppModal,
}) => {
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dayIdx = now.getDay();
      setCurrentDayIndex(dayIdx);
      
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const da = String(now.getDate()).padStart(2, '0');
      setCurrentDateStr(`${yr}-${mo}-${da}`);

      const hr = String(now.getHours()).padStart(2, '0');
      const mn = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hr}:${mn}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const dayArabicName = DAYS_ARABIC.find(d => d.index === currentDayIndex)?.name || 'اليوم';

  // Today's student slots
  const todayStudentSlots = recurringSlots
    .filter(s => s.active && s.dayOfWeek === currentDayIndex)
    .map(slot => {
      const student = students.find(st => st.id === slot.studentId);
      return {
        type: 'student_session' as const,
        id: slot.id,
        studentId: slot.studentId,
        student,
        title: student?.name || 'طالب',
        subject: slot.subject || student?.subjectDetail || 'حصة تعليمية',
        time: slot.teacherStartTime,
        duration: slot.durationMinutes,
        meetingLink: student?.meetingLink || teacherSettings.meetingLink,
      };
    });

  // Today's personal schedule items
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPersonalItems = personalSchedule
    .filter(p => doesPersonalItemApplyToDay(p, currentDayIndex, todayStr))
    .map(p => ({
      type: 'personal_routine' as const,
      id: p.id,
      studentId: undefined,
      student: undefined,
      title: p.title,
      subject:
        p.category === 'hifz' || p.category === 'quran_hifz'
          ? 'حفظ قرآن شخصي'
          : p.category === 'revision' || p.category === 'quran_revision'
          ? 'مراجعة قرآن'
          : p.category === 'islamic_studies' || p.category === 'islamic_study' || p.category === 'lesson'
          ? 'طلب علم شرعي'
          : p.category === 'preparation'
          ? 'تحضير دروس الحلقات'
          : p.category === 'listening'
          ? 'استماع وإتقان تلاوة'
          : 'ورد شخصي وتدبر',
      time: p.startTime,
      duration: p.durationMinutes,
      meetingLink: undefined,
    }));

  // Combine and sort all activities today
  const allTodayActivities = [...todayStudentSlots, ...todayPersonalItems].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  // Helper to determine status (🟢 قادم, 🔵 جارٍ, ✅ انتهى)
  const getActivityStatus = (time: string, duration: number) => {
    if (!currentTimeStr) return 'upcoming';
    const [cHr, cMn] = currentTimeStr.split(':').map(Number);
    const currMin = cHr * 60 + cMn;

    const [sHr, sMn] = time.split(':').map(Number);
    const startMin = sHr * 60 + sMn;
    const endMin = startMin + duration;

    if (currMin >= startMin && currMin < endMin) {
      return 'in_progress';
    } else if (currMin >= endMin) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  // Find the next upcoming activity
  const nextActivity = allTodayActivities.find(act => {
    const status = getActivityStatus(act.time, act.duration);
    return status === 'in_progress' || status === 'upcoming';
  });

  // Calculate monthly stats
  const activeStudentsCount = students.filter(s => s.status === 'active').length;
  
  // Calculate completed teaching hours this month
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthSessions = sessions.filter(s => s.date.startsWith(currentYearMonth) && s.status === 'completed');
  const totalCompletedMinutes = thisMonthSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalTeachingHours = Math.round((totalCompletedMinutes / 60) * 10) / 10;

  // Total income this month
  const totalPaidIncome = payments
    .filter(p => p.status === 'paid' && (p.paymentDate?.startsWith(currentYearMonth) || p.monthYear?.startsWith(currentYearMonth) || p.billingPeriod?.startsWith(currentYearMonth)))
    .reduce((sum, p) => sum + (p.amount || p.amountPaid || p.totalDue || 0), 0);

  // Count unread notifications
  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header Banner with Natural Tones Card */}
      <div className="bg-[#4A5D4E] text-[#FDFBF7] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-8 -mr-8 w-40 h-40 bg-[#D4A373]/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#D4A373] text-sm font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>مقرأة المعلم — إدارة المقارئ والتعليم الفردي</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              السلام عليكم ورحمة الله وبركاته، شيخنا الفاضل
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
              اليوم هو <span className="font-bold text-white underline decoration-[#D4A373]">{dayArabicName}</span>، لديك{' '}
              <span className="font-bold text-[#E2EBD8]">{todayStudentSlots.length} حصص تدريس</span> و{' '}
              <span className="font-bold text-[#E2EBD8]">{todayPersonalItems.length} مواعيد شخصية</span> في جدولك.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('calendar')}
              className="bg-[#FDFBF7] text-[#4A5D4E] hover:bg-[#EFE9DD] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>عرض التقويم الكامل</span>
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="bg-[#3D4C40] text-white hover:bg-[#344136] border border-white/10 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>إدارة الطلاب ({students.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Daily Summary & Highlighted Next Session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Up Focus Box (Col 1 & 2) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[#4A5D4E]">
                <Clock className="w-5 h-5" />
                <h2 className="font-bold text-lg text-[#2D3436]">الموعد القادم / النشاط الحالي</h2>
              </div>
              {nextActivity && (
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold ${
                    getActivityStatus(nextActivity.time, nextActivity.duration) === 'in_progress'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {getActivityStatus(nextActivity.time, nextActivity.duration) === 'in_progress'
                    ? '🔵 جارٍ الآن'
                    : '🟢 الموعد التالي'}
                </span>
              )}
            </div>

            {nextActivity ? (
              <div className="bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl p-5 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-extrabold text-[#2D3436]">{nextActivity.title}</span>
                      {nextActivity.student?.countryFlag && (
                        <span className="text-lg">{nextActivity.student.countryFlag}</span>
                      )}
                    </div>
                    <p className="text-sm text-[#5D6567] mb-2">{nextActivity.subject}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#4A5D4E]">
                      <span className="bg-[#EFE9DD] px-2.5 py-1 rounded-lg">
                        ⏰ توقيتك: {formatTime12(nextActivity.time)} ({nextActivity.duration} دقيقة)
                      </span>
                      {nextActivity.student && (
                        <span className="bg-[#EFE9DD] px-2.5 py-1 rounded-lg">
                          🌍 توقيت الطالب: {convertTeacherToStudentTime(nextActivity.time, teacherSettings.teacherTimeZone || teacherSettings.timezone || 'Africa/Cairo', nextActivity.student.timezone).studentTime12}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for this next activity */}
                  {nextActivity.type === 'student_session' && nextActivity.student && (
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      {nextActivity.meetingLink && (
                        <a
                          href={nextActivity.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>فتح قاعة الدرس</span>
                        </a>
                      )}
                      <button
                        onClick={() => onOpenWhatsAppModal(nextActivity.student!)}
                        className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>واتساب الولي/الطالب</span>
                      </button>
                      <button
                        onClick={() => onOpenQuickSession(nextActivity.student!.id)}
                        className="bg-[#F8F5EE] hover:bg-[#EFE9DD] text-[#2D3436] border border-[#E8E1D5] px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تسجيل إتمام الحصة</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl p-8 text-center text-[#5D6567]">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-[#4A5D4E] opacity-70" />
                <p className="font-bold text-base text-[#2D3436]">تم إنجاز جميع مواعيد اليوم بنجاح!</p>
                <p className="text-xs mt-1">لا توجد مواعيد أخرى متبقية في جدول هذا اليوم.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#EFE9DD] flex items-center justify-between text-xs text-[#5D6567]">
            <span>التوقيت الحالي لمعلم: <strong className="text-[#2D3436]">{formatTime12(currentTimeStr)}</strong> ({teacherSettings.city})</span>
            <button
              onClick={() => onNavigate('personal_schedule')}
              className="text-[#4A5D4E] hover:underline font-bold flex items-center gap-1"
            >
              <span>مراجعة جدولك الشخصي</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Today's Counters (Col 3) */}
        <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-[#2D3436]">ملخص نشاط اليوم</h2>
              <span className="text-xs bg-[#F8F5EE] text-[#5D6567] px-2.5 py-1 rounded-lg font-bold">
                {dayArabicName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F8F5EE] border border-[#E8E1D5] rounded-2xl p-4 text-center">
                <span className="text-xs text-[#5D6567] block mb-1">حصص الطلاب</span>
                <span className="text-2xl font-black text-[#4A5D4E]">{todayStudentSlots.length}</span>
                <span className="text-[11px] text-[#5D6567] block mt-0.5">حصص مجدولة</span>
              </div>

              <div className="bg-[#F8F5EE] border border-[#E8E1D5] rounded-2xl p-4 text-center">
                <span className="text-xs text-[#5D6567] block mb-1">الورد الشخصي</span>
                <span className="text-2xl font-black text-[#D4A373]">{todayPersonalItems.length}</span>
                <span className="text-[11px] text-[#5D6567] block mt-0.5">حفظ ومراجعة وعلم</span>
              </div>

              <div className="bg-[#F8F5EE] border border-[#E8E1D5] rounded-2xl p-4 text-center">
                <span className="text-xs text-[#5D6567] block mb-1">ساعات منجزة اليوم</span>
                <span className="text-2xl font-black text-[#2D3436]">
                  {allTodayActivities.filter(a => getActivityStatus(a.time, a.duration) === 'completed').length}
                </span>
                <span className="text-[11px] text-[#5D6567] block mt-0.5">من أصل {allTodayActivities.length}</span>
              </div>

              <div className="bg-[#F8F5EE] border border-[#E8E1D5] rounded-2xl p-4 text-center">
                <span className="text-xs text-[#5D6567] block mb-1">التنبيهات</span>
                <span className={`text-2xl font-black ${unreadNotifsCount > 0 ? 'text-[#C05746]' : 'text-emerald-700'}`}>
                  {unreadNotifsCount}
                </span>
                <span className="text-[11px] text-[#5D6567] block mt-0.5">تتطلب انتباهك</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('notifications')}
            className="w-full mt-4 bg-[#F8F5EE] hover:bg-[#EFE9DD] text-[#4A5D4E] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <span>مركز الإشعارات والتنبيهات</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Today's Full Timetable List with Live Status Badges */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#2D3436] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#4A5D4E]" />
              <span>جدول مواعيد اليوم بالتفصيل</span>
            </h2>
            <p className="text-xs text-[#5D6567] mt-0.5">
              يعرض ترتيب الحصص والأنشطة بحسب التوقيت ومراعاة فروق التوقيت للطلاب في الخارج
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>🟢 قادم</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping inline-block" />
              <span>🔵 جارٍ الآن</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-400 inline-block" />
              <span>✅ انتهى</span>
            </span>
          </div>
        </div>

        {allTodayActivities.length > 0 ? (
          <div className="divide-y divide-[#EFE9DD] overflow-hidden border border-[#EFE9DD] rounded-2xl">
            {allTodayActivities.map(act => {
              const status = getActivityStatus(act.time, act.duration);
              const isStudent = act.type === 'student_session';

              return (
                <div
                  key={act.id}
                  className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    status === 'in_progress'
                      ? 'bg-amber-50/50'
                      : status === 'completed'
                      ? 'bg-[#FAF8F5] opacity-75'
                      : 'hover:bg-[#FDFBF7]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Time pill */}
                    <div className="bg-[#EFE9DD] text-[#2D3436] font-mono px-3 py-2 rounded-xl text-center shrink-0 min-w-[70px]">
                      <span className="block font-bold text-sm">{formatTime12(act.time)}</span>
                      <span className="block text-[10px] text-[#5D6567]">{act.duration} د</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-base text-[#2D3436]">{act.title}</span>
                        {isStudent && act.student && (
                          <span className="text-xs bg-[#F8F5EE] text-[#5D6567] px-2 py-0.5 rounded-md">
                            {act.student.countryFlag} {act.student.country}
                          </span>
                        )}
                        {!isStudent && (
                          <span className="text-xs bg-[#D4A373]/20 text-[#8C5D30] font-bold px-2 py-0.5 rounded-md">
                            ميعاد شخصي
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#5D6567] mb-1">{act.subject}</p>

                      {isStudent && act.student && (
                        <div className="text-[11px] text-[#4A5D4E] font-medium">
                          توقيت الطالب:{' '}
                          <strong>
                            {convertTeacherToStudentTime(act.time, teacherSettings.teacherTimeZone || teacherSettings.timezone || 'Africa/Cairo', act.student.timezone).studentTime12}
                          </strong>{' '}
                          ({act.student.timezone.split('/')[1]?.replace('_', ' ')})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side status & action buttons */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    {status === 'in_progress' && (
                      <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        جارٍ الآن
                      </span>
                    )}
                    {status === 'upcoming' && (
                      <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                        🟢 قادم
                      </span>
                    )}
                    {status === 'completed' && (
                      <span className="text-xs px-2.5 py-1 bg-stone-200 text-stone-700 rounded-full font-bold">
                        ✅ انتهى
                      </span>
                    )}

                    {isStudent && act.student && (
                      <div className="flex items-center gap-1.5">
                        {act.meetingLink && (
                          <a
                            href={act.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            title="فتح الرابط"
                            className="p-2 bg-[#F8F5EE] hover:bg-[#EFE9DD] text-[#4A5D4E] rounded-xl transition-all"
                          >
                            <Video className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => onOpenWhatsAppModal(act.student!)}
                          title="مراسلة واتساب"
                          className="p-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-xl transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenQuickSession(act.student!.id)}
                          title="تسجيل الحصة"
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-[#FDFBF7] rounded-2xl border border-dashed border-[#E8E1D5]">
            <Calendar className="w-10 h-10 text-[#8A9396] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-[#2D3436]">لا توجد حصص أو مواعيد مسجلة ليوم {dayArabicName}</p>
            <p className="text-xs text-[#5D6567] mt-1">يمكنك إضافة حصص من صفحة التقويم أو الطلاب.</p>
          </div>
        )}
      </div>

      {/* 4. Month Overview Metric Cards (Natural Tones) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#2D3436] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#4A5D4E]" />
            <span>إحصائيات وإنجازات الشهر الحالي ({now.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })})</span>
          </h2>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-[#4A5D4E] hover:underline flex items-center gap-1"
          >
            <span>عرض التقارير الموسعة</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('hours')}
            className="bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#4A5D4E] rounded-2xl p-5 shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#5D6567]">ساعات التدريس المنجزة</span>
              <div className="w-9 h-9 rounded-xl bg-[#EFE9DD] text-[#4A5D4E] flex items-center justify-center group-hover:bg-[#4A5D4E] group-hover:text-white transition-all">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#2D3436]">{totalTeachingHours} ساعة</div>
            <p className="text-xs text-[#5D6567] mt-1">خلال {thisMonthSessions.length} حصة تمت بنجاح</p>
          </div>

          <div
            onClick={() => onNavigate('students')}
            className="bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#4A5D4E] rounded-2xl p-5 shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#5D6567]">الطلاب النشطون</span>
              <div className="w-9 h-9 rounded-xl bg-[#EFE9DD] text-[#4A5D4E] flex items-center justify-center group-hover:bg-[#4A5D4E] group-hover:text-white transition-all">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#2D3436]">{activeStudentsCount} طالب</div>
            <p className="text-xs text-[#5D6567] mt-1">من مختلف دول العالم</p>
          </div>

          <div
            onClick={() => onNavigate('payments')}
            className="bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#4A5D4E] rounded-2xl p-5 shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#5D6567]">المتحصلات المالية</span>
              <div className="w-9 h-9 rounded-xl bg-[#EFE9DD] text-[#4A5D4E] flex items-center justify-center group-hover:bg-[#4A5D4E] group-hover:text-white transition-all">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#2D3436]">
              {totalPaidIncome} {teacherSettings.currency}
            </div>
            <p className="text-xs text-[#5D6567] mt-1">المدفوعات المستلمة هذا الشهر</p>
          </div>

          <div
            onClick={() => onNavigate('exams')}
            className="bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#4A5D4E] rounded-2xl p-5 shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#5D6567]">الاختبارات والتقييمات</span>
              <div className="w-9 h-9 rounded-xl bg-[#EFE9DD] text-[#4A5D4E] flex items-center justify-center group-hover:bg-[#4A5D4E] group-hover:text-white transition-all">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#2D3436]">{exams.length} اختبار</div>
            <p className="text-xs text-[#5D6567] mt-1">سجلات درجات وشهادات</p>
          </div>
        </div>
      </div>

      {/* 5. Quick Access to Core Modules (12 Modules Grid) */}
      <div className="bg-[#F8F5EE] border border-[#E8E1D5] rounded-3xl p-6">
        <h2 className="text-base font-bold text-[#2D3436] mb-4 flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#4A5D4E]" />
          <span>الوصول السريع للأقسام الرئيسية</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { id: 'calendar', title: '📅 التقويم', desc: 'المواعيد والتوقيت' },
            { id: 'students', title: '👨‍🎓 الطلاب', desc: 'الملفات والمهارات' },
            { id: 'curricula', title: '📚 المسارات', desc: 'المناهج والكتب' },
            { id: 'quran', title: '🕌 القرآن', desc: 'الحفظ والمراجعة' },
            { id: 'exams', title: '📝 الاختبارات', desc: 'التقييم والشهادات' },
            { id: 'personal_schedule', title: '📖 الورد الشخصي', desc: 'الجدول والعلم' },
            { id: 'hours', title: '⏱️ الساعات', desc: 'التعويض والإجازات' },
            { id: 'payments', title: '💰 المدفوعات', desc: 'الفواتير والأسعار' },
            { id: 'reports', title: '📊 التقارير', desc: 'كشف الأداء الشهري' },
            { id: 'notifications', title: '🔔 التنبيهات', desc: 'المواعيد والمستحقات' },
            { id: 'settings', title: '⚙️ الإعدادات', desc: 'النسخ والتهيئة' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#4A5D4E] hover:bg-[#FDFBF7] p-3 rounded-2xl text-right transition-all group"
            >
              <span className="font-bold text-xs text-[#2D3436] block group-hover:text-[#4A5D4E]">
                {item.title}
              </span>
              <span className="text-[10px] text-[#5D6567] block mt-0.5 truncate">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
