import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Globe,
  User,
  MoreVertical,
  CheckCircle2,
  Share2,
  Trash2,
  Edit2,
  Video,
  Filter,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import {
  RecurringSlot,
  Student,
  TeacherSettings,
  TimeConflict,
  SessionRecord,
} from '../../types';
import { DAYS_ARABIC } from '../../data/timezones';
import {
  convertTeacherTimeToStudentTime,
  formatTime12,
  parseTime,
} from '../../utils/timezones';
import { DualTimeDisplay } from './DualTimeDisplay';
import { ConflictAlertBanner } from './ConflictAlertBanner';

interface WeeklyTimetableProps {
  slots: RecurringSlot[];
  students: Student[];
  settings: TeacherSettings;
  conflicts: TimeConflict[];
  onAddSlot: () => void;
  onEditSlot: (slot: RecurringSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onLogCompletedSession: (slot: RecurringSlot) => void;
  onSendWhatsAppReminder: (slot: RecurringSlot, student: Student) => void;
}

export const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({
  slots = [],
  students = [],
  settings,
  conflicts = [],
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  onLogCompletedSession,
  onSendWhatsAppReminder,
}) => {
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [activeDayTab, setActiveDayTab] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  // Filter slots
  const filteredSlots = slots.filter(slot => {
    if (selectedStudentFilter !== 'all' && slot.studentId !== selectedStudentFilter) {
      return false;
    }
    if (activeDayTab !== 'all' && slot.dayOfWeek !== activeDayTab) {
      return false;
    }
    return true;
  });

  // Sort slots by time
  const getSlotsForDay = (dayIndex: number) => {
    return filteredSlots
      .filter(s => s.dayOfWeek === dayIndex)
      .sort((a, b) => {
        const tA = parseTime(a.teacherStartTime);
        const tB = parseTime(b.teacherStartTime);
        return tA.hours * 60 + tA.minutes - (tB.hours * 60 + tB.minutes);
      });
  };

  const totalWeeklyHours = (
    slots
      .filter(s => s.active)
      .reduce((sum, s) => sum + s.durationMinutes, 0) / 60
  ).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Dual Time Converter Widget */}
      <DualTimeDisplay students={students} settings={settings} />

      {/* Conflict Alert Banner if any overlaps exist */}
      <ConflictAlertBanner conflicts={conflicts} />

      {/* Control Bar: Title, Filters & Actions */}
      <div className="bg-[#F8F5EE] rounded-2xl p-4 sm:p-5 border border-[#E8E1D5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#2D3436] font-quran">
              جدول الحلقات والمواعيد الأسبوعية
            </h2>
            <span className="bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {slots.filter(s => s.active).length} موعد أسبوعي ({totalWeeklyHours} ساعة)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5D6567] mt-0.5">
            عرض المواعيد بتوقيتك المعتمد ({settings.teacherCountry}) وبجانبها التوقيت المحلي لكل طالب في بلده لمنع اللبس.
          </p>
        </div>

        {/* Filters & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Student Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-[#D8CFBF] rounded-xl px-2.5 py-1.5 text-xs text-[#2D3436]">
            <Filter className="w-3.5 h-3.5 text-[#5D6567]" />
            <select
              value={selectedStudentFilter}
              onChange={e => setSelectedStudentFilter(e.target.value)}
              className="bg-transparent font-medium focus:outline-none"
            >
              <option value="all">جميع الطلاب ({students.length})</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.countryFlag} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Session Slot Button */}
          <button
            onClick={onAddSlot}
            className="bg-[#4A5D4E] hover:bg-[#3D4D40] active:scale-95 text-[#FDFBF7] font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة موعد حلقة</span>
          </button>
        </div>

      </div>

      {/* Day Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveDayTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeDayTab === 'all'
              ? 'bg-[#2D382E] text-white shadow-xs'
              : 'bg-white text-[#5D6567] border border-[#E8E1D5] hover:bg-[#F4EFE6]'
          }`}
        >
          كامل الأسبوع ({filteredSlots.length})
        </button>

        {DAYS_ARABIC.map(day => {
          const count = filteredSlots.filter(s => s.dayOfWeek === day.index).length;
          const isSelected = activeDayTab === day.index;
          return (
            <button
              key={day.index}
              onClick={() => setActiveDayTab(day.index)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#4A5D4E] text-[#FDFBF7] shadow-xs'
                  : 'bg-white text-[#5D6567] border border-[#E8E1D5] hover:bg-[#F4EFE6]'
              }`}
            >
              <span>{day.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-[#2D382E] text-[#E0EBE2]' : 'bg-[#EFE9DD] text-[#5D6567]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(activeDayTab === 'all' ? DAYS_ARABIC : DAYS_ARABIC.filter(d => d.index === activeDayTab)).map(day => {
          const daySlots = getSlotsForDay(day.index);
          const isWorkingDay = settings.workingDays.includes(day.index);

          return (
            <div
              key={day.index}
              className={`bg-white rounded-2xl border ${
                isWorkingDay ? 'border-[#E8E1D5]' : 'border-[#E8E1D5]/70 bg-[#FBF9F4]'
              } shadow-xs overflow-hidden flex flex-col`}
            >
              {/* Day Card Header */}
              <div className="bg-[#F8F5EE] px-4 py-3 border-b border-[#E8E1D5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4A5D4E]"></span>
                  <h3 className="font-bold text-[#2D3436] text-sm">{day.name}</h3>
                </div>
                <span className="text-xs text-[#5D6567] font-mono font-medium">
                  {daySlots.length} {daySlots.length === 1 ? 'حلقة' : 'حلقات'}
                </span>
              </div>

              {/* Day Card Slots List */}
              <div className="p-3 space-y-3 flex-1 bg-[#FDFBF7]">
                {daySlots.length === 0 ? (
                  <div className="text-center py-8 text-[#A8A29E] text-xs">
                    لا توجد مواعيد مسجلة في هذا اليوم
                  </div>
                ) : (
                  daySlots.map(slot => {
                    const student = students.find(s => s.id === slot.studentId);
                    if (!student) return null;

                    const studentTime = convertTeacherTimeToStudentTime(
                      slot.teacherStartTime,
                      settings.teacherTimeZone,
                      student.timezone
                    );

                    return (
                      <div
                        key={slot.id}
                        className={`rounded-xl border p-3 transition-all relative group ${
                          slot.active
                            ? 'bg-white border-[#E8E1D5] hover:border-[#4A5D4E] hover:shadow-xs'
                            : 'bg-[#F4EFE6]/50 border-dashed border-[#D8CFBF] opacity-60'
                        }`}
                        style={{ borderRightColor: student.color, borderRightWidth: '4px' }}
                      >
                        {/* Student Name & Country */}
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{student.countryFlag}</span>
                            <div>
                              <h4 className="font-bold text-xs sm:text-sm text-[#2D3436] leading-tight">
                                {student.name}
                              </h4>
                              <span className="text-[11px] text-[#78716C]">
                                {student.country}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions Dropdown / buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onSendWhatsAppReminder(slot, student)}
                              className="p-1 rounded-lg text-[#4A5D4E] hover:bg-[#4A5D4E]/10 transition"
                              title="إرسال رسالة تذكير بالموعد عبر واتساب"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditSlot(slot)}
                              className="p-1 rounded-lg text-[#5D6567] hover:bg-[#EFE9DD] transition"
                              title="تعديل الموعد"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteSlot(slot.id)}
                              className="p-1 rounded-lg text-[#C05746] hover:bg-[#C05746]/10 transition"
                              title="حذف الموعد"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Subject Badge */}
                        <div className="text-[11px] text-[#2D3436] bg-[#F8F5EE] border border-[#E8E1D5] rounded-lg px-2 py-1 mb-2 font-medium truncate">
                          📖 {slot.subject}
                        </div>

                        {/* Time Dual Display Box */}
                        <div className="bg-[#FAF7F2] rounded-lg p-2 border border-[#E8E1D5] text-xs space-y-1.5">
                          
                          {/* Teacher Time */}
                          <div className="flex items-center justify-between text-[#2D3436] font-medium">
                            <span className="text-[11px] text-[#5D6567] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#4A5D4E]" />
                              توقيتك ({settings.teacherCountry}):
                            </span>
                            <span className="font-bold font-mono text-[#4A5D4E] text-xs">
                              {formatTime12(slot.teacherStartTime)}
                            </span>
                          </div>

                          {/* Student Time */}
                          <div className="flex items-center justify-between text-[#A67C52] font-medium pt-1 border-t border-[#E8E1D5]/70">
                            <span className="text-[11px] text-[#5D6567] flex items-center gap-1">
                              <Globe className="w-3 h-3 text-[#A67C52]" />
                              توقيت الطالب ({student.country}):
                            </span>
                            <span className="font-bold font-mono text-[#A67C52] text-xs">
                              {studentTime.studentTime12}
                            </span>
                          </div>

                        </div>

                        {/* Bottom Action: Mark Completed */}
                        <div className="mt-2.5 pt-2 border-t border-[#E8E1D5] flex items-center justify-between text-[11px]">
                          <span className="text-[#78716C] font-mono">
                            {slot.durationMinutes} دقيقة
                          </span>
                          <button
                            onClick={() => onLogCompletedSession(slot)}
                            className="text-[#4A5D4E] hover:text-[#3D4D40] font-bold flex items-center gap-1 hover:underline"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                            <span>تسجيل إنجاز الحصة</span>
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
