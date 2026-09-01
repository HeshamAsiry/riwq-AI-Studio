import React, { useState } from 'react';
import { AppNotification, Student } from '../../types';
import {
  Bell,
  CheckCircle2,
  Clock,
  Wallet,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Award,
  Trash2,
  Check,
} from 'lucide-react';

interface NotificationsViewProps {
  notifications: AppNotification[];
  students: Student[];
  onSaveNotifications: (items: AppNotification[]) => void;
  onNavigate: (tab: any) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications = [],
  students = [],
  onSaveNotifications,
  onNavigate,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => (n.id === id ? { ...n, isRead: true } : n));
    onSaveNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    onSaveNotifications(updated);
  };

  const handleClearAll = () => {
    onSaveNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.isRead;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'session_reminder':
        return <Clock className="w-4 h-4 text-emerald-700" />;
      case 'payment_due':
        return <Wallet className="w-4 h-4 text-amber-700" />;
      case 'revision_suggestion':
        return <BookOpen className="w-4 h-4 text-blue-700" />;
      case 'student_milestone':
        return <Award className="w-4 h-4 text-[#D4A373]" />;
      case 'conflict_alert':
        return <AlertTriangle className="w-4 h-4 text-rose-700" />;
      default:
        return <Bell className="w-4 h-4 text-[#4A5D4E]" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header with Natural Tones */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#4A5D4E] text-xs font-bold mb-1">
            <Bell className="w-4 h-4" />
            <span>مركز التنبيهات والإشعارات الذكية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3436]">
            🔔 التنبيهات واقتراحات المراجعة
          </h1>
          <p className="text-sm text-[#5D6567] mt-1 max-w-2xl">
            تنبيهات فورية بمواعيد الحصص، مستحقات الفواتير، اقتراب الطلاب من إتمام الأجزاء، واقتراحات المراجعة الدورية التراكمية.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>تحديد الكل كمقروء ({unreadCount})</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-[#F8F5EE] hover:bg-rose-50 hover:text-rose-700 text-[#5D6567] border border-[#E8E1D5] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>مسح السجل</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: `الكل (${notifications.length})` },
          { id: 'unread', label: `غير مقروء (${unreadCount})` },
          { id: 'session_reminder', label: '⏰ مواعيد الحصص' },
          { id: 'payment_due', label: '💰 المستحقات والرسوم' },
          { id: 'revision_suggestion', label: '📖 اقتراحات المراجعة' },
          { id: 'student_milestone', label: '🏆 إنجازات الطلاب' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === tab.id
                ? 'bg-[#4A5D4E] text-white shadow-xs'
                : 'bg-[#FFFFFF] text-[#5D6567] border border-[#E8E1D5] hover:bg-[#F8F5EE]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Notifications List */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-[#EFE9DD]">
            {filteredNotifications.map(item => (
              <div
                key={item.id}
                className={`py-4 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors rounded-2xl ${
                  !item.isRead ? 'bg-[#FDFBF7] font-semibold' : 'hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F5EE] border border-[#E8E1D5] flex items-center justify-center shrink-0 mt-0.5">
                    {getTypeIcon(item.type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-[#2D3436]">{item.title}</h3>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-[#5D6567] leading-relaxed mb-1">{item.description}</p>
                    <span className="text-[11px] text-[#8A9396] font-mono">{item.timeInfo || item.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {item.targetTab && (
                    <button
                      onClick={() => onNavigate(item.targetTab as any)}
                      className="bg-[#F8F5EE] hover:bg-[#EFE9DD] text-[#4A5D4E] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-[#E8E1D5]"
                    >
                      عرض في القسم
                    </button>
                  )}
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="p-1.5 text-[#5D6567] hover:text-[#4A5D4E] hover:bg-[#F8F5EE] rounded-lg transition-all"
                      title="تحديد كمقروء"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#FDFBF7] rounded-2xl border border-dashed border-[#E8E1D5]">
            <Bell className="w-10 h-10 text-[#8A9396] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-[#2D3436]">لا توجد تنبيهات حالية في هذه الفئة</p>
            <p className="text-xs text-[#5D6567] mt-1">ستظهر التنبيهات التلقائية عند اقتراب مواعيد الحصص واستحقاق الفواتير.</p>
          </div>
        )}
      </div>
    </div>
  );
};
