import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Calendar,
  Flame,
  Award,
  Edit2,
  Check,
  Plus,
} from 'lucide-react';
import { QuranPersonalGoal } from '../../types';
import confetti from 'canvas-confetti';

interface QuranTrackerProps {
  goals: QuranPersonalGoal[];
  onToggleGoal: (goalId: string) => void;
  onUpdateGoal: (goal: QuranPersonalGoal) => void;
}

export const QuranTracker: React.FC<QuranTrackerProps> = ({
  goals,
  onToggleGoal,
  onUpdateGoal,
}) => {
  const [editingGoal, setEditingGoal] = useState<QuranPersonalGoal | null>(null);

  const handleToggle = (goal: QuranPersonalGoal) => {
    onToggleGoal(goal.id);
    if (!goal.isCompletedToday) {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      onUpdateGoal(editingGoal);
      setEditingGoal(null);
    }
  };

  return (
    <div className="space-y-4">
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-[#2D3436] font-quran flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#4A5D4E]" />
            <span>خطة ومسارات حفظ ومراجعة القرآن الكريم</span>
          </h3>
          <p className="text-xs text-[#5D6567]">
            طريقة المحراب والحصون الخمسة لتثبيت القرآن وإتقانه
          </p>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => (
          <div
            key={goal.id}
            className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between ${
              goal.isCompletedToday
                ? 'bg-[#F0EBE1] border-[#4A5D4E] shadow-xs'
                : 'bg-white border-[#E8E1D5] hover:border-[#4A5D4E]/40'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[11px] font-bold text-[#4A5D4E] bg-[#EAE5D9] px-2.5 py-0.5 rounded-full inline-block mb-1">
                    {goal.type === 'hifz_new'
                      ? 'الحفظ الجديد'
                      : goal.type === 'revision_near'
                      ? 'المراجعة القريبة'
                      : goal.type === 'revision_far'
                      ? 'المراجعة الكبرى'
                      : 'التدبر والتفسير'}
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-[#2D3436]">
                    {goal.title}
                  </h4>
                </div>

                <button
                  onClick={() => setEditingGoal(goal)}
                  className="p-1.5 rounded-lg text-[#5D6567] hover:text-[#2D3436] hover:bg-[#F8F5EE] transition"
                  title="تعديل الهدف والموضع"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Current Surah / Position */}
              <div className="my-2 bg-[#F8F5EE] border border-[#E8E1D5] rounded-xl p-2.5 text-xs text-[#2D3436]">
                <span className="text-[#5D6567] block text-[11px]">الموضع الحالي المقرر:</span>
                <strong className="text-[#2D3436] font-bold text-sm block mt-0.5 font-quran">
                  {goal.currentSurah}
                </strong>
                <span className="text-[#5D6567] block mt-1 text-[11px]">
                  📌 المقدار اليومي: <strong>{goal.dailyAmount}</strong>
                </span>
              </div>
            </div>

            {/* Bottom Actions & Streak */}
            <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[#5D6567]">
                <Flame className="w-4 h-4 text-[#A67C52]" />
                <span>
                  أنجزت <strong>{goal.completedDaysThisMonth}</strong> يوماً هذا الشهر
                </span>
              </div>

              <button
                onClick={() => handleToggle(goal)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                  goal.isCompletedToday
                    ? 'bg-[#4A5D4E] text-[#FDFBF7]'
                    : 'bg-[#F8F5EE] hover:bg-[#EAE5D9] text-[#2D3436] border border-[#D8CFBF]'
                }`}
              >
                {goal.isCompletedToday ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#C8D7CC]" />
                    <span>تم إنجاز اليوم ✅</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل إنجاز اليوم</span>
                  </>
                )}
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-xl border border-[#E8E1D5] max-w-md w-full p-6 text-[#2D3436] text-sm">
            <h3 className="font-bold text-base text-[#2D3436] mb-3">
              تعديل مسار: {editingGoal.title}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#5D6567] mb-1">
                  الموضع / السورة المقررة حالياً:
                </label>
                <input
                  type="text"
                  value={editingGoal.currentSurah}
                  onChange={e =>
                    setEditingGoal({ ...editingGoal, currentSurah: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm text-[#2D3436] focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5D6567] mb-1">
                  المقدار والورد اليومي:
                </label>
                <input
                  type="text"
                  value={editingGoal.dailyAmount}
                  onChange={e =>
                    setEditingGoal({ ...editingGoal, dailyAmount: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm text-[#2D3436] focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="px-3 py-1.5 text-[#5D6567] hover:text-[#2D3436] text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#4A5D4E] hover:bg-[#3D4D40] text-[#FDFBF7] text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
