import React from 'react';
import { AlertTriangle, ChevronRight, CheckCircle } from 'lucide-react';
import { TimeConflict } from '../../types';

interface ConflictAlertBannerProps {
  conflicts: TimeConflict[];
  onResolveClick?: (conflict: TimeConflict) => void;
}

export const ConflictAlertBanner: React.FC<ConflictAlertBannerProps> = ({
  conflicts,
  onResolveClick,
}) => {
  if (conflicts.length === 0) return null;

  return (
    <div className="bg-[#FAF0ED] border-2 border-[#E08F81] rounded-2xl p-4 sm:p-5 mb-6 text-[#6B2020] shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#F3D5D0] text-[#8E2A2A] rounded-xl shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-[#521919] flex items-center gap-2">
              <span>تنبيه: تم اكتشاف {conflicts.length} تعارض في جدول المواعيد!</span>
            </h3>
            <span className="text-xs bg-[#C05746] text-white font-bold px-2 py-0.5 rounded-full">
              يتطلب التعديل
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A2B2B] mt-1">
            يوجد تداخل في توقيت بعض الحلقات الأسبوعية بين الطلاب، يرجى تعديل الموعد لتفادي ازدواجية الوقت.
          </p>

          <div className="mt-3 space-y-2">
            {conflicts.map((conflict, idx) => (
              <div
                key={idx}
                className="bg-white/95 border border-[#E9C3BC] rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C05746] shrink-0"></span>
                  <span className="font-medium text-[#521919]">{conflict.details}</span>
                </div>
                {onResolveClick && (
                  <button
                    onClick={() => onResolveClick(conflict)}
                    className="text-xs bg-[#F3D5D0] hover:bg-[#E9C3BC] text-[#6B2020] font-bold px-2.5 py-1 rounded-lg transition shrink-0"
                  >
                    تعديل الموعد
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
