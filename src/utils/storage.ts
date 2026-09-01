import {
  Student,
  RecurringSlot,
  SessionRecord,
  TeacherSettings,
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
  HolidayRecord,
  PendingMakeupSession,
  PaymentRecord,
  AppNotification,
} from '../types';
import {
  DEFAULT_TEACHER_SETTINGS,
  DEFAULT_STUDENTS,
  DEFAULT_RECURRING_SLOTS,
  DEFAULT_SESSION_RECORDS,
  DEFAULT_ISLAMIC_BOOKS,
  DEFAULT_QURAN_GOALS,
  DEFAULT_WERD_LOGS,
  DEFAULT_CURRICULA,
  DEFAULT_PROSPECTIVE_STUDENTS,
  DEFAULT_EXAMS,
  DEFAULT_STUDENT_QURAN_HIFZ,
  DEFAULT_STUDENT_QURAN_REVISION,
  DEFAULT_COMPLETED_JUZ,
  DEFAULT_PERSONAL_SCHEDULE,
  DEFAULT_HOLIDAYS,
  DEFAULT_PENDING_MAKEUPS,
  DEFAULT_PAYMENTS,
  DEFAULT_NOTIFICATIONS,
} from '../data/defaultData';

export const STORAGE_KEYS = {
  SETTINGS: 'quran_teacher_settings_v2',
  STUDENTS: 'quran_teacher_students_v2',
  RECURRING_SLOTS: 'quran_teacher_slots_v2',
  SESSIONS: 'quran_teacher_sessions_v2',
  BOOKS: 'quran_teacher_books_v2',
  QURAN_GOALS: 'quran_teacher_quran_goals_v2',
  WERD_LOGS: 'quran_teacher_werd_logs_v2',
  CURRICULA: 'quran_teacher_curricula_v2',
  PROSPECTIVE_STUDENTS: 'quran_teacher_prospective_v2',
  EXAMS: 'quran_teacher_exams_v2',
  STUDENT_HIFZ: 'quran_teacher_student_hifz_v2',
  STUDENT_REVISION: 'quran_teacher_student_rev_v2',
  COMPLETED_JUZ: 'quran_teacher_completed_juz_v2',
  PERSONAL_SCHEDULE: 'quran_teacher_personal_sched_v2',
  HOLIDAYS: 'quran_teacher_holidays_v2',
  PENDING_MAKEUPS: 'quran_teacher_makeups_v2',
  PAYMENTS: 'quran_teacher_payments_v2',
  NOTIFICATIONS: 'quran_teacher_notifs_v2',
} as const;

/**
 * Safely loads and parses data from localStorage with full defense against:
 * - Empty string, whitespace, "null", or "undefined" raw values
 * - Corrupted or invalid JSON strings
 * - Data type mismatches (e.g. non-array when expecting array)
 * - Missing schema fields (by merging with defaults for objects)
 */
export function safeLoad<T>(key: string, defaultValue: T, isArray: boolean = false): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    const raw = localStorage.getItem(key);
    if (!raw || raw.trim() === '' || raw === 'undefined' || raw === 'null') {
      return defaultValue;
    }
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) {
      return defaultValue;
    }
    if (isArray) {
      if (!Array.isArray(parsed)) {
        console.warn(`[Storage] Expected array for key "${key}", falling back to default. Received:`, parsed);
        return defaultValue;
      }
      return parsed as T;
    }
    if (!isArray && typeof defaultValue === 'object' && defaultValue !== null) {
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        console.warn(`[Storage] Expected object for key "${key}", falling back to default. Received:`, parsed);
        return defaultValue;
      }
      return { ...defaultValue, ...parsed };
    }
    return parsed as T;
  } catch (error) {
    console.error(`[Storage] Corrupted data or parsing error for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely saves serialized JSON data to localStorage with error handling for quota and accessibility
 */
export function safeSave<T>(key: string, value: T): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    if (value === undefined) {
      localStorage.removeItem(key);
      return true;
    }
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to save key "${key}":`, error);
    return false;
  }
}

// 1. Teacher Settings
export function loadTeacherSettings(): TeacherSettings {
  return safeLoad(STORAGE_KEYS.SETTINGS, DEFAULT_TEACHER_SETTINGS, false);
}

export function saveTeacherSettings(settings: TeacherSettings): void {
  safeSave(STORAGE_KEYS.SETTINGS, settings);
}

// 2. Students
export function loadStudents(): Student[] {
  return safeLoad(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS, true);
}

export function saveStudents(students: Student[]): void {
  safeSave(STORAGE_KEYS.STUDENTS, students);
}

// 3. Recurring Slots
export function loadRecurringSlots(): RecurringSlot[] {
  return safeLoad(STORAGE_KEYS.RECURRING_SLOTS, DEFAULT_RECURRING_SLOTS, true);
}

export function saveRecurringSlots(slots: RecurringSlot[]): void {
  safeSave(STORAGE_KEYS.RECURRING_SLOTS, slots);
}

// 4. Session Records
export function loadSessions(): SessionRecord[] {
  return safeLoad(STORAGE_KEYS.SESSIONS, DEFAULT_SESSION_RECORDS, true);
}

export function saveSessions(sessions: SessionRecord[]): void {
  safeSave(STORAGE_KEYS.SESSIONS, sessions);
}

// 5. Islamic Books
export function loadIslamicBooks(): IslamicBook[] {
  return safeLoad(STORAGE_KEYS.BOOKS, DEFAULT_ISLAMIC_BOOKS, true);
}

export function saveIslamicBooks(books: IslamicBook[]): void {
  safeSave(STORAGE_KEYS.BOOKS, books);
}

// 6. Quran Goals
export function loadQuranGoals(): QuranPersonalGoal[] {
  return safeLoad(STORAGE_KEYS.QURAN_GOALS, DEFAULT_QURAN_GOALS, true);
}

export function saveQuranGoals(goals: QuranPersonalGoal[]): void {
  safeSave(STORAGE_KEYS.QURAN_GOALS, goals);
}

// 7. Daily Werd Logs
export function loadWerdLogs(): DailyWerdLog[] {
  return safeLoad(STORAGE_KEYS.WERD_LOGS, DEFAULT_WERD_LOGS, true);
}

export function saveWerdLogs(logs: DailyWerdLog[]): void {
  safeSave(STORAGE_KEYS.WERD_LOGS, logs);
}

// 8. Curricula
export function loadCurricula(): CurriculumTrack[] {
  return safeLoad(STORAGE_KEYS.CURRICULA, DEFAULT_CURRICULA, true);
}

export function saveCurricula(curricula: CurriculumTrack[]): void {
  safeSave(STORAGE_KEYS.CURRICULA, curricula);
}

// 9. Prospective Students
export function loadProspectiveStudents(): ProspectiveStudent[] {
  return safeLoad(STORAGE_KEYS.PROSPECTIVE_STUDENTS, DEFAULT_PROSPECTIVE_STUDENTS, true);
}

export function saveProspectiveStudents(students: ProspectiveStudent[]): void {
  safeSave(STORAGE_KEYS.PROSPECTIVE_STUDENTS, students);
}

// 10. Exams
export function loadExams(): ExamRecord[] {
  return safeLoad(STORAGE_KEYS.EXAMS, DEFAULT_EXAMS, true);
}

export function saveExams(exams: ExamRecord[]): void {
  safeSave(STORAGE_KEYS.EXAMS, exams);
}

// 11. Student Quran Hifz
export function loadStudentQuranHifz(): StudentQuranHifz[] {
  return safeLoad(STORAGE_KEYS.STUDENT_HIFZ, DEFAULT_STUDENT_QURAN_HIFZ, true);
}

export function saveStudentQuranHifz(items: StudentQuranHifz[]): void {
  safeSave(STORAGE_KEYS.STUDENT_HIFZ, items);
}

// 12. Student Quran Revision
export function loadStudentQuranRevision(): StudentQuranRevision[] {
  return safeLoad(STORAGE_KEYS.STUDENT_REVISION, DEFAULT_STUDENT_QURAN_REVISION, true);
}

export function saveStudentQuranRevision(items: StudentQuranRevision[]): void {
  safeSave(STORAGE_KEYS.STUDENT_REVISION, items);
}

// 13. Completed Juz
export function loadCompletedJuz(): CompletedJuzRecord[] {
  return safeLoad(STORAGE_KEYS.COMPLETED_JUZ, DEFAULT_COMPLETED_JUZ, true);
}

export function saveCompletedJuz(items: CompletedJuzRecord[]): void {
  safeSave(STORAGE_KEYS.COMPLETED_JUZ, items);
}

// 14. Personal Schedule
export function loadPersonalSchedule(): PersonalScheduleItem[] {
  return safeLoad(STORAGE_KEYS.PERSONAL_SCHEDULE, DEFAULT_PERSONAL_SCHEDULE, true);
}

export function savePersonalSchedule(items: PersonalScheduleItem[]): void {
  safeSave(STORAGE_KEYS.PERSONAL_SCHEDULE, items);
}

// 15. Holidays
export function loadHolidays(): HolidayRecord[] {
  return safeLoad(STORAGE_KEYS.HOLIDAYS, DEFAULT_HOLIDAYS, true);
}

export function saveHolidays(items: HolidayRecord[]): void {
  safeSave(STORAGE_KEYS.HOLIDAYS, items);
}

// 16. Pending Makeups
export function loadPendingMakeups(): PendingMakeupSession[] {
  return safeLoad(STORAGE_KEYS.PENDING_MAKEUPS, DEFAULT_PENDING_MAKEUPS, true);
}

export function savePendingMakeups(items: PendingMakeupSession[]): void {
  safeSave(STORAGE_KEYS.PENDING_MAKEUPS, items);
}

// 17. Payments
export function loadPayments(): PaymentRecord[] {
  return safeLoad(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS, true);
}

export function savePayments(items: PaymentRecord[]): void {
  safeSave(STORAGE_KEYS.PAYMENTS, items);
}

// 18. Notifications
export function loadNotifications(): AppNotification[] {
  return safeLoad(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS, true);
}

export function saveNotifications(items: AppNotification[]): void {
  safeSave(STORAGE_KEYS.NOTIFICATIONS, items);
}

// Export All Data
export function exportAllData(): string {
  const payload = {
    version: 2,
    exportDate: new Date().toISOString(),
    settings: loadTeacherSettings(),
    students: loadStudents(),
    recurringSlots: loadRecurringSlots(),
    sessions: loadSessions(),
    islamicBooks: loadIslamicBooks(),
    quranGoals: loadQuranGoals(),
    werdLogs: loadWerdLogs(),
    curricula: loadCurricula(),
    prospectiveStudents: loadProspectiveStudents(),
    exams: loadExams(),
    studentQuranHifz: loadStudentQuranHifz(),
    studentQuranRevision: loadStudentQuranRevision(),
    completedJuz: loadCompletedJuz(),
    personalSchedule: loadPersonalSchedule(),
    holidays: loadHolidays(),
    pendingMakeups: loadPendingMakeups(),
    payments: loadPayments(),
    notifications: loadNotifications(),
  };
  return JSON.stringify(payload, null, 2);
}

// Import All Data
export function importAllData(jsonString: string): boolean {
  try {
    if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') {
      return false;
    }
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return false;
    }
    if (data.settings && typeof data.settings === 'object') saveTeacherSettings(data.settings);
    if (Array.isArray(data.students)) saveStudents(data.students);
    if (Array.isArray(data.recurringSlots)) saveRecurringSlots(data.recurringSlots);
    if (Array.isArray(data.sessions)) saveSessions(data.sessions);
    if (Array.isArray(data.islamicBooks)) saveIslamicBooks(data.islamicBooks);
    if (Array.isArray(data.quranGoals)) saveQuranGoals(data.quranGoals);
    if (Array.isArray(data.werdLogs)) saveWerdLogs(data.werdLogs);
    if (Array.isArray(data.curricula)) saveCurricula(data.curricula);
    if (Array.isArray(data.prospectiveStudents)) saveProspectiveStudents(data.prospectiveStudents);
    if (Array.isArray(data.exams)) saveExams(data.exams);
    if (Array.isArray(data.studentQuranHifz)) saveStudentQuranHifz(data.studentQuranHifz);
    if (Array.isArray(data.studentQuranRevision)) saveStudentQuranRevision(data.studentQuranRevision);
    if (Array.isArray(data.completedJuz)) saveCompletedJuz(data.completedJuz);
    if (Array.isArray(data.personalSchedule)) savePersonalSchedule(data.personalSchedule);
    if (Array.isArray(data.holidays)) saveHolidays(data.holidays);
    if (Array.isArray(data.pendingMakeups)) savePendingMakeups(data.pendingMakeups);
    if (Array.isArray(data.payments)) savePayments(data.payments);
    if (Array.isArray(data.notifications)) saveNotifications(data.notifications);
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}

// Reset All Data To Defaults
export function resetAllDataToDefaults(): void {
  saveTeacherSettings(DEFAULT_TEACHER_SETTINGS);
  saveStudents(DEFAULT_STUDENTS);
  saveRecurringSlots(DEFAULT_RECURRING_SLOTS);
  saveSessions(DEFAULT_SESSION_RECORDS);
  saveIslamicBooks(DEFAULT_ISLAMIC_BOOKS);
  saveQuranGoals(DEFAULT_QURAN_GOALS);
  saveWerdLogs(DEFAULT_WERD_LOGS);
  saveCurricula(DEFAULT_CURRICULA);
  saveProspectiveStudents(DEFAULT_PROSPECTIVE_STUDENTS);
  saveExams(DEFAULT_EXAMS);
  saveStudentQuranHifz(DEFAULT_STUDENT_QURAN_HIFZ);
  saveStudentQuranRevision(DEFAULT_STUDENT_QURAN_REVISION);
  saveCompletedJuz(DEFAULT_COMPLETED_JUZ);
  savePersonalSchedule(DEFAULT_PERSONAL_SCHEDULE);
  saveHolidays(DEFAULT_HOLIDAYS);
  savePendingMakeups(DEFAULT_PENDING_MAKEUPS);
  savePayments(DEFAULT_PAYMENTS);
  saveNotifications(DEFAULT_NOTIFICATIONS);
}

// Clear all storage keys in case of severe corruption
export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (e) {
    console.error('Clear storage failed:', e);
  }
}
