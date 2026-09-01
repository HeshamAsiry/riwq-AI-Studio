import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  BookOpen,
  Sparkles,
  Heart,
  Save,
  CheckCircle2,
  Calendar,
  Feather,
} from 'lucide-react';
import { DailyWerdLog, QuranPersonalGoal } from '../../types';
import confetti from 'canvas-confetti';

interface DailyWerdChecklistProps {
  todayLog: DailyWerdLog;
  quranGoals: QuranPersonalGoal[];
  onUpdateLog: (log: DailyWerdLog) => void;
  onToggleGoalToday: (goalId: string) => void;
}

export const DailyWerdChecklist: React.FC<DailyWerdChecklistProps> = ({
  todayLog,
  quranGoals,
  onUpdateLog,
  onToggleGoalToday,
}) => {
  const [formData, setFormData] = useState<DailyWerdLog>({ ...todayLog });
  const [isSaved, setIsSaved] = useState(false);

  const handleToggle = (field: keyof DailyWerdLog) => {
    const updated = {
      ...formData,
      [field]: !formData[field],
    };
    setFormData(updated);
    onUpdateLog(updated);

    if (!formData[field]) {
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
        });
      } catch (e) {}
    }
  };

  const handleSaveNotes = () => {
    onUpdateLog(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-[#FDFBF7] rounded-2xl border border-[#E8E1D5] shadow-xs overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#36453A] text-[#FDFBF7] p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#2B382D] text-[#C8D7CC]">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg font-quran text-[#FDFBF7]">
              متابعة الورد اليومي وجدول اليوم
            </h3>
            <p className="text-xs text-[#C8D7CC]">
              تثبيت الورد الشخصي للمعلم من الحفظ والمراجعة وطلب العلم والأذكار
            </p>
          </div>
        </div>

        <div className="text-xs bg-[#2B382D] border border-[#4A5D4E] px-3 py-1.5 rounded-xl font-mono text-[#C8D7CC] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formData.date}</span>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="p-5 space-y-4">
        
        {/* Main Checklist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Item 1: Quran New Memorization */}
          <div
            onClick={() => handleToggle('quranNewHifzDone')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
              formData.quranNewHifzDone
                ? 'bg-[#F0EBE1] border-[#4A5D4E] text-[#2D3436]'
                : 'bg-white border-[#E8E1D5] hover:bg-[#F8F5EE] text-[#5D6567]'
            }`}
          >
            <div className="mt-0.5">
              {formData.quranNewHifzDone ? (
                <CheckSquare className="w-5 h-5 text-[#4A5D4E]" />
              ) : (
                <Square className="w-5 h-5 text-[#D8CFBF]" />
              )}
            </div>
            <div>
              <span className="font-bold text-sm block text-[#2D3436]">1. الحفظ القرآني الجديد (المتقن)</span>
              <span className="text-xs text-[#5D6567] block mt-0.5">
                تسميع الصفحة اليومية مع التكرار والربط
              </span>
            </div>
          </div>

          {/* Item 2: Quran Revision */}
          <div
            onClick={() => handleToggle('quranRevisionDone')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
              formData.quranRevisionDone
                ? 'bg-[#F0EBE1] border-[#4A5D4E] text-[#2D3436]'
                : 'bg-white border-[#E8E1D5] hover:bg-[#F8F5EE] text-[#5D6567]'
            }`}
          >
            <div className="mt-0.5">
              {formData.quranRevisionDone ? (
                <CheckSquare className="w-5 h-5 text-[#4A5D4E]" />
              ) : (
                <Square className="w-5 h-5 text-[#D8CFBF]" />
              )}
            </div>
            <div>
              <span className="font-bold text-sm block text-[#2D3436]">2. مراجعة القرآن الكبرى والصغرى</span>
              <span className="text-xs text-[#5D6567] block mt-0.5">
                سرد الورد اليومي (جزء أو أكثر) في المحراب والصلاة
              </span>
            </div>
          </div>

          {/* Item 3: Islamic Studies Book Reading */}
          <div
            onClick={() => handleToggle('islamicStudyDone')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
              formData.islamicStudyDone
                ? 'bg-[#F0EBE1] border-[#4A5D4E] text-[#2D3436]'
                : 'bg-white border-[#E8E1D5] hover:bg-[#F8F5EE] text-[#5D6567]'
            }`}
          >
            <div className="mt-0.5">
              {formData.islamicStudyDone ? (
                <CheckSquare className="w-5 h-5 text-[#4A5D4E]" />
              ) : (
                <Square className="w-5 h-5 text-[#D8CFBF]" />
              )}
            </div>
            <div>
              <span className="font-bold text-sm block text-[#2D3436]">3. دراسة العلم الشرعي ومطالعة الكتب</span>
              <span className="text-xs text-[#5D6567] block mt-0.5">
                قراءة متون الفقه، النحو، التفسير، الحديث وتدوين الفوائد
              </span>
            </div>
          </div>

          {/* Item 4: Adhkar & Nawafil */}
          <div
            onClick={() => handleToggle('adhkarDone')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
              formData.adhkarDone
                ? 'bg-[#F0EBE1] border-[#4A5D4E] text-[#2D3436]'
                : 'bg-white border-[#E8E1D5] hover:bg-[#F8F5EE] text-[#5D6567]'
            }`}
          >
            <div className="mt-0.5">
              {formData.adhkarDone ? (
                <CheckSquare className="w-5 h-5 text-[#4A5D4E]" />
              ) : (
                <Square className="w-5 h-5 text-[#D8CFBF]" />
              )}
            </div>
            <div>
              <span className="font-bold text-sm block text-[#2D3436]">4. أذكار الصباح والمساء والسنن الرواتب</span>
              <span className="text-xs text-[#5D6567] block mt-0.5">
                حصن المسلم والورد اليومي من الاستغفار والصلاة على النبي ﷺ
              </span>
            </div>
          </div>

        </div>

        {/* Detailed inputs: What was reviewed & read today */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1">
              ما تمت مراجعته اليوم من القرآن:
            </label>
            <input
              type="text"
              value={formData.quranRevisionAmount || ''}
              onChange={e => setFormData({ ...formData, quranRevisionAmount: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-xs text-[#2D3436] focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              placeholder="مثال: سورة هود + الجزء الخامس كاملاً"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1">
              الكتاب والصفحات المقروءة في العلم الشرعي:
            </label>
            <input
              type="text"
              value={formData.bookStudied || ''}
              onChange={e => setFormData({ ...formData, bookStudied: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-xs text-[#2D3436] focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              placeholder="مثال: زاد المستقنع (ص 140-148) وشرح الشيخ"
            />
          </div>
        </div>

        {/* Reflections & Daily Benefits Journal */}
        <div>
          <label className="block text-xs font-bold text-[#5D6567] mb-1 flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>خاطرة / فائدة علمية وتدبر لليوم:</span>
          </label>
          <textarea
            rows={2}
            value={formData.reflections || ''}
            onChange={e => setFormData({ ...formData, reflections: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-xs text-[#2D3436] focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
            placeholder="دوّن فائدة مرت بك اليوم في وردك أو تدريسك لتبقى محفوظة في سجل إنجازك..."
          />
        </div>

        {/* Save log button */}
        <div className="flex items-center justify-between pt-1">
          {isSaved ? (
            <span className="text-xs text-[#4A5D4E] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم حفظ ورد اليوم بنجاح!</span>
            </span>
          ) : (
            <span className="text-[11px] text-[#5D6567]">
              * احرص على تدوين وردك يومياً للمحافظة على الاستمرارية والبركة
            </span>
          )}

          <button
            onClick={handleSaveNotes}
            className="bg-[#4A5D4E] hover:bg-[#3D4D40] active:scale-95 text-[#FDFBF7] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ بيانات الورد</span>
          </button>
        </div>

      </div>

    </div>
  );
};
