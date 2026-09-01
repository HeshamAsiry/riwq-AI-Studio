import React, { useState } from 'react';
import {
  User as UserIcon,
  LogIn,
  LogOut,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserMenuProps {
  onOpenAuthModal: () => void;
  isSyncing?: boolean;
  onManualSync?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  onOpenAuthModal,
  isSyncing = false,
  onManualSync,
}) => {
  const { user, userProfile, signOut, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading) {
    return (
      <div className="bg-[#3D4C40] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-white/80 animate-pulse">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4A373]" />
        <span>جاري التحقق...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={onOpenAuthModal}
        className="bg-[#D4A373] hover:bg-[#B5824C] text-[#2D3436] font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition"
        title="تسجيل الدخول أو إنشاء حساب جديد"
      >
        <LogIn className="w-4 h-4 text-[#2D3436]" />
        <span>تسجيل الدخول</span>
      </button>
    );
  }

  const displayName = userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'فضيلة المعلم';

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-[#3D4C40] hover:bg-[#344136] text-white border border-white/10 px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold transition"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded-full object-cover border border-white/20"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-[#4A5D4E] text-[#D4A373] flex items-center justify-center font-black text-xs border border-white/20">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="text-right hidden sm:block">
          <div className="text-white text-xs font-bold leading-tight max-w-[100px] truncate">
            {displayName}
          </div>
          <div className="text-[10px] text-emerald-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>سحابي متصل</span>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-white/70" />
      </button>

      {/* User Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 mt-2 w-64 bg-[#FFFFFF] border border-[#E8E1D5] text-[#2D3436] rounded-2xl shadow-xl py-3 z-50 text-xs text-right animate-fadeIn">
          
          {/* User Profile Header */}
          <div className="px-4 pb-3 border-b border-[#EFE9DD]">
            <div className="font-extrabold text-sm text-[#2D3436] mb-0.5">{displayName}</div>
            <div className="text-[11px] text-[#5D6567] font-mono truncate">{user.email}</div>
            <div className="mt-2 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>مقرأة المعلم • حساب سحابي</span>
            </div>
          </div>

          {/* Sync status & trigger */}
          <div className="px-4 py-2.5 bg-[#FDFBF7] border-b border-[#EFE9DD] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#5D6567] text-[11px]">
              <Cloud className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>المزامنة السحابية:</span>
            </div>
            {onManualSync && (
              <button
                onClick={() => {
                  onManualSync();
                  setShowDropdown(false);
                }}
                disabled={isSyncing}
                className="text-[11px] font-bold text-[#4A5D4E] hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'مزامنة...' : 'مزامنة الآن'}</span>
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="pt-1">
            <button
              onClick={async () => {
                setShowDropdown(false);
                await signOut();
              }}
              className="w-full text-right px-4 py-2 text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-bold transition"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
