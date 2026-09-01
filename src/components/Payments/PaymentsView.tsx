import React, { useState } from 'react';
import { PaymentRecord, Student, TeacherSettings } from '../../types';
import {
  Wallet,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Share2,
  FileText,
  DollarSign,
  TrendingUp,
  User,
  Filter,
} from 'lucide-react';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  students: Student[];
  teacherSettings: TeacherSettings;
  onSavePayments: (payments: PaymentRecord[]) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments = [],
  students = [],
  teacherSettings,
  onSavePayments,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');

  // Form states
  const [formStudentId, setFormStudentId] = useState<string>(students[0]?.id || '');
  const [formAmount, setFormAmount] = useState<number>(100);
  const [formCurrency, setFormCurrency] = useState<string>(teacherSettings.currency || 'USD');
  const [formPeriod, setFormPeriod] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [formHours, setFormHours] = useState<number>(8);
  const [formDueDate, setFormDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<PaymentRecord['status']>('paid');
  const [formMethod, setFormMethod] = useState<PaymentRecord['paymentMethod']>('bank_transfer');
  const [formNotes, setFormNotes] = useState<string>('');

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === formStudentId);
    if (!st) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      studentId: formStudentId,
      studentName: st.name,
      amount: formAmount,
      currency: formCurrency,
      billingPeriod: formPeriod,
      totalHoursBilled: formHours,
      dueDate: formDueDate,
      status: formStatus,
      paymentDate: formStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
      paymentMethod: formMethod,
      notes: formNotes,
    };

    onSavePayments([newPayment, ...payments]);
    setShowAddModal(false);
    setFormNotes('');
  };

  const handleToggleStatus = (paymentId: string) => {
    const updated = payments.map(p => {
      if (p.id === paymentId) {
        const nextStatus: PaymentRecord['status'] = p.status === 'paid' ? 'pending' : 'paid';
        return {
          ...p,
          status: nextStatus,
          paymentDate: nextStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return p;
    });
    onSavePayments(updated);
  };

  // Filtered payments
  const filteredPayments = payments.filter(p => {
    const matchStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchStudent = selectedStudentFilter === 'all' ? true : p.studentId === selectedStudentFilter;
    return matchStatus && matchStudent;
  });

  // Calculate totals
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header with Natural Tones */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#4A5D4E] text-xs font-bold mb-1">
            <Wallet className="w-4 h-4" />
            <span>الإدارة المالية والمحاسبية للمقرأة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3436]">
            💰 إدارة المدفوعات والرسوم الشهرية
          </h1>
          <p className="text-sm text-[#5D6567] mt-1 max-w-2xl">
            متابعة مستحقات ساعات التدريس، الاشتراكات الشهرية، الفواتير الصادرة، وحالة السداد لكل طالب بمختلف العملات الدولية.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-xs self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>إصدار فاتورة / تسجيل دفعة</span>
        </button>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#5D6567]">إجمالي المقبوضات المستلمة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-800">
            {totalPaid} {teacherSettings.currency}
          </div>
          <p className="text-xs text-[#5D6567] mt-1">من الفواتير المسددة بالكامل</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#5D6567]">المستحقات المعلقة / قيد الانتظار</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-800">
            {totalPending} {teacherSettings.currency}
          </div>
          <p className="text-xs text-[#5D6567] mt-1">مبالغ مستحقة لم تسدد بعد</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#5D6567]">العملة الافتراضية للمعلم</span>
            <div className="w-8 h-8 rounded-xl bg-[#EFE9DD] text-[#4A5D4E] flex items-center justify-center font-bold text-xs">
              {teacherSettings.currency}
            </div>
          </div>
          <div className="text-2xl font-black text-[#2D3436]">{teacherSettings.currency}</div>
          <p className="text-xs text-[#5D6567] mt-1">قابلة للتغيير من قسم الإعدادات</p>
        </div>
      </div>

      {/* 3. Filters & Data Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'paid', label: '✅ تم السداد' },
              { id: 'pending', label: '⏳ قيد الانتظار' },
              { id: 'overdue', label: '⚠️ متأخر' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-[#4A5D4E] text-white shadow-xs'
                    : 'bg-[#F8F5EE] text-[#5D6567] hover:bg-[#EFE9DD]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Student Filter */}
          <div className="flex items-center gap-2 bg-[#F8F5EE] border border-[#E8E1D5] px-3.5 py-2 rounded-2xl">
            <User className="w-4 h-4 text-[#5D6567]" />
            <select
              value={selectedStudentFilter}
              onChange={e => setSelectedStudentFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#2D3436] focus:outline-none"
            >
              <option value="all">جميع الطلاب</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payments Table */}
        {filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F8F5EE] text-[#5D6567] font-bold border-b border-[#E8E1D5]">
                <tr>
                  <th className="p-3.5 rounded-r-2xl">الطالب</th>
                  <th className="p-3.5">الشهر / الفترة</th>
                  <th className="p-3.5">الساعات المحسوبة</th>
                  <th className="p-3.5">المبلغ</th>
                  <th className="p-3.5">تاريخ الاستحقاق</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5">طريقة الدفع</th>
                  <th className="p-3.5 rounded-l-2xl text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DD]">
                {filteredPayments.map(p => {
                  const st = students.find(s => s.id === p.studentId);

                  return (
                    <tr key={p.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="p-3.5 font-bold text-[#2D3436]">
                        <div className="flex items-center gap-2">
                          <span>{p.studentName}</span>
                          {st?.countryFlag && <span>{st.countryFlag}</span>}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[#5D6567]">{p.billingPeriod}</td>
                      <td className="p-3.5 font-bold text-[#4A5D4E]">{p.totalHoursBilled} ساعات</td>
                      <td className="p-3.5 font-black text-sm text-[#2D3436]">
                        {p.amount} {p.currency}
                      </td>
                      <td className="p-3.5 text-[#5D6567]">{p.dueDate}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-bold text-[11px] ${
                            p.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'overdue'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status === 'paid'
                            ? '✅ مدفوع'
                            : p.status === 'overdue'
                            ? '⚠️ متأخر'
                            : '⏳ معلق'}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#5D6567]">
                        {p.paymentMethod === 'paypal'
                          ? 'PayPal'
                          : p.paymentMethod === 'bank_transfer'
                          ? 'تحويل بنكي'
                          : p.paymentMethod === 'western_union'
                          ? 'Western Union'
                          : 'أخرى'}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleStatus(p.id)}
                          className="px-3 py-1.5 rounded-xl border border-[#E8E1D5] hover:bg-[#EFE9DD] font-bold text-[#4A5D4E] text-[11px] transition-all"
                        >
                          {p.status === 'paid' ? 'تحديد كمعلق' : 'تحديد كمدفوع'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 bg-[#FDFBF7] rounded-2xl border border-dashed border-[#E8E1D5]">
            <Wallet className="w-10 h-10 text-[#8A9396] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-[#2D3436]">لا توجد فواتير تطابق التصفية المحددة</p>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#E8E1D5] shadow-xl animate-fadeIn">
            <h3 className="text-lg font-bold text-[#2D3436] mb-4">إصدار فاتورة أو تسجيل دفعة لطالب</h3>

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">اختر الطالب *</label>
                <select
                  value={formStudentId}
                  onChange={e => setFormStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.countryFlag} {s.name} ({s.hourlyRate || 20} {teacherSettings.currency}/ساعة)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">المبلغ الإجمالي *</label>
                  <input
                    type="number"
                    required
                    value={formAmount ?? 0}
                    onChange={e => setFormAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">العملة</label>
                  <select
                    value={formCurrency || 'USD'}
                    onChange={e => setFormCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                  >
                    <option value="USD">دولار أمريكي (USD $)</option>
                    <option value="EUR">يورو (EUR €)</option>
                    <option value="GBP">جنيه إسترليني (GBP £)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                    <option value="EGP">جنيه مصري (EGP)</option>
                    <option value="CAD">دولار كندي (CAD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">الشهر المحاسبي (YYYY-MM)</label>
                  <input
                    type="month"
                    value={formPeriod || ''}
                    onChange={e => setFormPeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">عدد الساعات المفوترة</label>
                  <input
                    type="number"
                    value={formHours ?? 0}
                    onChange={e => setFormHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">حالة السداد</label>
                  <select
                    value={formStatus || 'paid'}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                  >
                    <option value="paid">تم السداد بالكامل</option>
                    <option value="pending">قيد الانتظار / معلق</option>
                    <option value="overdue">متأخر عن الموعد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">طريقة التحويل</label>
                  <select
                    value={formMethod || 'bank_transfer'}
                    onChange={e => setFormMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#4A5D4E]"
                  >
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="paypal">PayPal</option>
                    <option value="western_union">Western Union</option>
                    <option value="cash">نقداً</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={formNotes || ''}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="رقم الحوالة أو تفاصيل إضافية..."
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
                  حفظ الفاتورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
