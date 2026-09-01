import React, { useState } from 'react';
import { CurriculumTrack, Student, StudentCurriculumProgress } from '../../types';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  Search,
  Users,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Award,
} from 'lucide-react';

interface CurriculaViewProps {
  curricula: CurriculumTrack[];
  students: Student[];
  onSaveCurricula: (curricula: CurriculumTrack[]) => void;
  onUpdateStudentProgress: (studentId: string, progress: StudentCurriculumProgress[]) => void;
}

export const CurriculaView: React.FC<CurriculaViewProps> = ({
  curricula = [],
  students = [],
  onSaveCurricula,
  onUpdateStudentProgress,
}) => {
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>(curricula[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddCurriculumModal, setShowAddCurriculumModal] = useState<boolean>(false);
  const [showAddStageModal, setShowAddStageModal] = useState<boolean>(false);

  // New curriculum form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CurriculumTrack['category']>('custom');
  const [newDescription, setNewDescription] = useState('');

  // Selected curriculum
  const activeCurriculum = curricula.find(c => c.id === selectedCurriculumId) || curricula[0];

  // Students enrolled in this curriculum
  const enrolledStudents = students.filter(s =>
    s.curricula?.some(cp => cp.curriculumId === activeCurriculum?.id)
  );

  const handleCreateCurriculum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTrack: CurriculumTrack = {
      id: `curr-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      description: newDescription,
      isCustom: true,
      stages: [
        {
          id: `stg-${Date.now()}-1`,
          name: 'المرحلة التمهيدية الأولى',
          totalUnitsOrLessons: 10,
          description: 'الوحدات الأساسية',
        },
      ],
    };

    const updated = [...curricula, newTrack];
    onSaveCurricula(updated);
    setSelectedCurriculumId(newTrack.id);
    setNewTitle('');
    setNewDescription('');
    setShowAddCurriculumModal(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header with Natural Tones */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#4A5D4E] text-xs font-bold mb-1">
            <BookOpen className="w-4 h-4" />
            <span>المناهج والمسارات التعليمية المعتمدة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3436]">
            📚 المسارات التعليمية والمقررات
          </h1>
          <p className="text-sm text-[#5D6567] mt-1 max-w-2xl">
            متابعة دقيقة لمراحل تأسيس القراءة، القراءة السليمة، العربية لغير الناطقين، متون التجويد، والمناهج المخصصة لكل طالب.
          </p>
        </div>

        <button
          onClick={() => setShowAddCurriculumModal(true)}
          className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-xs self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مسار أو منهج جديد</span>
        </button>
      </div>

      {/* 2. Horizontal Navigation for Curricula Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {curricula.map(curr => {
          const isSelected = curr.id === activeCurriculum?.id;
          const studentCount = students.filter(s =>
            s.curricula?.some(cp => cp.curriculumId === curr.id)
          ).length;

          return (
            <div
              key={curr.id}
              onClick={() => setSelectedCurriculumId(curr.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#4A5D4E] text-[#FDFBF7] border-[#4A5D4E] shadow-sm'
                  : 'bg-[#FFFFFF] text-[#2D3436] border-[#E8E1D5] hover:border-[#4A5D4E]/40 hover:bg-[#FDFBF7]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-[#E2EBD8]'
                        : 'bg-[#F8F5EE] text-[#5D6567]'
                    }`}
                  >
                    {curr.category === 'reading' || (curr.category as string) === 'reading_foundation'
                      ? 'تأسيس قراءة'
                      : curr.category === 'arabic' || (curr.category as string) === 'arabic_non_native'
                      ? 'عربية لغير الناطقين'
                      : curr.category === 'tajweed' || (curr.category as string) === 'tajweed_mastery'
                      ? 'تجويد ومتون'
                      : curr.category === 'quran' || (curr.category as string) === 'fluent_recitation'
                      ? 'قراءة سليمة'
                      : curr.category === 'islamic'
                      ? 'دراسات إسلامية'
                      : 'منهج مخصص'}
                  </span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-[#E2EBD8]' : 'text-[#4A5D4E]'}`}>
                    {studentCount} طلاب
                  </span>
                </div>
                <h3 className="font-bold text-base mb-1">{curr.title}</h3>
                <p
                  className={`text-xs line-clamp-2 ${
                    isSelected ? 'text-white/80' : 'text-[#5D6567]'
                  }`}
                >
                  {curr.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span>{curr.stages.length} مراحل دراسية</span>
                <span className="font-semibold">{isSelected ? '✓ معروض حالياً' : 'عرض التفاصيل'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Detailed Curriculum View with Stages & Student Progress */}
      {activeCurriculum && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stages Breakdown (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#2D3436] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#4A5D4E]" />
                    <span>مراحل ووحدات: {activeCurriculum.title}</span>
                  </h2>
                  <p className="text-xs text-[#5D6567] mt-0.5">{activeCurriculum.description}</p>
                </div>
                <span className="text-xs bg-[#F8F5EE] text-[#4A5D4E] font-bold px-3 py-1 rounded-xl">
                  {activeCurriculum.stages.length} مراحل
                </span>
              </div>

              <div className="space-y-4">
                {activeCurriculum.stages.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className="p-4 bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl hover:border-[#4A5D4E]/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-[#2D3436]">{stage.name}</h4>
                      </div>
                      <span className="text-xs bg-[#EFE9DD] text-[#5D6567] px-2.5 py-1 rounded-lg font-semibold">
                        {stage.totalUnitsOrLessons} درس / وحدة
                      </span>
                    </div>

                    {stage.description && (
                      <p className="text-xs text-[#5D6567] mr-8 mb-2 leading-relaxed">
                        {stage.description}
                      </p>
                    )}

                    {(stage as any).recommendedBooks && (stage as any).recommendedBooks.length > 0 && (
                      <div className="mr-8 flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-[#5D6567]">الكتب المعتمدة:</span>
                        {((stage as any).recommendedBooks as string[]).map((bk, bIdx) => (
                          <span
                            key={bIdx}
                            className="text-[11px] bg-[#FFFFFF] border border-[#E8E1D5] text-[#2D3436] px-2 py-0.5 rounded-md font-medium"
                          >
                            📖 {bk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Students Enrolled in this Track (Col 3) */}
          <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-[#2D3436] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#4A5D4E]" />
                  <span>الطلاب المسجلون في هذا المنهج</span>
                </h3>
                <span className="text-xs bg-[#F8F5EE] text-[#4A5D4E] font-bold px-2 py-0.5 rounded-lg">
                  {enrolledStudents.length}
                </span>
              </div>

              {enrolledStudents.length > 0 ? (
                <div className="space-y-3">
                  {enrolledStudents.map(st => {
                    const progressItem = st.curricula?.find(
                      cp => cp.curriculumId === activeCurriculum.id
                    );
                    const pct = progressItem?.progressPercent || 0;

                    return (
                      <div
                        key={st.id}
                        className="p-3.5 bg-[#FDFBF7] border border-[#EFE9DD] rounded-2xl"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#2D3436]">{st.name}</span>
                            <span className="text-xs">{st.countryFlag}</span>
                          </div>
                          <span className="text-xs font-bold text-[#4A5D4E]">{pct}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-[#EFE9DD] rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-[#4A5D4E] rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="text-[11px] text-[#5D6567] flex items-center justify-between">
                          <span>الموقع: {progressItem?.currentUnitOrPage || 'البداية'}</span>
                          {st.age && <span>{st.age} سنة</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#FDFBF7] rounded-2xl border border-dashed border-[#E8E1D5]">
                  <Users className="w-8 h-8 text-[#8A9396] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-[#2D3436]">لا يوجد طلاب مسجلون في هذا المنهج حالياً</p>
                  <p className="text-[11px] text-[#5D6567] mt-0.5">يمكنك ربط الطلاب بهذا المسار من صفحة الطالب.</p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[#EFE9DD] text-center text-xs text-[#5D6567]">
              يتم تحديث نسب الإنجاز تلقائياً عند تسجيل الملاحظات اليومية بعد كل حصة.
            </div>
          </div>
        </div>
      )}

      {/* Add Curriculum Modal */}
      {showAddCurriculumModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#E8E1D5] shadow-xl animate-fadeIn">
            <h3 className="text-lg font-bold text-[#2D3436] mb-4">إضافة مسار تعليمي مخصص جديد</h3>
            
            <form onSubmit={handleCreateCurriculum} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">اسم المسار أو المنهج *</label>
                <input
                  type="text"
                  required
                  value={newTitle || ''}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="مثال: دورة مخارج الحروف والصفات المكثفة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">تصنيف المنهج</label>
                <select
                  value={newCategory || 'reading_foundation'}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                >
                  <option value="reading_foundation">تأسيس القراءة</option>
                  <option value="fluent_recitation">القراءة السليمة</option>
                  <option value="arabic_non_native">العربية لغير الناطقين بها</option>
                  <option value="tajweed_mastery">التجويد والإتقان</option>
                  <option value="custom">مسار وخطة خاصة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">وصف المنهج وأهدافه</label>
                <textarea
                  rows={3}
                  value={newDescription || ''}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="اكتب نبذة عن الفئة المستهدفة ومخرجات التعلم..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFE9DD]">
                <button
                  type="button"
                  onClick={() => setShowAddCurriculumModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs font-bold text-[#5D6567] hover:bg-[#F8F5EE]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3D4C40] text-white text-xs font-bold"
                >
                  حفظ المسار التعليمي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
