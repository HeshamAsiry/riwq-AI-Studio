export type SubjectType =
  | 'quran_memorization'
  | 'quran_recitation_tajweed'
  | 'arabic_language'
  | 'islamic_studies'
  | 'mixed'
  | 'reading'
  | 'tajweed'
  | 'hadith'
  | 'fiqh'
  | 'aqeedah';

export interface TimeZoneOption {
  id: string;
  name: string;
  country: string;
  flag: string;
  offset: string;
  city: string;
}

export interface StudentSkillRatings {
  reading: number; // 1-5
  listening: number; // 1-5
  speaking: number; // 1-5
  writing: number; // 1-5
  vocabulary: number; // 1-5
}

export interface StudentCurriculumProgress {
  id: string;
  curriculumId: string;
  stageName: string; // e.g. "تأسيس القراءة", "العربية للمبتدئين", "القراءة المتقدمة"
  curriculumName: string; // e.g. "نور البيان", "العربية بين يدي أولادنا"
  currentUnitOrPage: string; // e.g. "الدرس 32", "المستوى الأول — الوحدة 4"
  progressPercent: number; // 0 - 100
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  country: string;
  countryFlag: string;
  timezone: string;
  age?: number;
  birthDate?: string;
  parentName?: string;
  parentContact?: string;
  nativeLanguage?: string;
  subject: SubjectType;
  subjects?: string[]; // Multiple selected subjects: e.g. ['قرآن', 'قراءة', 'عربية', 'تجويد']
  subjectDetail: string; // e.g. "تجويد رواية حفص + حفظ سورة النور"
  level: string; // e.g. "مبتدئ", "متوسط", "متقدم", "خاتم", "طالب إجازة"
  monthlyTargetHours: number; // e.g. 8 hours
  hourlyRate?: number; // per hour rate
  preferredPlatform: 'zoom' | 'google_meet' | 'whatsapp' | 'telegram' | 'other';
  meetingLink?: string;
  notes?: string;
  status: 'active' | 'paused' | 'archived';
  joinedDate: string; // YYYY-MM-DD
  color: string; // For calendar visualization
  skills?: StudentSkillRatings;
  curricula?: StudentCurriculumProgress[];
  lastSessionNotes?: string;
  nextSessionTarget?: string;
}

export interface ProspectiveStudent {
  id: string;
  name: string;
  phone?: string;
  country: string;
  countryFlag: string;
  timezone: string;
  age?: number;
  desiredSubjects: string[];
  suitableTimes: string;
  targetHoursMonthly: number;
  hourlyRate?: number;
  notes?: string;
  contactStatus: 'new' | 'contacted' | 'trial_scheduled' | 'converted' | 'cancelled';
  createdAt: string;
}

export interface RecurringSlot {
  id: string;
  studentId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  teacherStartTime: string; // "HH:MM" e.g. "16:30"
  durationMinutes: number; // 30, 45, 60, 90
  subject: string;
  active: boolean;
  notes?: string;
}

export type SessionStatus =
  | 'completed'
  | 'scheduled'
  | 'in_progress'
  | 'student_cancelled'
  | 'teacher_rescheduled'
  | 'absent'
  | 'excused'
  | 'makeup_pending';

export type SessionType =
  | 'regular'
  | 'makeup'
  | 'extra'
  | 'cancelled'
  | 'absent';

export interface SessionSubjectCovered {
  subject: string; // e.g. "قرآن", "قراءة", "عربية", "حديث", "تجويد"
  details: string; // e.g. "مراجعة الملك 1–10 وحفظ 11–15"
}

export interface SessionRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  teacherStartTime: string; // "HH:MM"
  durationMinutes: number;
  status: SessionStatus;
  sessionType?: SessionType;
  subject: string;
  subjectsCovered?: SessionSubjectCovered[];
  whatWasTaught?: string;
  whatWasReviewed?: string;
  homework?: string;
  nextSessionTarget?: string;
  teacherPrivateNotes?: string; // Private notes that do not appear to parents
  progressNotes?: string; // Generic / shared summary
  rating?: number; // 1-5 evaluation
  isPaid?: boolean;
  makeupForSessionId?: string;
}

export interface CurriculumTrack {
  id: string;
  stageName?: string; // e.g. "تأسيس القراءة", "العربية للمبتدئين", "القراءة المتقدمة"
  title: string; // e.g. "نور البيان", "العربية بين يدي أولادنا", "القراءة الراشدة"
  authorOrSource?: string;
  description?: string;
  category: 'reading' | 'arabic' | 'tajweed' | 'islamic' | 'quran' | 'custom';
  totalUnitsOrPages?: number;
  units?: string[];
  color?: string;
  isCustom?: boolean;
  stages?: {
    id: string;
    name: string;
    totalUnitsOrLessons: number;
    description?: string;
  }[];
}

export interface StudentQuranHifz {
  id: string;
  studentId: string;
  surahNumber: number;
  surahName: string;
  fromAyah: number;
  toAyah: number;
  hifzDate: string;
  amount: string; // e.g. "صفحة كاملة", "10 آيات", "سورة كاملة"
  status: 'memorized' | 'in_progress' | 'mastered';
  notes?: string;
}

export interface StudentQuranRevision {
  id: string;
  studentId: string;
  surahName: string;
  fromAyah?: number;
  toAyah?: number;
  revisionDate: string;
  masteryLevel: 1 | 2 | 3 | 4 | 5; // 1=ضعيف, 5=ممتاز متقن
  mistakesCount?: number;
  notes?: string;
}

export interface CompletedJuzRecord {
  id: string;
  studentId: string;
  juzNumber: number;
  juzName: string; // e.g. "جزء عم (الجزء 30)", "جزء تبارك (الجزء 29)"
  completionDate: string;
  examCreated?: boolean;
  examId?: string;
  examScore?: number;
  rating?: string;
  teacherNotes?: string;
}

export type ExamType =
  | 'quran'
  | 'reading'
  | 'arabic'
  | 'tajweed'
  | 'islamic'
  | 'custom'
  | 'juz_completion'
  | 'surah_memorization'
  | 'tajweed_theory'
  | 'monthly_quiz';

export interface ExamRecord {
  id: string;
  studentId: string;
  studentName?: string;
  title: string; // e.g. "اختبار جزء عم", "اختبار الوحدة الثالثة"
  type?: ExamType;
  examType?: ExamType;
  scheduledDate?: string;
  date?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  score?: number; // e.g. 95
  grade?: string | number;
  maxScore?: number; // e.g. 100
  mistakes?: string; // سجل الأخطاء والتنبيهات
  notes?: string;
  resultSummary?: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'يحتاج إعادة' | string;
  scoreMemorization?: number;
  scoreTajweed?: number;
  scoreStopsAndStarts?: number;
  scoreFluency?: number;
  totalScore?: number;
  subjectOrSurah?: string;
  teacherFeedback?: string;
  certificateIssued?: boolean;
}

export type PersonalActivityType =
  | 'hifz'
  | 'revision'
  | 'lesson'
  | 'study'
  | 'listening'
  | 'preparation'
  | 'personal_task'
  | 'quran_hifz'
  | 'quran_revision'
  | 'islamic_study'
  | 'public_lesson';

export type RecurrenceFrequency = 'once' | 'daily' | 'weekly';

export interface PersonalScheduleItem {
  id: string;
  title: string;
  type?: PersonalActivityType;
  category?: any;
  frequency?: RecurrenceFrequency; // 'once' | 'daily' | 'weekly'
  recurrenceType?: RecurrenceFrequency; // alias
  dayOfWeek?: number; // 0-6 for backward compatibility / single day
  daysOfWeek?: number[]; // [0, 1, 2...] for multiple days in weekly mode
  specificDate?: string; // YYYY-MM-DD for one-time appointment
  startTime: string; // "HH:MM"
  endTime?: string;
  durationMinutes: number;
  isRecurring?: boolean;
  isActive?: boolean;
  reminderMinutesBefore?: number;
  notes?: string;
  completedToday?: boolean;
}

export interface HolidayRecord {
  id: string;
  date: string;
  title: string;
  notes?: string;
  affectedSessionIds: string[];
  affectedSlots: {
    slotId: string;
    studentId: string;
    studentName: string;
    originalTime: string;
  }[];
}

export interface PendingMakeupSession {
  id: string;
  holidayId?: string;
  studentId: string;
  studentName: string;
  originalDate: string;
  originalTime: string;
  durationMinutes: number;
  status: 'pending' | 'scheduled' | 'completed' | 'waived';
  makeupDate?: string;
  makeupTime?: string;
  scheduledSessionId?: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName?: string;
  monthYear?: string; // YYYY-MM
  billingPeriod?: string;
  hourlyRate?: number;
  agreedHours?: number;
  actualHours?: number;
  totalHoursBilled?: number;
  totalDue?: number;
  amount?: number;
  currency?: string;
  amountPaid?: number;
  dueDate?: string;
  paymentDate?: string;
  paymentMethod?: string;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue' | 'pending';
  notes?: string;
}

export interface AppNotification {
  id: string;
  type:
    | 'session_alert'
    | 'exam_alert'
    | 'hours_alert'
    | 'makeup_alert'
    | 'conflict_alert'
    | 'info'
    | 'session_reminder'
    | 'payment_due'
    | 'revision_suggestion'
    | 'student_milestone';
  title: string;
  description: string;
  timeInfo?: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  date: string;
  targetTab?: string;
  targetStudentId?: string;
}

export interface TeacherSettings {
  name: string;
  teacherName?: string;
  title: string; // e.g. "معلم القرآن الكريم واللغة العربية"
  teacherCountry: string;
  city?: string;
  teacherTimeZone: string;
  timezone?: string;
  defaultSessionDuration: number;
  currency: string;
  defaultHourlyRate: number;
  workingDays: number[];
  workingHoursStart: string; // "07:00"
  workingHoursEnd: string; // "23:00"
  meetingLink?: string;
  defaultReminderMinutes?: number; // e.g. 30
  customSubjects?: string[];
  whatsappReminderTemplate?: string;
  whatsappPaymentTemplate?: string;
  whatsappMonthlyReportTemplate?: string;
}

export type StudyCategory =
  | 'tafsir'
  | 'hadith'
  | 'aqeedah'
  | 'fiqh'
  | 'nahw_sarf'
  | 'tajweed_qiraat'
  | 'usul'
  | 'general';

export interface IslamicBook {
  id: string;
  title: string;
  author: string;
  category: StudyCategory;
  totalPagesOrLessons: number;
  completedPagesOrLessons: number;
  status: 'reading' | 'completed' | 'plan_to_read';
  startDate?: string;
  completedDate?: string;
  notes?: string;
  keyBenefits?: string[];
}

export interface QuranPersonalGoal {
  id: string;
  type: 'hifz_new' | 'revision_near' | 'revision_far' | 'tadabbur';
  title: string;
  currentSurah: string;
  fromAyah?: number;
  toAyah?: number;
  targetDate?: string;
  dailyAmount: string; // e.g. "وجهان يومياً", "جزء واحد يومياً"
  completedDaysThisMonth: number;
  isCompletedToday: boolean;
}

export interface DailyWerdLog {
  date: string; // YYYY-MM-DD
  quranNewHifzDone: boolean;
  quranRevisionDone: boolean;
  quranRevisionAmount?: string; // e.g. "سورة الكهف ومريم" or "الجزء الخامس"
  islamicStudyDone: boolean;
  bookStudied?: string;
  pagesRead?: number;
  adhkarDone: boolean;
  nawafilDone: boolean;
  reflections?: string;
}

export interface TimeConflict {
  hasConflict: boolean;
  type: 'recurring_overlap' | 'session_overlap' | 'personal_overlap';
  conflictingSlot1: {
    id: string;
    studentName: string;
    dayOrDate: string;
    time: string;
    duration: number;
  };
  conflictingSlot2: {
    id: string;
    studentName: string;
    dayOrDate: string;
    time: string;
    duration: number;
  };
  details: string;
}

export type MainTabType =
  | 'dashboard'
  | 'calendar'
  | 'students'
  | 'curricula'
  | 'quran'
  | 'exams'
  | 'personal_schedule'
  | 'hours'
  | 'payments'
  | 'reports'
  | 'notifications'
  | 'settings';


