import React, { useState } from 'react';
import { ExamRecord, Student } from '../../types';
import {
  Award,
  Plus,
  Calendar,
  CheckCircle2,
  Share2,
  Printer,
  Sparkles,
  Search,
  MessageCircle,
  FileText,
  User,
} from 'lucide-react';

interface ExamsViewProps {
  exams: ExamRecord[];
  students: Student[];
  onSaveExams: (exams: ExamRecord[]) => void;
  onOpenWhatsAppModal?: (student: Student) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams = [],
  students = [],
  onSaveExams,
  onOpenWhatsAppModal,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedExamForCert, setSelectedExamForCert] = useState<ExamRecord | null>(null);

  // Add exam form state
  const [formStudentId, setFormStudentId] = useState<string>(students[0]?.id || '');
  const [formExamType, setFormExamType] = useState<ExamRecord['examType']>('juz_completion');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formSubject, setFormSubject] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Scores
  const [scoreMemorization, setScoreMemorization] = useState<number>(28);
  const [scoreTajweed, setScoreTajweed] = useState<number>(27);
  const [scoreStopsAndStarts, setScoreStopsAndStarts] = useState<number>(18);
  const [scoreFluency, setScoreFluency] = useState<number>(19);
  const [formNotes, setFormNotes] = useState<string>('');

  const totalScore = scoreMemorization + scoreTajweed + scoreStopsAndStarts + scoreFluency;

  const getGrade = (total: number): ExamRecord['grade'] => {
    if (total >= 90) return 'excellent';
    if (total >= 80) return 'very_good';
    if (total >= 70) return 'good';
    if (total >= 60) return 'pass';
    return 'needs_retake';
  };

  const getGradeArabic = (grade: ExamRecord['grade']) => {
    switch (grade) {
      case 'excellent':
        return 'ممتاز 🌟';
      case 'very_good':
        return 'جيد جداً 🌿';
      case 'good':
        return 'جيد 👍';
      case 'pass':
        return 'مقبول';
      default:
        return 'يحتاج إعادة وتثبيت ⚠️';
    }
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === formStudentId);
    if (!st) return;

    const grade = getGrade(totalScore);

    const newExam: ExamRecord = {
      id: `exam-${Date.now()}`,
      studentId: formStudentId,
      studentName: st.name,
      examType: formExamType,
      title: formTitle || `اختبار ${formSubject}`,
      subjectOrSurah: formSubject,
      date: formDate,
      scoreMemorization,
      scoreTajweed,
      scoreStopsAndStarts,
      scoreFluency,
      totalScore,
      grade,
      status: 'completed',
      teacherFeedback: formNotes || 'أداء طيب ومبارك نفع الله به.',
      certificateIssued: true,
    };

    onSaveExams([newExam, ...exams]);
    setShowAddModal(false);
    // Reset
    setFormTitle('');
    setFormSubject('');
    setFormNotes('');
  };

  const filteredExams = exams.filter(ex =>
    selectedStudentFilter === 'all' ? true : ex.studentId === selectedStudentFilter
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#4A5D4E] text-xs font-bold mb-1">
            <Award className="w-4 h-4" />
            <span>نظام تقييم واختبارات الطلاب والشهادات</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3436]">
            📝 الاختبارات والتقييم الدوري والشهادات
          </h1>
          <p className="text-sm text-[#5D6567] mt-1 max-w-2xl">
            جدولة الاختبارات الشفوية والتحريرية، تقييم الحفظ والتجويد والوقف والابتداء والطلاقة، وتوليد تقارير جاهزة للمشاركة مع أولياء الأمور.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-xs self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل نتيجة اختبار جديد</span>
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E8E1D5] px-3.5 py-2 rounded-2xl">
          <User className="w-4 h-4 text-[#5D6567]" />
          <span className="text-xs font-bold text-[#5D6567]">تصفية بحسب الطالب:</span>
          <select
            value={selectedStudentFilter}
            onChange={e => setSelectedStudentFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#2D3436] focus:outline-none"
          >
            <option value="all">جميع الطلاب ({exams.length})</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-[#5D6567] font-semibold">
          عدد الاختبارات المسجلة: {filteredExams.length}
        </span>
      </div>

      {/* 3. Exams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map(ex => {
          const st = students.find(s => s.id === ex.studentId);

          return (
            <div
              key={ex.id}
              className="bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#4A5D4E]/40 rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs bg-[#F8F5EE] text-[#5D6567] font-bold px-2.5 py-1 rounded-xl">
                    📅 {ex.date}
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                      ex.grade === 'excellent'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ex.grade === 'very_good'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {getGradeArabic(ex.grade)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-extrabold text-lg text-[#2D3436]">{ex.title}</h3>
                  {st?.countryFlag && <span>{st.countryFlag}</span>}
                </div>
                <p className="text-xs font-bold text-[#4A5D4E] mb-3">الطالب: {ex.studentName}</p>

                {/* Score breakdown pills */}
                <div className="bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl p-3 mb-4 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#5D6567]">
                    <span>الحفظ والإتقان:</span>
                    <strong className="text-[#2D3436]">{ex.scoreMemorization}/30</strong>
                  </div>
                  <div className="flex justify-between text-[#5D6567]">
                    <span>التجويد والمخارج:</span>
                    <strong className="text-[#2D3436]">{ex.scoreTajweed}/30</strong>
                  </div>
                  <div className="flex justify-between text-[#5D6567]">
                    <span>الوقف والابتداء:</span>
                    <strong className="text-[#2D3436]">{ex.scoreStopsAndStarts}/20</strong>
                  </div>
                  <div className="flex justify-between text-[#5D6567]">
                    <span>الطلاقة والأداء:</span>
                    <strong className="text-[#2D3436]">{ex.scoreFluency}/20</strong>
                  </div>
                  <div className="pt-2 border-t border-[#EFE9DD] flex justify-between font-bold text-sm text-[#4A5D4E]">
                    <span>المجموع الكلي:</span>
                    <span>{ex.totalScore} / 100</span>
                  </div>
                </div>

                {ex.teacherFeedback && (
                  <p className="text-xs text-[#5D6567] italic bg-[#F8F5EE] p-3 rounded-xl">
                    "{ex.teacherFeedback}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-[#EFE9DD] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedExamForCert(ex)}
                  className="flex-1 bg-[#4A5D4E] hover:bg-[#3D4C40] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>عرض الشهادة</span>
                </button>

                {st && onOpenWhatsAppModal && (
                  <button
                    onClick={() => onOpenWhatsAppModal(st)}
                    className="p-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-xl transition-all"
                    title="إرسال النتيجة للولي"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-[#E8E1D5] shadow-xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <h3 className="text-lg font-bold text-[#2D3436] mb-4">تسجيل نتيجة اختبار وتقييم طالب</h3>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">اختر الطالب *</label>
                  <select
                    value={formStudentId}
                    onChange={e => setFormStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.countryFlag} {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">نوع الاختبار</label>
                  <select
                    value={formExamType}
                    onChange={e => setFormExamType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                  >
                    <option value="juz_completion">إتمام جزء قرآني</option>
                    <option value="surah_memorization">حفظ سورة كاملة</option>
                    <option value="reading_foundation">تأسيس القراءة ونور البيان</option>
                    <option value="arabic_curriculum">منهج اللغة العربية</option>
                    <option value="tajweed_theory">التجويد والمتون</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">عنوان الاختبار</label>
                  <input
                    type="text"
                    value={formTitle || ''}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="مثال: اختبار إتقان جزء عم"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">تاريخ الاختبار</label>
                  <input
                    type="date"
                    value={formDate || ''}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">الموضوع أو المقرر المختبر</label>
                <input
                  type="text"
                  value={formSubject || ''}
                  onChange={e => setFormSubject(e.target.value)}
                  placeholder="مثال: سورة الملك حتى سورة المرسلات"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {/* 4 Score Criterion Sliders */}
              <div className="bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl p-4 space-y-4">
                <h4 className="font-bold text-xs text-[#2D3436]">معايير الدرجات (إجمالي 100):</h4>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-bold">
                    <span>1. الحفظ والضبط والإتقان (من 30):</span>
                    <span className="text-[#4A5D4E]">{scoreMemorization}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={scoreMemorization ?? 25}
                    onChange={e => setScoreMemorization(Number(e.target.value))}
                    className="w-full accent-[#4A5D4E]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-bold">
                    <span>2. التجويد والمخارج والصفات (من 30):</span>
                    <span className="text-[#4A5D4E]">{scoreTajweed}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={scoreTajweed ?? 25}
                    onChange={e => setScoreTajweed(Number(e.target.value))}
                    className="w-full accent-[#4A5D4E]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-bold">
                    <span>3. الوقف والابتداء وحسن التلاوة (من 20):</span>
                    <span className="text-[#4A5D4E]">{scoreStopsAndStarts}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={scoreStopsAndStarts ?? 15}
                    onChange={e => setScoreStopsAndStarts(Number(e.target.value))}
                    className="w-full accent-[#4A5D4E]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-bold">
                    <span>4. الطلاقة والسرعة المعتدلة (من 20):</span>
                    <span className="text-[#4A5D4E]">{scoreFluency}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={scoreFluency ?? 15}
                    onChange={e => setScoreFluency(Number(e.target.value))}
                    className="w-full accent-[#4A5D4E]"
                  />
                </div>

                <div className="pt-3 border-t border-[#EFE9DD] flex items-center justify-between text-sm font-extrabold text-[#4A5D4E]">
                  <span>المجموع الكلي: {totalScore} / 100</span>
                  <span>التقدير: {getGradeArabic(getGrade(totalScore))}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">ملاحظات وتوصيات المعلم للطالب</label>
                <textarea
                  rows={2}
                  value={formNotes || ''}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="ملاحظات للارتقاء بالأداء..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFE9DD]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs font-bold text-[#5D6567] hover:bg-[#F8F5EE]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3D4C40] text-white text-xs font-bold"
                >
                  حفظ نتيجة الاختبار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedExamForCert && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl p-8 max-w-2xl w-full border-4 border-[#D4A373] shadow-2xl relative animate-fadeIn text-center">
            <div className="absolute top-4 left-4">
              <button
                onClick={() => setSelectedExamForCert(null)}
                className="text-[#8A9396] hover:text-[#2D3436] text-sm font-bold"
              >
                ✕ إغلاق
              </button>
            </div>

            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-[#4A5D4E] text-[#D4A373] rounded-full flex items-center justify-center mb-3 shadow-md">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-[#4A5D4E] tracking-tight">شهادة إتقان واجتياز</h2>
              <p className="text-xs text-[#8C5D30] font-bold mt-1">مقرأة القرآن الكريم والعلوم الشرعية</p>
            </div>

            <div className="my-6 space-y-3 text-[#2D3436]">
              <p className="text-sm">يشهد معلم القرآن الكريم بأن الطالب المجد:</p>
              <h3 className="text-2xl font-extrabold text-[#4A5D4E] underline decoration-[#D4A373]">
                {selectedExamForCert.studentName}
              </h3>
              <p className="text-sm max-w-md mx-auto leading-relaxed">
                قد اجتاز بنجاح وتفوق اختبار <strong className="text-[#2D3436]">{selectedExamForCert.title}</strong>{' '}
                وحصل على درجة <strong className="text-[#4A5D4E] font-bold">{selectedExamForCert.totalScore}/100</strong>{' '}
                بتقدير <strong className="text-[#D4A373] font-bold">{getGradeArabic(selectedExamForCert.grade)}</strong>.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-2xl p-4 max-w-md mx-auto grid grid-cols-4 gap-2 text-xs font-bold text-center mb-6">
              <div>
                <span className="block text-[10px] text-[#5D6567]">الحفظ</span>
                <span className="text-[#4A5D4E]">{selectedExamForCert.scoreMemorization}/30</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#5D6567]">التجويد</span>
                <span className="text-[#4A5D4E]">{selectedExamForCert.scoreTajweed}/30</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#5D6567]">الوقف</span>
                <span className="text-[#4A5D4E]">{selectedExamForCert.scoreStopsAndStarts}/20</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#5D6567]">الطلاقة</span>
                <span className="text-[#4A5D4E]">{selectedExamForCert.scoreFluency}/20</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E1D5] flex items-center justify-between text-xs text-[#5D6567]">
              <span>التاريخ: {selectedExamForCert.date}</span>
              <span className="font-bold text-[#4A5D4E]">ختم وتوقيع المعلم المعتمد</span>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
