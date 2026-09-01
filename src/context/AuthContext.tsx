import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  db,
  doc,
  setDoc,
  getDoc,
} from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'teacher' | 'admin';
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync user profile to Firestore
  const syncUserProfile = async (firebaseUser: User, customName?: string) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      const now = new Date().toISOString();

      if (!userSnap.exists()) {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: customName || firebaseUser.displayName || 'فضيلة المعلم',
          photoURL: firebaseUser.photoURL || null,
          role: 'teacher',
          createdAt: now,
          lastLoginAt: now,
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      } else {
        const existingData = userSnap.data() as UserProfile;
        const updatedProfile: UserProfile = {
          ...existingData,
          displayName: customName || firebaseUser.displayName || existingData.displayName || 'فضيلة المعلم',
          photoURL: firebaseUser.photoURL || existingData.photoURL || null,
          lastLoginAt: now,
        };
        await setDoc(userRef, { lastLoginAt: now }, { merge: true });
        setUserProfile(updatedProfile);
      }
    } catch (err: any) {
      console.error('Error syncing user profile to Firestore:', err);
      // Fallback local profile
      setUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: customName || firebaseUser.displayName || 'فضيلة المعلم',
        photoURL: firebaseUser.photoURL,
        role: 'teacher',
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(getArabicErrorMessage(err?.code || err?.message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.error('Email Sign In Error:', err);
      setError(getArabicErrorMessage(err?.code || err?.message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        if (name) {
          await updateProfile(result.user, { displayName: name });
        }
        await syncUserProfile(result.user, name);
      }
    } catch (err: any) {
      console.error('Sign Up Error:', err);
      setError(getArabicErrorMessage(err?.code || err?.message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      setError(getArabicErrorMessage(err?.code || err?.message));
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await fbSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
      setError(getArabicErrorMessage(err?.code || err?.message));
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        error,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Translate common Firebase Auth errors to clear Arabic
function getArabicErrorMessage(codeOrMsg: string): string {
  if (!codeOrMsg) return 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.';
  if (codeOrMsg.includes('auth/invalid-email')) return 'البريد الإلكتروني غير صحيح، يرجى التأكد من كتابته بشكل سليم.';
  if (codeOrMsg.includes('auth/user-not-found')) return 'لا يوجد حساب مسجل بهذا البريد الإلكتروني.';
  if (codeOrMsg.includes('auth/wrong-password') || codeOrMsg.includes('auth/invalid-credential'))
    return 'كلمة المرور أو البريد الإلكتروني غير صحيح.';
  if (codeOrMsg.includes('auth/email-already-in-use')) return 'هذا البريد الإلكتروني مستخدم بالفعل بحساب آخر.';
  if (codeOrMsg.includes('auth/weak-password')) return 'كلمة المرور ضعيفة، يجب أن تحتوي على 6 أحرف على الأقل.';
  if (codeOrMsg.includes('auth/popup-closed-by-user')) return 'تم إلغاء نافذة تسجيل الدخول بجوجل قبل إتمام العملية.';
  if (codeOrMsg.includes('auth/too-many-requests')) return 'تم حظر المحاولات مؤقتاً لكثرة الطلبات الخاطئة. يرجى الانتظار قليلاً.';
  if (codeOrMsg.includes('auth/network-request-failed')) return 'فشل الاتصال بالإنترنت، يرجى التحقق من اتصالك.';
  return `حدث خطأ: ${codeOrMsg}`;
}
