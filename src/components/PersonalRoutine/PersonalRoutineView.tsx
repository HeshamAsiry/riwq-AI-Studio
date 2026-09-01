import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Bookmark,
  CheckCircle2,
  Trash2,
  Edit2,
  Award,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  Clock,
  Calendar,
  Repeat,
  CalendarDays,
  Check,
} from 'lucide-react';
import {
  IslamicBook,
  QuranPersonalGoal,
  DailyWerdLog,
  PersonalScheduleItem,
} from '../../types';
import { STUDY_CATEGORY_LABELS, DAYS_ARABIC } from '../../data/timezones';
import { DailyWerdChecklist } from './DailyWerdChecklist';
import { QuranTracker } from './QuranTracker';
import { AddBookModal } from './AddBookModal';
import { AddPersonalScheduleModal } from './AddPersonalScheduleModal';

interface PersonalRoutineViewProps {
  islamicBooks: IslamicBook[];
  quranGoals: QuranPersonalGoal[];
  werdLogs: DailyWerdLog[];
  personalSchedule?: PersonalScheduleItem[];
  onSaveBook: (book: Omit<IslamicBook, 'id'>, editId?: string) => void;
  onDeleteBook: (bookId: string) => void;
  onUpdateBookProgress: (bookId: string, completedPages: number) => void;
  onToggleQuranGoal: (goalId: string) => void;
  onUpdateQuranGoal: (goal: QuranPersonalGoal) => void;
  onUpdateWerdLog: (log: DailyWerdLog) => void;
  onSavePersonalSchedule?: (items: PersonalScheduleItem[]) => void;
}

export const PersonalRoutineView: React.FC<PersonalRoutineViewProps> = ({
  islamicBooks = [],
  quranGoals = [],
  werdLogs = [],
  personalSchedule = [],
  onSaveBook,
  onDeleteBook,
  onUpdateBookProgress,
  onToggleQuranGoal,
  onUpdateQuranGoal,
  onUpdateWerdLog,
  onSavePersonalSchedule,
}) => {
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<IslamicBook | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Personal schedule modal & edit state
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState<PersonalScheduleItem | null>(null);
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'daily' | 'weekly' | 'once'>('all');

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLog = werdLogs.find(l => l.date === todayStr) || {
    date: todayStr,
    quranNewHifzDone: false,
    quranRevisionDone: false,
    islamicStudyDone: false,
    adhkarDone: false,
    nawafilDone: false,
  };

  const handleSaveScheduleItem = (item: PersonalScheduleItem) => {
    if (!onSavePersonalSchedule) return;
    const exists = personalSchedule.some(s => s.id === item.id);
    if (exists) {
      onSavePersonalSchedule(personalSchedule.map(s => (s.id === item.id ? item : s)));
    } else {
      onSavePersonalSchedule([...personalSchedule, item]);
    }
    setShowAddScheduleModal(false);
    setEditingScheduleItem(null);
  };

  const handleDeleteScheduleItem = (id: string) => {
    if (!onSavePersonalSchedule) return;
    if (window.confirm('هل أنت متأكد من حذف هذا الموعد من جدولك الشخصي؟')) {
      onSavePersonalSchedule(personalSchedule.filter(item => item.id !== id));
    }
  };

  // Helper to format days for an item
  const formatItemScheduleDays = (item: PersonalScheduleItem) => {
    const freq =
      item.frequency ||
      item.recurrenceType ||
      (item.specificDate ? 'once' : item.isRecurring === false ? 'once' : 'weekly');

    if (freq === 'daily') {
      return { label: 'يومياً (طوال الأسبوع)', icon: Repeat, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }

    if (freq === 'once') {
      return {
        label: `لمرة واحدة: ${item.specificDate || 'تاريخ محدد'}`,
        icon: Calendar,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
      };
    }

    // Weekly
    if (Array.isArray(item.daysOfWeek) && item.daysOfWeek.length > 0) {
      if (item.daysOfWeek.length === 7) {
        return { label: 'يومياً (كل أيام الأسبوع)', icon: Repeat, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      }
      const dayNames = item.daysOfWeek
        .map(idx => DAYS_ARABIC.find(d => d.index === idx)?.name)
        .filter(Boolean);
      return {
        label: `أسبوعياً: ${dayNames.join('، ')}`,
        icon: CalendarDays,
        color: 'text-[#4A5D4E] bg-[#4A5D4E]/10 border-[#4A5D4E]/20',
      };
    }

    const dayObj = DAYS_ARABIC.find(d => d.index === item.dayOfWeek);
    return {
      label: `أسبوعياً: ${dayObj?.name || 'يوم محدد'}`,
      icon: CalendarDays,
      color: 'text-[#4A5D4E] bg-[#4A5D4E]/10 border-[#4A5D4E]/20',
    };
  };

  // Filter personal schedule items
  const filteredPersonalSchedule = personalSchedule.filter(item => {
    const freq =
      item.frequency ||
      item.recurrenceType ||
      (item.specificDate ? 'once' : item.isRecurring === false ? 'once' : 'weekly');
    if (scheduleFilter === 'all') return true;
    if (scheduleFilter === 'daily') return freq === 'daily' || (Array.isArray(item.daysOfWeek) && item.daysOfWeek.length === 7);
    if (scheduleFilter === 'weekly') return freq === 'weekly' && (!Array.isArray(item.daysOfWeek) || item.daysOfWeek.length < 7);
    if (scheduleFilter === 'once') return freq === 'once';
    return true;
  });

  const dailyCount = personalSchedule.filter(
    i => (i.frequency || i.recurrenceType) === 'daily' || (Array.isArray(i.daysOfWeek) && i.daysOfWeek.length === 7)
  ).length;
  const weeklyCount = personalSchedule.filter(
    i => ((i.frequency || i.recurrenceType) === 'weekly' || (!i.frequency && !i.specificDate)) && (!Array.isArray(i.daysOfWeek) || i.daysOfWeek.length < 7)
  ).length;
  const onceCount = personalSchedule.filter(
    i => (i.frequency || i.recurrenceType) === 'once' || !!i.specificDate
  ).length;

  const filteredBooks = islamicBooks.filter(book => {
    if (selectedCategory !== 'all' && book.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        (book.notes && book.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const completedBooksCount = islamicBooks.filter(b => b.status === 'completed').length;
  const currentlyReadingCount = islamicBooks.filter(b => b.status === 'reading').length;
  const totalPagesRead = islamicBooks.reduce((sum, b) => sum + b.completedPagesOrLessons, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header with Natural Tones */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#4A5D4E] text-xs font-bold mb-1">
            <BookOpen className="w-4 h-4" />
            <span>خطة المعلم الإيمانية والعلمية الشخصية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3436]">
            📖 جدولي الشخصي (الورد، الحفظ، وطلب العلم)
          </h1>
          <p className="text-sm text-[#5D6567] mt-1 max-w-2xl">
            متابعة أوراد الحفظ والمراجعة القرآنية الخاصة بالمعلم، تثبيت العلم الشرعي ومطالعة المتون، ومواعيد الورد اليومي دون تعارض مع مواعيد الطلاب.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingScheduleItem(null);
            setShowAddScheduleModal(true);
          }}
          className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-xs self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موعد لجدولي الشخصي</span>
        </button>
      </div>

      {/* 2. Personal Schedule Section (Once, Daily, Weekly Multi-day) */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-[#2D3436] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#4A5D4E]" />
              <span>مواعيد الحفظ والأوراد الشخصية</span>
              <span className="text-xs bg-[#4A5D4E]/10 text-[#4A5D4E] font-bold px-2.5 py-0.5 rounded-full">
                {personalSchedule.length} مواعيد
              </span>
            </h3>
            <p className="text-xs text-[#5D6567] mt-0.5">
              مواعيدك اليومية، الأسبوعية (متعددة الأيام)، ولمرة واحدة — محمية تلقائياً من تعارض مواعيد الطلاب.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#F8F5EE] p-1 rounded-xl border border-[#E8E1D5] text-xs">
              <button
                onClick={() => setScheduleFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  scheduleFilter === 'all'
                    ? 'bg-[#4A5D4E] text-[#FDFBF7] shadow-xs'
                    : 'text-[#5D6567] hover:text-[#2D3436]'
                }`}
              >
                الكل ({personalSchedule.length})
              </button>
              <button
                onClick={() => setScheduleFilter('daily')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  scheduleFilter === 'daily'
                    ? 'bg-[#4A5D4E] text-[#FDFBF7] shadow-xs'
                    : 'text-[#5D6567] hover:text-[#2D3436]'
                }`}
              >
                <Repeat className="w-3 h-3" />
                <span>يومياً ({dailyCount})</span>
              </button>
              <button
                onClick={() => setScheduleFilter('weekly')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  scheduleFilter === 'weekly'
                    ? 'bg-[#4A5D4E] text-[#FDFBF7] shadow-xs'
                    : 'text-[#5D6567] hover:text-[#2D3436]'
                }`}
              >
                <CalendarDays className="w-3 h-3" />
                <span>أسبوعياً ({weeklyCount})</span>
              </button>
              <button
                onClick={() => setScheduleFilter('once')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  scheduleFilter === 'once'
                    ? 'bg-[#4A5D4E] text-[#FDFBF7] shadow-xs'
                    : 'text-[#5D6567] hover:text-[#2D3436]'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>لمرة واحدة ({onceCount})</span>
              </button>
            </div>

            <button
              onClick={() => {
                setEditingScheduleItem(null);
                setShowAddScheduleModal(true);
              }}
              className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>موعد جديد</span>
            </button>
          </div>
        </div>

        {filteredPersonalSchedule.length === 0 ? (
          <div className="p-8 border border-dashed border-[#E8E1D5] rounded-2xl text-center space-y-2 bg-[#FDFBF7]">
            <p className="text-xs text-[#5D6567]">
              لا توجد مواعيد مضافة في هذا القسم حالياً.
            </p>
            <button
              onClick={() => {
                setEditingScheduleItem(null);
                setShowAddScheduleModal(true);
              }}
              className="text-xs font-bold text-[#4A5D4E] hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة موعد الآن (يومي، أسبوعي، أو لمرة واحدة)</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPersonalSchedule.map(item => {
              const scheduleInfo = formatItemScheduleDays(item);
              const IconComp = scheduleInfo.icon;

              return (
                <div
                  key={item.id}
                  className="p-4 bg-[#FDFBF7] border border-[#EFE9DD] hover:border-[#4A5D4E]/40 rounded-2xl flex flex-col justify-between transition-all shadow-2xs group"
                >
                  <div>
                    {/* Header with recurrence badge and actions */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${scheduleInfo.color}`}
                      >
                        <IconComp className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{scheduleInfo.label}</span>
                      </span>

                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            setEditingScheduleItem(item);
                            setShowAddScheduleModal(true);
                          }}
                          className="text-[#5D6567] hover:text-[#2D3436] p-1 rounded-lg hover:bg-white transition"
                          title="تعديل الموعد"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteScheduleItem(item.id)}
                          className="text-rose-600/80 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition"
                          title="حذف الموعد"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-extrabold text-sm text-[#2D3436] mb-1.5 leading-snug">
                      {item.title}
                    </h4>

                    {/* Time & Duration */}
                    <div className="text-xs text-[#5D6567] flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#4A5D4E]" />
                      <span>
                        {item.startTime} {item.endTime ? `- ${item.endTime}` : ''} ({item.durationMinutes} دقيقة)
                      </span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-[#5D6567] mt-2.5 pt-2 border-t border-[#EFE9DD]">
                      {item.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Daily Spiritual Checklist for the Teacher */}
      <DailyWerdChecklist
        todayLog={todayLog}
        quranGoals={quranGoals}
        onUpdateLog={onUpdateWerdLog}
        onToggleGoalToday={onToggleQuranGoal}
      />

      {/* 4. Quran Memorization & Revision Plan */}
      <QuranTracker
        goals={quranGoals}
        onToggleGoal={onToggleQuranGoal}
        onUpdateGoal={onUpdateQuranGoal}
      />

      {/* 5. Islamic Sciences & Books Study Section */}
      <div className="space-y-5">
        <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E8E1D5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-[#2D3436] flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#4A5D4E]" />
                <span>مكتبة طلب العلم الشرعي ومطالعة المتون</span>
              </h3>
              <span className="bg-[#F8F5EE] text-[#4A5D4E] text-xs px-2.5 py-0.5 rounded-full font-bold">
                {islamicBooks.length} كتب ومتون
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5D6567] mt-0.5">
              متابعة متون الفقه والنحو والحديث والتفسير والعقيدة مع نسب الإنجاز وتدوين الفوائد.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => {
                setEditingBook(null);
                setIsAddBookOpen(true);
              }}
              className="bg-[#4A5D4E] hover:bg-[#3D4C40] active:scale-95 text-[#FDFBF7] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كتاب / متن</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar for Islamic Studies */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E8E1D5] rounded-2xl p-4 flex items-center gap-3">
            <div className="p-3 bg-[#F8F5EE] text-[#4A5D4E] rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#5D6567] block">كتب قيد المدارسة</span>
              <strong className="text-lg font-bold text-[#2D3436] font-mono">
                {currentlyReadingCount} كتب
              </strong>
            </div>
          </div>

          <div className="bg-white border border-[#E8E1D5] rounded-2xl p-4 flex items-center gap-3">
            <div className="p-3 bg-[#F8F5EE] text-[#4A5D4E] rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#5D6567] block">كتب تمت ختمتها</span>
              <strong className="text-lg font-bold text-[#2D3436] font-mono">
                {completedBooksCount} كتب
              </strong>
            </div>
          </div>

          <div className="bg-white border border-[#E8E1D5] rounded-2xl p-4 flex items-center gap-3">
            <div className="p-3 bg-[#F8F5EE] text-[#D4A373] rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#5D6567] block">إجمالي الصفحات المقروءة</span>
              <strong className="text-lg font-bold text-[#D4A373] font-mono">
                {totalPagesRead} صفحة
              </strong>
            </div>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === 'all'
                ? 'bg-[#4A5D4E] text-[#FDFBF7]'
                : 'bg-white text-[#5D6567] border border-[#E8E1D5] hover:bg-[#F8F5EE]'
            }`}
          >
            جميع العلوم ({islamicBooks.length})
          </button>
          {Object.entries(STUDY_CATEGORY_LABELS).map(([key, label]) => {
            const count = islamicBooks.filter(b => b.category === key).length;
            if (count === 0 && selectedCategory !== key) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedCategory === key
                    ? 'bg-[#4A5D4E] text-[#FDFBF7]'
                    : 'bg-white text-[#5D6567] border border-[#E8E1D5] hover:bg-[#F8F5EE]'
                }`}
              >
                <span>{label}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Bookshelf Grid */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E1D5] p-12 text-center text-[#5D6567] text-xs">
            لا توجد كتب مضافة في هذا القسم حتى الآن.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map(book => {
              const percentage = Math.min(
                100,
                Math.round((book.completedPagesOrLessons / book.totalPagesOrLessons) * 100)
              );

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-3xl border border-[#E8E1D5] p-5 shadow-xs hover:border-[#4A5D4E]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Category & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold text-[#4A5D4E] bg-[#F8F5EE] px-2 py-0.5 rounded-lg">
                        {STUDY_CATEGORY_LABELS[book.category] || book.category}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingBook(book);
                            setIsAddBookOpen(true);
                          }}
                          className="p-1 text-[#5D6567] hover:text-[#2D3436] rounded-lg hover:bg-[#F8F5EE] transition"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteBook(book.id)}
                          className="p-1 text-rose-600 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Book Title & Author */}
                    <h4 className="font-extrabold text-[#2D3436] text-base leading-snug">
                      {book.title}
                    </h4>
                    <span className="text-xs text-[#5D6567] block mt-0.5">
                      المؤلف: {book.author}
                    </span>

                    {/* Progress Bar & Page update */}
                    <div className="my-3 bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#EFE9DD]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#5D6567] font-medium">التقدم في الكتاب:</span>
                        <span className="font-mono font-bold text-[#2D3436]">
                          <strong className="text-[#4A5D4E] text-sm">
                            {book.completedPagesOrLessons}
                          </strong>{' '}
                          / {book.totalPagesOrLessons} صفحة
                        </span>
                      </div>

                      <div className="w-full bg-[#EFE9DD] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300 bg-[#4A5D4E]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#5D6567] mt-2">
                        <span className="font-bold text-[#4A5D4E]">{percentage}% منجز</span>

                        {/* Quick increment buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              onUpdateBookProgress(
                                book.id,
                                Math.min(book.totalPagesOrLessons, book.completedPagesOrLessons + 5)
                              )
                            }
                            className="bg-white hover:bg-[#F8F5EE] border border-[#E8E1D5] text-[#2D3436] text-[10px] font-bold px-2 py-0.5 rounded-lg transition"
                            title="إضافة 5 صفحات"
                          >
                            +5 ص
                          </button>
                          <button
                            onClick={() =>
                              onUpdateBookProgress(
                                book.id,
                                Math.min(book.totalPagesOrLessons, book.completedPagesOrLessons + 10)
                              )
                            }
                            className="bg-white hover:bg-[#F8F5EE] border border-[#E8E1D5] text-[#2D3436] text-[10px] font-bold px-2 py-0.5 rounded-lg transition"
                            title="إضافة 10 صفحات"
                          >
                            +10 ص
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Book Notes */}
                    {book.notes && (
                      <p className="text-xs text-[#5D6567] bg-[#FDFBF7] p-2.5 rounded-xl border border-[#EFE9DD] mb-2">
                        {book.notes}
                      </p>
                    )}
                  </div>

                  {/* Status footer */}
                  <div className="pt-2 border-t border-[#EFE9DD] flex items-center justify-between text-[11px] text-[#5D6567] mt-2">
                    <span>
                      {book.status === 'completed'
                        ? '✅ تمت القراءة والمدارسة'
                        : '📖 قيد المدارسة اليومية'}
                    </span>
                    {book.startDate && (
                      <span className="font-mono text-[10px]">بدأ في: {book.startDate}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Book Modal */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => {
          setIsAddBookOpen(false);
          setEditingBook(null);
        }}
        onSaveBook={onSaveBook}
        editingBook={editingBook}
      />

      {/* Add / Edit Personal Schedule Item Modal */}
      <AddPersonalScheduleModal
        isOpen={showAddScheduleModal}
        onClose={() => {
          setShowAddScheduleModal(false);
          setEditingScheduleItem(null);
        }}
        onSave={handleSaveScheduleItem}
        editingItem={editingScheduleItem}
      />
    </div>
  );
};

