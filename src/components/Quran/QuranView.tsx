import React, { useState } from 'react';
import {
  Student,
  StudentQuranHifz,
  StudentQuranRevision,
  CompletedJuzRecord,
} from '../../types';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  Search,
  Plus,
  Bookmark,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { JUZ_LIST } from '../../data/defaultData';

interface QuranViewProps {
  students: Student[];
  studentHifz: StudentQuranHifz[];
  studentRevision: StudentQuranRevision[];
  completedJuz: CompletedJuzRecord[];
  onSaveHifz: (items: StudentQuranHifz[]) => void;
  onSaveRevision: (items: StudentQuranRevision[]) => void;
  onSaveCompletedJuz: (items: CompletedJuzRecord[]) => void;
}

export const QuranView: React.FC<QuranViewProps> = ({
  students = [],
  studentHifz = [],
  studentRevision = [],
  completedJuz = [],
  onSaveHifz,
  onSaveRevision,
  onSaveCompletedJuz,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'hifz' | 'revision' | 'juz_map'>('hifz');

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Hifz records for selected student
  const studentHifzRecords = studentHifz.filter(h => h.studentId === currentStudent?.id);
  const studentRevRecords = studentRevision.filter(r => r.studentId === currentStudent?.id);
  const studentJuzRecords = completedJuz.filter(j => j.studentId === currentStudent?.id);

  // Toggle Juz completion status
  const handleToggleJuz = (juzNumber: number) => {
    if (!currentStudent) return;
    const existing = studentJuzRecords.find(j => j.juzNumber === juzNumber);

    if (existing) {
      // Toggle from passed to in_progress or remove
      const updated = completedJuz.filter(
        j => !(j.studentId === currentStudent.id && j.juzNumber === juzNumber)
      );
      onSaveCompletedJuz(updated);
    } else {
      // Add as passed
      const newRec: CompletedJuzRecord = {
        id: `juz-${Date.now()}-${juzNumber}`,
        studentId: currentStudent.id,
        juzNumber,
        juzName: JUZ_LIST.find(j => j.number === juzNumber)?.name || `الجزء ${juzNumber}`,
        completionDate: new Date().toISOString().split('T')[0],
        examScore: 95,
        rating: 'excellent',
        teacherNotes: 'تم الإتقان وعرض الجزء كاملاً.',
      };
      onSaveCompletedJuz([...completedJuz, newRec]);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header with Natural Tones */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#4A5D4E] text-xs font-bold mb-1">
            <BookOpen className="w-4 h-4" />
            <span>نظام مدارسة وحفظ ومراجعة القرآن الكريم</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3436]">
            🕌 متابعة القرآن الكريم للأبناء والطلاب
          </h1>
          <p className="text-sm text-[#5D6567] mt-1 max-w-2xl">
            متابعة الحفظ الجديد، المراجعة الصغرى (القريبة) والكبرى (البعيدة)، ولوحة تفاعلية لإتمام الأجزاء الثلاثين.
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex items-center gap-2 self-start md:self-center bg-[#F8F5EE] border border-[#E8E1D5] p-2 rounded-2xl">
          <span className="text-xs font-bold text-[#5D6567] pr-2">اختر الطالب:</span>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="bg-white border border-[#E8E1D5] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D3436] focus:outline-none focus:border-[#4A5D4E]"
          >
            {students.map(st => (
              <option key={st.id} value={st.id}>
                {st.countryFlag} {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Sub-tab switcher */}
      <div className="flex items-center gap-2 border-b border-[#E8E1D5] pb-2">
        <button
          onClick={() => setActiveTab('hifz')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'hifz'
              ? 'bg-[#4A5D4E] text-white shadow-xs'
              : 'text-[#5D6567] hover:bg-[#F8F5EE] hover:text-[#2D3436]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>الحفظ الجديد والتسميع</span>
        </button>

        <button
          onClick={() => setActiveTab('revision')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'revision'
              ? 'bg-[#4A5D4E] text-white shadow-xs'
              : 'text-[#5D6567] hover:bg-[#F8F5EE] hover:text-[#2D3436]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>المراجعة القريبة والبعيدة</span>
        </button>

        <button
          onClick={() => setActiveTab('juz_map')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'juz_map'
              ? 'bg-[#4A5D4E] text-white shadow-xs'
              : 'text-[#5D6567] hover:bg-[#F8F5EE] hover:text-[#2D3436]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>لوحة إتمام الأجزاء (1 - 30)</span>
          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-black">
            {studentJuzRecords.length}/30
          </span>
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'hifz' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#2D3436] flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#4A5D4E]" />
                <span>سجل الحفظ الحالي للطالب: {currentStudent?.name}</span>
              </h3>
            </div>

            {studentHifzRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentHifzRecords.map(rec => (
                  <div
                    key={rec.id}
                    className="p-5 bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-extrabold text-[#2D3436]">
                        سورة {rec.surahName}
                      </span>
                      <span className="text-xs bg-[#EFE9DD] text-[#4A5D4E] font-bold px-2.5 py-1 rounded-lg">
                        {rec.status === 'mastered' ? 'متقن 🌟' : rec.status === 'memorized' ? 'تم الحفظ ✅' : 'قيد الحفظ 📖'}
                      </span>
                    </div>

                    <div className="text-xs text-[#5D6567] space-y-1">
                      <div>المقطع: من الآية {rec.fromAyah} إلى الآية {rec.toAyah} ({rec.amount || 'مقطع'})</div>
                      <div>تاريخ الحفظ: {rec.hifzDate}</div>
                      {rec.notes && <div className="text-[#2D3436] font-medium pt-1">ملاحظة: {rec.notes}</div>}
                    </div>

                    <div className="w-full h-2 bg-[#EFE9DD] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4A5D4E] rounded-full"
                        style={{ width: `${rec.status === 'mastered' ? 100 : rec.status === 'memorized' ? 85 : 50}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#FDFBF7] rounded-2xl border border-dashed border-[#E8E1D5]">
                <p className="text-xs font-bold text-[#2D3436]">لا يوجد سجل حفظ مخصص مدخل لهذا الطالب بعد</p>
                <p className="text-[11px] text-[#5D6567] mt-0.5">يمكنك إضافة سورة وآيات الحفظ ومتابعتها بعد الحصة.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'revision' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs">
            <h3 className="font-bold text-lg text-[#2D3436] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#4A5D4E]" />
              <span>سجل مراجعة القرآن: {currentStudent?.name}</span>
            </h3>

            {studentRevRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentRevRecords.map(rev => (
                  <div
                    key={rev.id}
                    className="p-5 bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#EFE9DD] text-[#4A5D4E]">
                        مراجعة سورة {rev.surahName}
                      </span>
                      <span className="text-xs font-bold text-[#2D3436]">
                        الإتقان: {rev.masteryLevel >= 4 ? 'ممتاز ★★★★★' : rev.masteryLevel === 3 ? 'جيد جداً ★★★' : 'يحتاج تثبيت ★★'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-[#2D3436]">
                      {rev.fromAyah && rev.toAyah ? `من الآية ${rev.fromAyah} إلى ${rev.toAyah}` : `سورة ${rev.surahName}`}
                    </h4>
                    
                    <div className="text-xs text-[#5D6567] space-y-1">
                      <div>تاريخ المراجعة: {rev.revisionDate}</div>
                      {typeof rev.mistakesCount === 'number' && (
                        <div>عدد التنبيهات والأخطاء: {rev.mistakesCount}</div>
                      )}
                      {rev.notes && <div className="text-emerald-800 font-medium">الملاحظات: {rev.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#FDFBF7] rounded-2xl border border-dashed border-[#E8E1D5]">
                <p className="text-xs font-bold text-[#2D3436]">لا توجد خطة مراجعة مسجلة لهذا الطالب حالياً</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'juz_map' && (
        <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-[#2D3436] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#4A5D4E]" />
                <span>لوحة إتمام الأجزاء القرآنية (1 إلى 30)</span>
              </h3>
              <p className="text-xs text-[#5D6567] mt-0.5">
                اضغط على أي جزء لتحديده كمنجز أو ملغي للطالب: <strong className="text-[#2D3436]">{currentStudent?.name}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تم الإنجاز والامتحان ({studentJuzRecords.length})</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-[#5D6567] bg-[#F8F5EE] px-3 py-1 rounded-xl">
                <span>قيد الحفظ ({30 - studentJuzRecords.length})</span>
              </span>
            </div>
          </div>

          {/* 30 Juz Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {JUZ_LIST.map(juz => {
              const isCompleted = studentJuzRecords.some(j => j.juzNumber === juz.number);
              const record = studentJuzRecords.find(j => j.juzNumber === juz.number);

              return (
                <div
                  key={juz.number}
                  onClick={() => handleToggleJuz(juz.number)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-center flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-[#4A5D4E] text-[#FDFBF7] border-[#4A5D4E] shadow-xs'
                      : 'bg-[#FDFBF7] text-[#2D3436] border-[#E8E1D5] hover:border-[#4A5D4E]/40 hover:bg-[#F8F5EE]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono opacity-80">#{juz.number}</span>
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A373]" />}
                  </div>

                  <h4 className="font-extrabold text-sm mb-1">{juz.name}</h4>
                  <p className={`text-[10px] truncate ${isCompleted ? 'text-white/80' : 'text-[#5D6567]'}`}>
                    {juz.startSurah}
                  </p>

                  <div className="mt-2 pt-2 border-t border-white/10 text-[10px]">
                    {isCompleted ? (
                      <span className="text-[#D4A373] font-bold">درجة: {record?.examScore || 95}%</span>
                    ) : (
                      <span className="text-[#8A9396]">انقر للإنجاز</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
