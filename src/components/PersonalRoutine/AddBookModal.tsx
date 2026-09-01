import React, { useState, useEffect } from 'react';
import { X, BookOpen, Save, User, Tag, CheckCircle2 } from 'lucide-react';
import { IslamicBook, StudyCategory } from '../../types';
import { STUDY_CATEGORY_LABELS } from '../../data/timezones';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBook: (book: Omit<IslamicBook, 'id'>, editId?: string) => void;
  editingBook?: IslamicBook | null;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onSaveBook,
  editingBook,
}) => {
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [category, setCategory] = useState<StudyCategory>('fiqh');
  const [totalPagesOrLessons, setTotalPagesOrLessons] = useState<number>(200);
  const [completedPagesOrLessons, setCompletedPagesOrLessons] = useState<number>(0);
  const [status, setStatus] = useState<IslamicBook['status']>('reading');
  const [notes, setNotes] = useState<string>('');
  const [benefitText, setBenefitText] = useState<string>('');
  const [keyBenefits, setKeyBenefits] = useState<string[]>([]);

  useEffect(() => {
    if (editingBook) {
      setTitle(editingBook.title);
      setAuthor(editingBook.author);
      setCategory(editingBook.category);
      setTotalPagesOrLessons(editingBook.totalPagesOrLessons);
      setCompletedPagesOrLessons(editingBook.completedPagesOrLessons);
      setStatus(editingBook.status);
      setNotes(editingBook.notes || '');
      setKeyBenefits(editingBook.keyBenefits || []);
    } else {
      setTitle('');
      setAuthor('');
      setCategory('fiqh');
      setTotalPagesOrLessons(200);
      setCompletedPagesOrLessons(0);
      setStatus('reading');
      setNotes('');
      setKeyBenefits([]);
    }
  }, [editingBook, isOpen]);

  if (!isOpen) return null;

  const handleAddBenefit = () => {
    if (benefitText.trim()) {
      setKeyBenefits([...keyBenefits, benefitText.trim()]);
      setBenefitText('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setKeyBenefits(keyBenefits.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('يرجى إدخال عنوان الكتاب أو المتن');
      return;
    }

    onSaveBook(
      {
        title: title.trim(),
        author: author.trim() || 'غير محدد',
        category,
        totalPagesOrLessons,
        completedPagesOrLessons,
        status,
        startDate: editingBook?.startDate || new Date().toISOString().slice(0, 10),
        completedDate:
          completedPagesOrLessons >= totalPagesOrLessons
            ? new Date().toISOString().slice(0, 10)
            : undefined,
        notes: notes.trim(),
        keyBenefits,
      },
      editingBook?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#E8E1D5] max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#36453A] text-[#FDFBF7] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#C8D7CC]" />
            <h2 className="text-lg font-bold">
              {editingBook ? 'تعديل بيانات الكتاب / المتن' : 'إضافة كتاب أو متن للعلم الشرعي'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#C8D7CC] hover:text-white p-1 rounded-lg hover:bg-[#2B382D] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[#2D3436] text-sm">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1">اسم الكتاب أو المتن:</label>
            <input
              type="text"
              value={title || ''}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none text-sm font-semibold text-[#2D3436]"
              placeholder="مثال: زاد المستقنع، قطر الندى، عمدة الأحكام، تفسير السعدي..."
              required
            />
          </div>

          {/* Author & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1">المؤلف / الشارح:</label>
              <input
                type="text"
                value={author || ''}
                onChange={e => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                placeholder="مثال: ابن هشام، الحجاوي، ابن عثيمين..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1">المجال / التخصص:</label>
              <select
                value={category || 'fiqh'}
                onChange={e => setCategory(e.target.value as StudyCategory)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              >
                {Object.entries(STUDY_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pages & Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1">إجمالي الصفحات/الدروس:</label>
              <input
                type="number"
                min="1"
                value={totalPagesOrLessons ?? 200}
                onChange={e => setTotalPagesOrLessons(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1">الصفحات المنجزة:</label>
              <input
                type="number"
                min="0"
                max={totalPagesOrLessons}
                value={completedPagesOrLessons ?? 0}
                onChange={e => setCompletedPagesOrLessons(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm font-mono font-bold text-[#4A5D4E] focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5D6567] mb-1">حالة القراءة:</label>
              <select
                value={status || 'reading'}
                onChange={e => setStatus(e.target.value as IslamicBook['status'])}
                className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              >
                <option value="reading">📖 قيد القراءة والمدارسة</option>
                <option value="completed">✅ تم الإتمام والإتقان</option>
                <option value="plan_to_read">⏳ في خطة القراءة</option>
              </select>
            </div>
          </div>

          {/* Notes & Summary */}
          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1">خطة المدارسة وملاحظات:</label>
            <textarea
              rows={2}
              value={notes || ''}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-sm focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
              placeholder="مثال: مدارسة مع الشرح الصوتي، تخصيص 5 صفحات يومياً بعد صلاة الفجر..."
            />
          </div>

          {/* Key Benefits (فوائد وفرائد مستفادة) */}
          <div>
            <label className="block text-xs font-bold text-[#5D6567] mb-1">تدوين فوائد وفرائد علمية من هذا الكتاب:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={benefitText || ''}
                onChange={e => setBenefitText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBenefit();
                  }
                }}
                className="flex-1 px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-xs focus:ring-2 focus:ring-[#4A5D4E] focus:outline-none"
                placeholder="اكتب فائدة واضغط إضافة..."
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="bg-[#36453A] hover:bg-[#2B382D] text-[#FDFBF7] text-xs font-bold px-3 py-2 rounded-xl transition"
              >
                إضافة
              </button>
            </div>

            {keyBenefits.length > 0 && (
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {keyBenefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F0EBE1] text-[#2D3436] border border-[#D8CFBF] rounded-lg px-2.5 py-1.5 text-xs flex items-center justify-between gap-2"
                  >
                    <span>• {benefit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(idx)}
                      className="text-[#5D6567] hover:text-[#C0392B] p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#5D6567] hover:text-[#2D3436] text-sm font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-[#4A5D4E] hover:bg-[#3D4D40] active:scale-95 text-[#FDFBF7] font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>حفظ في المكتبة</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
