import {
  db,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from '../lib/firebase';
import {
  TeacherSettings,
  Student,
  RecurringSlot,
  SessionRecord,
  IslamicBook,
  QuranPersonalGoal,
  DailyWerdLog,
  CurriculumTrack,
  ProspectiveStudent,
  ExamRecord,
  StudentQuranHifz,
  StudentQuranRevision,
  CompletedJuzRecord,
  PersonalScheduleItem,
  PaymentRecord,
  AppNotification,
} from '../types';

export interface UserFullState {
  settings?: TeacherSettings;
  students?: Student[];
  recurringSlots?: RecurringSlot[];
  sessions?: SessionRecord[];
  islamicBooks?: IslamicBook[];
  quranGoals?: QuranPersonalGoal[];
  werdLogs?: DailyWerdLog[];
  curricula?: CurriculumTrack[];
  prospectiveStudents?: ProspectiveStudent[];
  exams?: ExamRecord[];
  studentQuranHifz?: StudentQuranHifz[];
  studentQuranRevision?: StudentQuranRevision[];
  completedJuz?: CompletedJuzRecord[];
  personalSchedule?: PersonalScheduleItem[];
  payments?: PaymentRecord[];
  notifications?: AppNotification[];
  updatedAt?: string;
}

/**
 * Upload entire local state to Firestore cloud backup
 */
export async function syncStateToCloud(userId: string, data: UserFullState): Promise<void> {
  if (!userId) return;
  try {
    const docRef = doc(db, 'userData', userId);
    await setDoc(
      docRef,
      {
        ...data,
        userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to sync data to Firestore:', error);
    throw error;
  }
}

/**
 * Fetch state from Firestore cloud once
 */
export async function fetchStateFromCloud(userId: string): Promise<UserFullState | null> {
  if (!userId) return null;
  try {
    const docRef = doc(db, 'userData', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserFullState;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch data from Firestore:', error);
    return null;
  }
}

/**
 * Subscribe to cloud updates in real-time
 */
export function subscribeToCloudState(
  userId: string,
  onUpdate: (state: UserFullState) => void
): () => void {
  if (!userId) return () => {};
  const docRef = doc(db, 'userData', userId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as UserFullState);
      }
    },
    (err) => {
      console.error('Firestore realtime listener error:', err);
    }
  );
}
