import React from 'react';
import {
  X,
  Printer,
  Share2,
  Calendar,
  Clock,
  CheckCircle2,
  BookOpen,
  DollarSign,
  Star,
  Award,
} from 'lucide-react';
import { Student, SessionRecord, TeacherSettings } from '../../types';
import { formatTime12 } from '../../utils/timezones';

interface StudentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  monthStr: string; // "YYYY-MM"
  sessions: SessionRecord[];
  settings: TeacherSettings;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  isOpen,
  onClose,
  student,
  monthStr,
  sessions,
  settings,
}) => {
  if (!isOpen) return null;

  // Filter student sessions for selected month
  const monthSessions = sessions
    .filter(s => s.studentId === student.id && s.date.startsWith(monthStr))
    .sort((a, b) => a.date.localeCompare(b.date));

  const completedSessions = monthSessions.filter(s => s.status === 'completed');
  const totalMinutes = completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalCompletedHours = totalMinutes / 60;
  const targetHours = student.monthlyTargetHours || 8;
  const completionPercentage = Math.min(100, Math.round((totalCompletedHours / targetHours) * 100));

  const hourlyRate = student.hourlyRate || settings.defaultHourlyRate || 15;
  const totalAmount = totalCompletedHours * hourlyRate;

  // Format month name in Arabic
  const [year, month] = monthStr.split('-').map(Number);
  const monthDate = new Date(year, month - 1, 1);
  const monthNameArabic = new Intl.DateTimeFormat('ar-EG', {
    month: 'long',
    year: 'numeric',
  }).format(monthDate);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `السلام عليكم ورحمة الله وبركاته 🌹
كشف إنجاز وساعات حلقة الطالب: *${student.name}*
عن شهر: *${monthNameArabic}*

📊 ملخص الشهر:
- إجمالي الساعات المنجزة: *${totalCompletedHours.toFixed(1)} ساعة* من أصل *${targetHours} ساعة*
- عدد الحصص المكتملة: *${completedSessions.length} حصة*
- المنهج المقرر: ${student.subjectDetail}
${totalAmount > 0 ? `- إجمالي المستحقات: *${totalAmount.toFixed(0)} ${settings.currency}*` : ''}

بارك الله في جهودكم ونفع بكم ووفقنا وإياكم لما يحب ويرضى.`;

    const cleanPhone = student.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-300 max-w-3xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 print:m-0 print:border-none print:shadow-none">
        
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="bg-[#242E25] text-[#FDFBF7] px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#82A888]" />
            <h3 className="font-bold text-sm sm:text-base">
              تقرير الإنجاز وساعات التدريس الشهرية
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="bg-[#4A5D4E] hover:bg-[#3D4D40] text-[#FDFBF7] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>إرسال واتساب</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#2D382E] hover:bg-[#36453A] text-[#D8E6DB] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#4A5D4E] flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5 text-[#C8D7CC]" />
              <span>طباعة التقرير</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#A8B9AB] hover:text-white p-1 rounded-lg hover:bg-[#2D382E] transition mr-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="p-6 sm:p-8 space-y-6 text-[#2D3436] bg-[#FDFBF7] print:p-4">
          
          {/* Header / Islamic Branding */}
          <div className="border-b-2 border-[#4A5D4E] pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-[#36453A] font-bold text-xl sm:text-2xl font-quran">
                مقرأة القرآن الكريم واللغة العربية
              </div>
              <div className="text-xs sm:text-sm text-[#5D6567] font-medium mt-0.5">
                إشراف: {settings.name} • {settings.title}
              </div>
              <div className="text-xs text-[#78716C]">
                الدولة: {settings.teacherCountry}
              </div>
            </div>

            <div className="text-left sm:text-right bg-[#F8F5EE] border border-[#E8E1D5] rounded-xl px-4 py-2.5">
              <div className="text-xs text-[#4A5D4E] font-bold">تقرير شهر</div>
              <div className="text-base sm:text-lg font-extrabold text-[#2D3436] font-quran">
                {monthNameArabic}
              </div>
              <div className="text-[11px] text-[#78716C] font-mono">
                تاريخ الإصدار: {new Date().toISOString().slice(0, 10)}
              </div>
            </div>
          </div>

          {/* Student Info Card */}
          <div className="bg-[#F8F5EE] rounded-xl p-4 border border-[#E8E1D5] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#78716C] block">اسم الطالب:</span>
              <strong className="text-[#2D3436] text-sm font-bold flex items-center gap-1 mt-0.5">
                <span>{student.countryFlag}</span>
                <span>{student.name}</span>
              </strong>
            </div>

            <div>
              <span className="text-[#78716C] block">الدولة والتوقيت:</span>
              <strong className="text-[#2D3436] text-xs font-semibold block mt-0.5">
                {student.country} ({student.timezone.split('/')[1] || student.timezone})
              </strong>
            </div>

            <div>
              <span className="text-[#78716C] block">المسار التعليمي:</span>
              <strong className="text-[#2D3436] text-xs font-semibold block mt-0.5">
                {student.subjectDetail}
              </strong>
            </div>

            <div>
              <span className="text-[#78716C] block">المستوى:</span>
              <strong className="text-[#2D3436] text-xs font-semibold block mt-0.5">
                {student.level}
              </strong>
            </div>
          </div>

          {/* Monthly KPI Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="bg-[#EAE4D9] border border-[#D8CFBF] rounded-xl p-3 text-center">
              <span className="text-[11px] text-[#4A5D4E] font-bold block">الساعات المنجزة</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#36453A] font-mono mt-0.5">
                {totalCompletedHours.toFixed(1)} <span className="text-xs font-normal">ساعة</span>
              </div>
              <span className="text-[10px] text-[#5D6567] font-medium">
                من أصل {targetHours} ساعة مستهدفة
              </span>
            </div>

            <div className="bg-[#F8F5EE] border border-[#E8E1D5] rounded-xl p-3 text-center">
              <span className="text-[11px] text-[#4A5D4E] font-bold block">الحصص المكتملة</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#2D3436] font-mono mt-0.5">
                {completedSessions.length} <span className="text-xs font-normal">حصة</span>
              </div>
              <span className="text-[10px] text-[#78716C] font-medium">
                نسبة الإنجاز: {completionPercentage}%
              </span>
            </div>

            <div className="bg-[#FAF3E8] border border-[#E8D7C0] rounded-xl p-3 text-center">
              <span className="text-[11px] text-[#A67C52] font-bold block">متوسط التقييم</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#A67C52] font-mono mt-0.5 flex items-center justify-center gap-1">
                <span>
                  {completedSessions.length > 0
                    ? (
                        completedSessions.reduce((sum, s) => sum + (s.rating || 5), 0) /
                        completedSessions.length
                      ).toFixed(1)
                    : '5.0'}
                </span>
                <Star className="w-4 h-4 fill-[#A67C52] text-[#A67C52]" />
              </div>
              <span className="text-[10px] text-[#A67C52] font-medium">أداء متميز</span>
            </div>

            <div className="bg-[#F8F5EE] border border-[#E8E1D5] rounded-xl p-3 text-center">
              <span className="text-[11px] text-[#78716C] font-bold block">إجمالي المستحقات</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#2D3436] font-mono mt-0.5">
                {totalAmount.toFixed(0)} <span className="text-xs font-normal">{settings.currency}</span>
              </div>
              <span className="text-[10px] text-[#78716C] font-medium">
                {hourlyRate} {settings.currency} / ساعة
              </span>
            </div>

          </div>

          {/* Detailed Itemized Session Logs Table */}
          <div>
            <h4 className="font-bold text-sm text-[#2D3436] mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4A5D4E]" />
              <span>تفاصيل الحلقات والمنهج المنجز خلال الشهر:</span>
            </h4>

            {monthSessions.length === 0 ? (
              <div className="text-center py-6 text-[#78716C] text-xs bg-[#F8F5EE] rounded-xl border border-[#E8E1D5]">
                لا توجد حصص مسجلة لهذا الطالب في هذا الشهر بعد.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#E8E1D5] rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#F8F5EE] text-[#5D6567] font-bold border-b border-[#E8E1D5]">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">التاريخ والوقت</th>
                      <th className="p-2.5">المدة</th>
                      <th className="p-2.5">موضوع الحصة وما تم تسميعه</th>
                      <th className="p-2.5">الواجب والتكليف</th>
                      <th className="p-2.5 text-center">التقييم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E1D5] text-[#2D3436]">
                    {monthSessions.map((session, idx) => (
                      <tr key={session.id} className={session.status !== 'completed' ? 'bg-[#F8F5EE]/70 text-[#78716C]' : ''}>
                        <td className="p-2.5 font-mono text-[#78716C]">{idx + 1}</td>
                        <td className="p-2.5 font-mono font-medium whitespace-nowrap">
                          {session.date}
                          <span className="block text-[11px] text-[#78716C]">
                            {formatTime12(session.teacherStartTime)}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-[#4A5D4E] whitespace-nowrap">
                          {session.durationMinutes} دقيقة
                        </td>
                        <td className="p-2.5">
                          <span className="font-semibold block text-[#2D3436]">{session.subject}</span>
                          {session.progressNotes && (
                            <span className="text-[11px] text-[#5D6567] block mt-0.5">
                              {session.progressNotes}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-[11px] text-[#5D6567]">
                          {session.homework || '—'}
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap font-mono">
                          {session.rating ? (
                            <span className="inline-flex items-center gap-1 bg-[#FAF3E8] text-[#A67C52] px-2 py-0.5 rounded-full border border-[#E8D7C0] text-[11px] font-bold">
                              <span>{session.rating}</span>
                              <Star className="w-3 h-3 fill-[#A67C52] text-[#A67C52]" />
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Teacher Signature & Du'a footer */}
          <div className="pt-4 border-t border-[#E8E1D5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-2">
            <div>
              جزاكم الله خيراً، ونسأل الله أن يبارك في الطالب ويجعله من أهل القرآن الذين هم أهل الله وخاصته.
            </div>
            <div className="font-bold text-[#2D3436] font-quran text-sm">
              المعلم: {settings.name}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
