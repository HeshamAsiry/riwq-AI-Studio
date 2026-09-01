import React from 'react';
import {
  Home,
  Calendar,
  Users,
  BookOpen,
  Bookmark,
  Award,
  BookMarked,
  Clock,
  Wallet,
  BarChart3,
  Bell,
  Settings,
} from 'lucide-react';
import { MainTabType } from '../types';

interface NavigationProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  conflictCount?: number;
  unreadNotifsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  conflictCount = 0,
  unreadNotifsCount = 0,
}) => {
  const tabs: {
    id: MainTabType;
    label: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: Home,
    },
    {
      id: 'calendar',
      label: 'التقويم والمواعيد',
      icon: Calendar,
      badge: conflictCount > 0 ? `${conflictCount} تعارض!` : undefined,
      badgeColor: 'bg-[#C05746] text-white',
    },
    {
      id: 'students',
      label: 'الطلاب',
      icon: Users,
    },
    {
      id: 'curricula',
      label: 'المسارات التعليمية',
      icon: BookOpen,
    },
    {
      id: 'quran',
      label: 'القرآن',
      icon: Bookmark,
    },
    {
      id: 'exams',
      label: 'الاختبارات',
      icon: Award,
    },
    {
      id: 'personal_schedule',
      label: 'جدولي الشخصي',
      icon: BookMarked,
    },
    {
      id: 'hours',
      label: 'الساعات',
      icon: Clock,
    },
    {
      id: 'payments',
      label: 'المدفوعات',
      icon: Wallet,
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: BarChart3,
    },
    {
      id: 'notifications',
      label: 'التنبيهات',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? `${unreadNotifsCount}` : undefined,
      badgeColor: 'bg-[#C05746] text-white',
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: Settings,
    },
  ];

  return (
    <div className="bg-[#F8F5EE] border-b border-[#E8E1D5] sticky top-[72px] z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 space-x-reverse overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-[#4A5D4E] text-[#FDFBF7] shadow-xs'
                    : 'text-[#5D6567] hover:text-[#2D3436] hover:bg-[#EFE9DD]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E2EBD8]' : 'text-[#8A9396]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      tab.badgeColor || 'bg-rose-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
