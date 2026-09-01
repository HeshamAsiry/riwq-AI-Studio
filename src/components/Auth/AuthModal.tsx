import React, { useState } from 'react';
import {
  BookOpen,
  Mail,
  Lock,
  User as UserIcon,
  LogIn,
  UserPlus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    error,
    clearError,
    loading,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('يرجى كتابة البريد الإلكتروني');
      return;
    }

    try {
      if (mode === 'signin') {
        if (!password) {
          setLocalError('يرجى إدخال كلمة المرور');
          return;
        }
        await signInWithEmail(email.trim(), password);
        onClose();
      } else if (mode === 'signup') {
        if (!password || password.length < 6) {
          setLocalError('كلمة المرور يجب ألا تقل عن 6 أحرف');
          return;
        }
        await signUpWithEmail(email.trim(), password, displayName.trim() || 'فضيلة المعلم');
        onClose();
      } else if (mode === 'reset') {
        await resetPassword(email.trim());
        setResetSent(true);
      }
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLocalError(null);
      clearError();
      await signInWithGoogle();
      onClose();
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  const currentError = localError || error;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-fadeIn text-right font-sans relative my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-[#5D6567] hover:text-[#2D3436] p-2 rounded-xl hover:bg-[#F8F5EE] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex p-3 bg-[#4A5D4E]/10 text-[#4A5D4E] rounded-2xl mb-3 shadow-2xs">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#2D3436] tracking-tight">
            {mode === 'signin' && 'تسجيل الدخول لمقرأة المعلم'}
            {mode === 'signup' && 'إنشاء حساب معلم جديد'}
            {mode === 'reset' && 'استعادة كلمة المرور'}
          </h2>
          <p className="text-xs text-[#5D6567] mt-1">
            {mode === 'signin' && 'سجل دخولك لحفظ بياناتك ومزامنة الجداول والطلاب سحابياً'}
            {mode === 'signup' && 'ابدأ تنظيم طلابك ومواعيدك ومتابعة وردك القرآني بكل سهولة'}
            {mode === 'reset' && 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور'}
          </p>
        </div>

        {/* Error Alert */}
        {currentError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{currentError}</span>
          </div>
        )}

        {/* Success for password reset */}
        {resetSent && mode === 'reset' ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
            <p className="text-xs font-bold">
              تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح!
            </p>
            <p className="text-[11px] text-emerald-700">
              يرجى فحص صندوق الوارد أو البريد غير الهام (Spam).
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setMode('signin');
              }}
              className="mt-2 text-xs font-black text-[#4A5D4E] hover:underline"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          <>
            {/* Google Sign In Button */}
            {mode !== 'reset' && (
              <div className="space-y-4 mb-5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl border border-[#E8E1D5] bg-[#FDFBF7] hover:bg-[#F8F5EE] hover:border-[#4A5D4E]/40 text-[#2D3436] font-bold text-xs flex items-center justify-center gap-3 transition shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {mode === 'signin' ? 'تسجيل الدخول بحساب Google' : 'التسجيل السريع بحساب Google'}
                  </span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#E8E1D5]" />
                  <span className="text-[11px] font-bold text-[#5D6567]">أو بالبريد الإلكتروني</span>
                  <div className="flex-1 h-px bg-[#E8E1D5]" />
                </div>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">
                    اسم المعلم / اللقب *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="مثال: الشيخ أحمد، أ. محمود"
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm text-[#2D3436] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition"
                    />
                    <UserIcon className="w-4 h-4 text-[#5D6567] absolute right-3.5 top-3" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#2D3436] mb-1">
                  البريد الإلكتروني *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm text-[#2D3436] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition text-right"
                  />
                  <Mail className="w-4 h-4 text-[#5D6567] absolute right-3.5 top-3" />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#2D3436]">
                      كلمة المرور *
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          clearError();
                          setMode('reset');
                        }}
                        className="text-[11px] font-bold text-[#4A5D4E] hover:underline"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[#E8E1D5] bg-[#FDFBF7] text-sm text-[#2D3436] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition text-right"
                    />
                    <Lock className="w-4 h-4 text-[#5D6567] absolute right-3.5 top-3" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#4A5D4E] hover:bg-[#3D4C40] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <span>جاري المعالجة...</span>
                ) : mode === 'signin' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>تسجيل الدخول</span>
                  </>
                ) : mode === 'signup' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>إنشاء الحساب</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>إرسال رابط الاستعادة</span>
                  </>
                )}
              </button>
            </form>

            {/* Toggle Modes Footer */}
            <div className="mt-5 pt-4 border-t border-[#E8E1D5] text-center text-xs text-[#5D6567]">
              {mode === 'signin' ? (
                <p>
                  ليس لديك حساب بعد؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setMode('signup');
                    }}
                    className="font-black text-[#4A5D4E] hover:underline"
                  >
                    أنشئ حساباً جديداً
                  </button>
                </p>
              ) : mode === 'signup' ? (
                <p>
                  لديك حساب بالفعل؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setMode('signin');
                    }}
                    className="font-black text-[#4A5D4E] hover:underline"
                  >
                    تسجيل الدخول
                  </button>
                </p>
              ) : (
                <p>
                  تذكرت كلمة المرور؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setMode('signin');
                    }}
                    className="font-black text-[#4A5D4E] hover:underline"
                  >
                    العودة لتسجيل الدخول
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
