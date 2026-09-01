import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  RecurringSlot,
  SessionRecord,
  TeacherSettings,
  IslamicBook,
  QuranPersonalGoal,
  DailyWerdLog,
  TimeConflict,
  CurriculumTrack,
  ProspectiveStudent,
  ExamRecord,
  StudentQuranHifz,
  StudentQuranRevision,
  CompletedJuzRecord,
  PersonalScheduleItem,
  PaymentRecord,
  AppNotification,
} from './types';
import {
  loadTeacherSettings,
  saveTeacherSettings,
  loadStudents,
  saveStudents,
  loadRecurringSlots,
  saveRecurringSlots,
  loadSessions,
  saveSessions,
  loadIslamicBooks,
  saveIslamicBooks,
  loadQuranGoals,
  saveQuranGoals,
  loadWerdLogs,
  saveWerdLogs,
  loadCurricula,
  saveCurricula,
  loadProspectiveStudents,
  saveProspectiveStudents,
  loadExams,
  saveExams,
  loadStudentQuranHifz,
  saveStudentQuranHifz,
  loadStudentQuranRevision,
  saveStudentQuranRevision,
  loadCompletedJuz,
  saveCompletedJuz,
  loadPersonalSchedule,
  savePersonalSchedule,
  loadPayments,
  savePayments,
  loadNotifications,
  saveNotifications,
} from './utils/storage';
import { findAllRecurringConflicts } from './utils/conflictDetector';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { MainTabType } from './types';
import { useAuth } from './context/AuthContext';
import { syncStateToCloud, fetchStateFromCloud, subscribeToCloudState, UserFullState } from './services/cloudSync';
import { AuthModal } from './components/Auth/AuthModal';

// Views
import { DashboardView } from './components/Dashboard/DashboardView';
import { WeeklyTimetable } from './components/ScheduleView/WeeklyTimetable';
import { StudentsList } from './components/Students/StudentsList';
import { CurriculaView } from './components/Curricula/CurriculaView';
import { QuranView } from './components/Quran/QuranView';
import { ExamsView } from './components/Exams/ExamsView';
import { PersonalRoutineView } from './components/PersonalRoutine/PersonalRoutineView';
import { MonthlyHoursTracker } from './components/MonthlyHours/MonthlyHoursTracker';
import { PaymentsView } from './components/Payments/PaymentsView';
import { ReportsView } from './components/Reports/ReportsView';
import { NotificationsView } from './components/Notifications/NotificationsView';
import { SettingsView } from './components/Settings/SettingsView';

// Modals
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import { AddSessionModal } from './components/ScheduleView/AddSessionModal';
import { LogSessionModal } from './components/MonthlyHours/LogSessionModal';
import { AddStudentModal } from './components/Students/AddStudentModal';
import { WhatsAppReminderModal } from './components/WhatsAppReminderModal';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('dashboard');

  // Application Data States
  const [settings, setSettings] = useState<TeacherSettings>(loadTeacherSettings);
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [recurringSlots, setRecurringSlots] = useState<RecurringSlot[]>(loadRecurringSlots);
  const [sessions, setSessions] = useState<SessionRecord[]>(loadSessions);
  const [islamicBooks, setIslamicBooks] = useState<IslamicBook[]>(loadIslamicBooks);
  const [quranGoals, setQuranGoals] = useState<QuranPersonalGoal[]>(loadQuranGoals);
  const [werdLogs, setWerdLogs] = useState<DailyWerdLog[]>(loadWerdLogs);
  const [curricula, setCurricula] = useState<CurriculumTrack[]>(loadCurricula);
  const [prospectiveStudents, setProspectiveStudents] = useState<ProspectiveStudent[]>(loadProspectiveStudents);
  const [exams, setExams] = useState<ExamRecord[]>(loadExams);
  const [studentQuranHifz, setStudentQuranHifz] = useState<StudentQuranHifz[]>(loadStudentQuranHifz);
  const [studentQuranRevision, setStudentQuranRevision] = useState<StudentQuranRevision[]>(loadStudentQuranRevision);
  const [completedJuz, setCompletedJuz] = useState<CompletedJuzRecord[]>(loadCompletedJuz);
  const [personalSchedule, setPersonalSchedule] = useState<PersonalScheduleItem[]>(loadPersonalSchedule);
  const [payments, setPayments] = useState<PaymentRecord[]>(loadPayments);
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);

  // Auth & Cloud Sync States
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal Control States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<RecurringSlot | null>(null);

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionRecord | null>(null);
  const [preselectedSlotForLog, setPreselectedSlotForLog] = useState<RecurringSlot | null>(null);
  const [preselectedStudentIdForLog, setPreselectedStudentIdForLog] = useState<string | undefined>(undefined);

  const [whatsAppModal, setWhatsAppModal] = useState<{
    isOpen: boolean;
    student: Student | null;
    slot: RecurringSlot | null;
  }>({
    isOpen: false,
    student: null,
    slot: null,
  });

  // Calculate conflicts across recurring timetable + personal schedule
  const conflicts: TimeConflict[] = useMemo(() => {
    return findAllRecurringConflicts(recurringSlots, students, personalSchedule);
  }, [recurringSlots, students, personalSchedule]);

  // Unread notifications count
  const unreadNotifsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Cloud Sync on Auth change
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    // 1. Initial fetch from cloud or upload current local state if cloud is empty
    const initCloudData = async () => {
      try {
        setIsSyncing(true);
        const cloudData = await fetchStateFromCloud(user.uid);
        if (!isMounted) return;

        if (cloudData && Object.keys(cloudData).length > 2) {
          // Merge cloud data to local state & save locally
          if (cloudData.settings) {
            setSettings(cloudData.settings);
            saveTeacherSettings(cloudData.settings);
          }
          if (cloudData.students) {
            setStudents(cloudData.students);
            saveStudents(cloudData.students);
          }
          if (cloudData.recurringSlots) {
            setRecurringSlots(cloudData.recurringSlots);
            saveRecurringSlots(cloudData.recurringSlots);
          }
          if (cloudData.sessions) {
            setSessions(cloudData.sessions);
            saveSessions(cloudData.sessions);
          }
          if (cloudData.islamicBooks) {
            setIslamicBooks(cloudData.islamicBooks);
            saveIslamicBooks(cloudData.islamicBooks);
          }
          if (cloudData.quranGoals) {
            setQuranGoals(cloudData.quranGoals);
            saveQuranGoals(cloudData.quranGoals);
          }
          if (cloudData.werdLogs) {
            setWerdLogs(cloudData.werdLogs);
            saveWerdLogs(cloudData.werdLogs);
          }
          if (cloudData.curricula) {
            setCurricula(cloudData.curricula);
            saveCurricula(cloudData.curricula);
          }
          if (cloudData.prospectiveStudents) {
            setProspectiveStudents(cloudData.prospectiveStudents);
            saveProspectiveStudents(cloudData.prospectiveStudents);
          }
          if (cloudData.exams) {
            setExams(cloudData.exams);
            saveExams(cloudData.exams);
          }
          if (cloudData.studentQuranHifz) {
            setStudentQuranHifz(cloudData.studentQuranHifz);
            saveStudentQuranHifz(cloudData.studentQuranHifz);
          }
          if (cloudData.studentQuranRevision) {
            setStudentQuranRevision(cloudData.studentQuranRevision);
            saveStudentQuranRevision(cloudData.studentQuranRevision);
          }
          if (cloudData.completedJuz) {
            setCompletedJuz(cloudData.completedJuz);
            saveCompletedJuz(cloudData.completedJuz);
          }
          if (cloudData.personalSchedule) {
            setPersonalSchedule(cloudData.personalSchedule);
            savePersonalSchedule(cloudData.personalSchedule);
          }
          if (cloudData.payments) {
            setPayments(cloudData.payments);
            savePayments(cloudData.payments);
          }
          if (cloudData.notifications) {
            setNotifications(cloudData.notifications);
            saveNotifications(cloudData.notifications);
          }
        } else {
          // Cloud document is empty -> Upload current local state
          await syncStateToCloud(user.uid, {
            settings,
            students,
            recurringSlots,
            sessions,
            islamicBooks,
            quranGoals,
            werdLogs,
            curricula,
            prospectiveStudents,
            exams,
            studentQuranHifz,
            studentQuranRevision,
            completedJuz,
            personalSchedule,
            payments,
            notifications,
          });
        }
      } catch (err) {
        console.error('Initial cloud data sync error:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    initCloudData();

    // 2. Real-time subscription to cloud changes
    const unsubscribe = subscribeToCloudState(user.uid, (cloudState) => {
      if (!isMounted) return;
      if (cloudState.settings) {
        setSettings(cloudState.settings);
        saveTeacherSettings(cloudState.settings);
      }
      if (cloudState.students) {
        setStudents(cloudState.students);
        saveStudents(cloudState.students);
      }
      if (cloudState.recurringSlots) {
        setRecurringSlots(cloudState.recurringSlots);
        saveRecurringSlots(cloudState.recurringSlots);
      }
      if (cloudState.sessions) {
        setSessions(cloudState.sessions);
        saveSessions(cloudState.sessions);
      }
      if (cloudState.islamicBooks) {
        setIslamicBooks(cloudState.islamicBooks);
        saveIslamicBooks(cloudState.islamicBooks);
      }
      if (cloudState.quranGoals) {
        setQuranGoals(cloudState.quranGoals);
        saveQuranGoals(cloudState.quranGoals);
      }
      if (cloudState.werdLogs) {
        setWerdLogs(cloudState.werdLogs);
        saveWerdLogs(cloudState.werdLogs);
      }
      if (cloudState.curricula) {
        setCurricula(cloudState.curricula);
        saveCurricula(cloudState.curricula);
      }
      if (cloudState.prospectiveStudents) {
        setProspectiveStudents(cloudState.prospectiveStudents);
        saveProspectiveStudents(cloudState.prospectiveStudents);
      }
      if (cloudState.exams) {
        setExams(cloudState.exams);
        saveExams(cloudState.exams);
      }
      if (cloudState.studentQuranHifz) {
        setStudentQuranHifz(cloudState.studentQuranHifz);
        saveStudentQuranHifz(cloudState.studentQuranHifz);
      }
      if (cloudState.studentQuranRevision) {
        setStudentQuranRevision(cloudState.studentQuranRevision);
        saveStudentQuranRevision(cloudState.studentQuranRevision);
      }
      if (cloudState.completedJuz) {
        setCompletedJuz(cloudState.completedJuz);
        saveCompletedJuz(cloudState.completedJuz);
      }
      if (cloudState.personalSchedule) {
        setPersonalSchedule(cloudState.personalSchedule);
        savePersonalSchedule(cloudState.personalSchedule);
      }
      if (cloudState.payments) {
        setPayments(cloudState.payments);
        savePayments(cloudState.payments);
      }
      if (cloudState.notifications) {
        setNotifications(cloudState.notifications);
        saveNotifications(cloudState.notifications);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user?.uid]);

  // Helper for manual sync
  const handleManualSync = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      setIsSyncing(true);
      await syncStateToCloud(user.uid, {
        settings,
        students,
        recurringSlots,
        sessions,
        islamicBooks,
        quranGoals,
        werdLogs,
        curricula,
        prospectiveStudents,
        exams,
        studentQuranHifz,
        studentQuranRevision,
        completedJuz,
        personalSchedule,
        payments,
        notifications,
      });
    } catch (err) {
      console.error('Manual sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Reload all from storage (used after backup restore or defaults reset)
  const refreshAllData = () => {
    setSettings(loadTeacherSettings());
    setStudents(loadStudents());
    setRecurringSlots(loadRecurringSlots());
    setSessions(loadSessions());
    setIslamicBooks(loadIslamicBooks());
    setQuranGoals(loadQuranGoals());
    setWerdLogs(loadWerdLogs());
    setCurricula(loadCurricula());
    setProspectiveStudents(loadProspectiveStudents());
    setExams(loadExams());
    setStudentQuranHifz(loadStudentQuranHifz());
    setStudentQuranRevision(loadStudentQuranRevision());
    setCompletedJuz(loadCompletedJuz());
    setPersonalSchedule(loadPersonalSchedule());
    setPayments(loadPayments());
    setNotifications(loadNotifications());
  };

  // --- Handlers for Teacher Settings ---
  const handleSaveSettings = (newSettings: TeacherSettings) => {
    setSettings(newSettings);
    saveTeacherSettings(newSettings);
  };

  // --- Handlers for Students ---
  const handleSaveStudent = (studentData: Omit<Student, 'id'>, editId?: string) => {
    let updated: Student[];
    if (editId) {
      updated = students.map(s => (s.id === editId ? { ...studentData, id: editId } : s));
    } else {
      const newStudent: Student = {
        ...studentData,
        id: `student-${Date.now()}`,
      };
      updated = [...students, newStudent];
    }
    setStudents(updated);
    saveStudents(updated);
  };

  const handleDeleteStudent = (studentId: string) => {
    const s = students.find(item => item.id === studentId);
    if (
      window.confirm(
        `هل أنت متأكد من حذف الطالب (${s?.name || ''})؟ سيتم حذف مواعيده وسجلاته.`
      )
    ) {
      const updatedStudents = students.filter(item => item.id !== studentId);
      const updatedSlots = recurringSlots.filter(slot => slot.studentId !== studentId);
      const updatedSessions = sessions.filter(sess => sess.studentId !== studentId);

      setStudents(updatedStudents);
      saveStudents(updatedStudents);

      setRecurringSlots(updatedSlots);
      saveRecurringSlots(updatedSlots);

      setSessions(updatedSessions);
      saveSessions(updatedSessions);
    }
  };

  // --- Handlers for Recurring Slots ---
  const handleSaveSlot = (slotData: Omit<RecurringSlot, 'id'>, editId?: string) => {
    let updated: RecurringSlot[];
    if (editId) {
      updated = recurringSlots.map(s => (s.id === editId ? { ...slotData, id: editId } : s));
    } else {
      const newSlot: RecurringSlot = {
        ...slotData,
        id: `slot-${Date.now()}`,
      };
      updated = [...recurringSlots, newSlot];
    }
    setRecurringSlots(updated);
    saveRecurringSlots(updated);
  };

  const handleDeleteSlot = (slotId: string) => {
    if (window.confirm('هل أنت متأكد من حذف موعد الحلقة هذا؟')) {
      const updated = recurringSlots.filter(s => s.id !== slotId);
      setRecurringSlots(updated);
      saveRecurringSlots(updated);
    }
  };

  // --- Handlers for Sessions (Hours Tracker) ---
  const handleSaveSession = (sessionData: Omit<SessionRecord, 'id'>, editId?: string) => {
    let updated: SessionRecord[];
    if (editId) {
      updated = sessions.map(s => (s.id === editId ? { ...sessionData, id: editId } : s));
    } else {
      const newSession: SessionRecord = {
        ...sessionData,
        id: `sess-${Date.now()}`,
      };
      updated = [newSession, ...sessions];
    }
    setSessions(updated);
    saveSessions(updated);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('هل أنت متأكد من حذف سجل هذه الحصة؟')) {
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);
      saveSessions(updated);
    }
  };

  const handleQuickLogSessionForSlot = (slot: RecurringSlot) => {
    setEditingSession(null);
    setPreselectedSlotForLog(slot);
    setPreselectedStudentIdForLog(slot.studentId);
    setIsLogSessionOpen(true);
  };

  const handleQuickLogSessionForStudent = (studentId: string) => {
    setEditingSession(null);
    setPreselectedSlotForLog(null);
    setPreselectedStudentIdForLog(studentId);
    setIsLogSessionOpen(true);
  };

  // --- Handlers for Curricula ---
  const handleSaveCurricula = (updated: CurriculumTrack[]) => {
    setCurricula(updated);
    saveCurricula(updated);
  };

  // --- Handlers for Quran ---
  const handleSaveStudentHifz = (updated: StudentQuranHifz[]) => {
    setStudentQuranHifz(updated);
    saveStudentQuranHifz(updated);
  };

  const handleSaveStudentRevision = (updated: StudentQuranRevision[]) => {
    setStudentQuranRevision(updated);
    saveStudentQuranRevision(updated);
  };

  const handleSaveCompletedJuz = (updated: CompletedJuzRecord[]) => {
    setCompletedJuz(updated);
    saveCompletedJuz(updated);
  };

  // --- Handlers for Exams ---
  const handleSaveExams = (updated: ExamRecord[]) => {
    setExams(updated);
    saveExams(updated);
  };

  // --- Handlers for Payments ---
  const handleSavePayments = (updated: PaymentRecord[]) => {
    setPayments(updated);
    savePayments(updated);
  };

  // --- Handlers for Notifications ---
  const handleSaveNotifications = (updated: AppNotification[]) => {
    setNotifications(updated);
    saveNotifications(updated);
  };

  // --- Handlers for Personal Schedule ---
  const handleSavePersonalSchedule = (updated: PersonalScheduleItem[]) => {
    setPersonalSchedule(updated);
    savePersonalSchedule(updated);
  };

  // --- Handlers for Islamic Books ---
  const handleSaveBook = (bookData: Omit<IslamicBook, 'id'>, editId?: string) => {
    let updated: IslamicBook[];
    if (editId) {
      updated = islamicBooks.map(b => (b.id === editId ? { ...bookData, id: editId } : b));
    } else {
      const newBook: IslamicBook = {
        ...bookData,
        id: `book-${Date.now()}`,
      };
      updated = [...islamicBooks, newBook];
    }
    setIslamicBooks(updated);
    saveIslamicBooks(updated);
  };

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكتاب من مكتبتك؟')) {
      const updated = islamicBooks.filter(b => b.id !== bookId);
      setIslamicBooks(updated);
      saveIslamicBooks(updated);
    }
  };

  const handleUpdateBookProgress = (bookId: string, completedPages: number) => {
    const updated = islamicBooks.map(b => {
      if (b.id === bookId) {
        const isDone = completedPages >= b.totalPagesOrLessons;
        return {
          ...b,
          completedPagesOrLessons: completedPages,
          status: isDone ? ('completed' as const) : b.status,
          completedDate: isDone ? new Date().toISOString().slice(0, 10) : b.completedDate,
        };
      }
      return b;
    });
    setIslamicBooks(updated);
    saveIslamicBooks(updated);
  };

  // --- Handlers for Quran Goals ---
  const handleToggleQuranGoal = (goalId: string) => {
    const updated = quranGoals.map(g => {
      if (g.id === goalId) {
        const nextState = !g.isCompletedToday;
        return {
          ...g,
          isCompletedToday: nextState,
          completedDaysThisMonth: nextState
            ? g.completedDaysThisMonth + 1
            : Math.max(0, g.completedDaysThisMonth - 1),
        };
      }
      return g;
    });
    setQuranGoals(updated);
    saveQuranGoals(updated);
  };

  const handleUpdateQuranGoal = (goal: QuranPersonalGoal) => {
    const updated = quranGoals.map(g => (g.id === goal.id ? goal : g));
    setQuranGoals(updated);
    saveQuranGoals(updated);
  };

  // --- Handlers for Daily Werd Log ---
  const handleUpdateWerdLog = (newLog: DailyWerdLog) => {
    const existingIndex = werdLogs.findIndex(l => l.date === newLog.date);
    let updated: DailyWerdLog[];
    if (existingIndex >= 0) {
      updated = [...werdLogs];
      updated[existingIndex] = newLog;
    } else {
      updated = [newLog, ...werdLogs];
    }
    setWerdLogs(updated);
    saveWerdLogs(updated);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D3436] flex flex-col antialiased font-sans">
      {/* Top Application Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setActiveTab('settings')}
        students={students}
        sessions={sessions}
        quranGoals={quranGoals}
        onDataRefreshed={refreshAllData}
        onQuickLogSession={() => {
          setEditingSession(null);
          setPreselectedSlotForLog(null);
          setPreselectedStudentIdForLog(undefined);
          setIsLogSessionOpen(true);
        }}
        onNavigateToNotifications={() => setActiveTab('notifications')}
        unreadNotifsCount={unreadNotifsCount}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        conflictCount={conflicts.length}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Primary Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        <ErrorBoundary fallbackTitle="تعذر تحميل محتوى هذا القسم" onReset={refreshAllData}>
          {/* Tab 1: Dashboard (الرئيسية) */}
          {activeTab === 'dashboard' && (
            <DashboardView
              students={students}
              recurringSlots={recurringSlots}
              sessions={sessions}
              personalSchedule={personalSchedule}
              teacherSettings={settings}
              payments={payments}
              exams={exams}
              notifications={notifications}
              onNavigate={tab => setActiveTab(tab)}
              onOpenQuickSession={handleQuickLogSessionForStudent}
              onOpenWhatsAppModal={(student, slot) => {
                setWhatsAppModal({ isOpen: true, student, slot: slot || null });
              }}
            />
          )}

          {/* Tab 2: Calendar & Schedule (التقويم والمواعيد) */}
          {activeTab === 'calendar' && (
            <WeeklyTimetable
              slots={recurringSlots}
              students={students}
              settings={settings}
              conflicts={conflicts}
              onAddSlot={() => {
                setEditingSlot(null);
                setIsAddSlotOpen(true);
              }}
              onEditSlot={slot => {
                setEditingSlot(slot);
                setIsAddSlotOpen(true);
              }}
              onDeleteSlot={handleDeleteSlot}
              onLogCompletedSession={handleQuickLogSessionForSlot}
              onSendWhatsAppReminder={(slot, student) => {
                setWhatsAppModal({ isOpen: true, student, slot });
              }}
            />
          )}

          {/* Tab 3: Students Management (الطلاب) */}
          {activeTab === 'students' && (
            <StudentsList
              students={students}
              slots={recurringSlots}
              sessions={sessions}
              settings={settings}
              onAddStudent={() => {
                setEditingStudent(null);
                setIsAddStudentOpen(true);
              }}
              onEditStudent={student => {
                setEditingStudent(student);
                setIsAddStudentOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              onOpenWhatsAppReminder={(slot, student) => {
                setWhatsAppModal({ isOpen: true, student, slot });
              }}
              onQuickLogSession={handleQuickLogSessionForStudent}
            />
          )}

          {/* Tab 4: Curricula & Tracks (المسارات التعليمية) */}
          {activeTab === 'curricula' && (
            <CurriculaView
              curricula={curricula}
              students={students}
              onSaveCurricula={handleSaveCurricula}
              onUpdateStudentProgress={(studentId, progress) => {
                const updated = students.map(s => (s.id === studentId ? { ...s, curricula: progress } : s));
                setStudents(updated);
                saveStudents(updated);
              }}
            />
          )}

          {/* Tab 5: Quran Hifz, Revision & Juz Map (القرآن) */}
          {activeTab === 'quran' && (
            <QuranView
              students={students}
              studentHifz={studentQuranHifz}
              studentRevision={studentQuranRevision}
              completedJuz={completedJuz}
              onSaveHifz={handleSaveStudentHifz}
              onSaveRevision={handleSaveStudentRevision}
              onSaveCompletedJuz={handleSaveCompletedJuz}
            />
          )}

          {/* Tab 6: Exams & Certificates (الاختبارات) */}
          {activeTab === 'exams' && (
            <ExamsView
              exams={exams}
              students={students}
              onSaveExams={handleSaveExams}
              onOpenWhatsAppModal={student => {
                setWhatsAppModal({ isOpen: true, student, slot: null });
              }}
            />
          )}

          {/* Tab 7: Personal Schedule & Islamic Sciences (جدولي الشخصي) */}
          {activeTab === 'personal_schedule' && (
            <PersonalRoutineView
              islamicBooks={islamicBooks}
              quranGoals={quranGoals}
              werdLogs={werdLogs}
              personalSchedule={personalSchedule}
              onSaveBook={handleSaveBook}
              onDeleteBook={handleDeleteBook}
              onUpdateBookProgress={handleUpdateBookProgress}
              onToggleQuranGoal={handleToggleQuranGoal}
              onUpdateQuranGoal={handleUpdateQuranGoal}
              onUpdateWerdLog={handleUpdateWerdLog}
              onSavePersonalSchedule={handleSavePersonalSchedule}
            />
          )}

          {/* Tab 8: Hours Tracking (الساعات) */}
          {activeTab === 'hours' && (
            <MonthlyHoursTracker
              students={students}
              sessions={sessions}
              settings={settings}
              onAddSession={() => {
                setEditingSession(null);
                setPreselectedSlotForLog(null);
                setPreselectedStudentIdForLog(undefined);
                setIsLogSessionOpen(true);
              }}
              onEditSession={sess => {
                setEditingSession(sess);
                setIsLogSessionOpen(true);
              }}
              onDeleteSession={handleDeleteSession}
              onQuickLogForStudent={handleQuickLogSessionForStudent}
            />
          )}

          {/* Tab 9: Payments & Invoicing (المدفوعات) */}
          {activeTab === 'payments' && (
            <PaymentsView
              payments={payments}
              students={students}
              teacherSettings={settings}
              onSavePayments={handleSavePayments}
            />
          )}

          {/* Tab 10: Reports & Analytics (التقارير) */}
          {activeTab === 'reports' && (
            <ReportsView
              students={students}
              sessions={sessions}
              teacherSettings={settings}
              exams={exams}
              curricula={curricula}
              onOpenWhatsAppModal={student => {
                setWhatsAppModal({ isOpen: true, student, slot: null });
              }}
            />
          )}

          {/* Tab 11: Notifications & Smart Reminders (التنبيهات) */}
          {activeTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              students={students}
              onSaveNotifications={handleSaveNotifications}
              onNavigate={tab => setActiveTab(tab)}
            />
          )}

          {/* Tab 12: Settings & Preferences (الإعدادات) */}
          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onManualSync={handleManualSync}
              isSyncing={isSyncing}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-[#F8F5EE] border-t border-[#E8E1D5] py-6 mt-12 text-center text-xs text-[#5D6567]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-sm text-[#2D3436] font-bold">
            مقرأة المعلم • نظام شامل لإدارة الطلاب وجدولة الحلقات ومتابعة الساعات والورد الشخصي
          </div>
          <div className="text-[#5D6567]">
            قال رسول الله ﷺ: «خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ» (رواه البخاري)
          </div>
        </div>
      </footer>

      {/* Global Modals */}

      {/* 1. Teacher Settings Modal */}
      <TeacherSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* 2. Add / Edit Session Slot Modal */}
      <AddSessionModal
        isOpen={isAddSlotOpen}
        onClose={() => {
          setIsAddSlotOpen(false);
          setEditingSlot(null);
        }}
        students={students}
        settings={settings}
        existingSlots={recurringSlots}
        onSaveSlot={handleSaveSlot}
        editingSlot={editingSlot}
      />

      {/* 3. Add / Edit Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => {
          setIsAddStudentOpen(false);
          setEditingStudent(null);
        }}
        onSaveStudent={handleSaveStudent}
        editingStudent={editingStudent}
        settings={settings}
      />

      {/* 4. Log Session Record Modal */}
      <LogSessionModal
        isOpen={isLogSessionOpen}
        onClose={() => {
          setIsLogSessionOpen(false);
          setEditingSession(null);
          setPreselectedSlotForLog(null);
          setPreselectedStudentIdForLog(undefined);
        }}
        students={students}
        settings={settings}
        onSaveSession={handleSaveSession}
        editingSession={editingSession}
        preselectedSlot={preselectedSlotForLog}
        preselectedStudentId={preselectedStudentIdForLog}
      />

      {/* 5. WhatsApp Reminder Message Modal */}
      <WhatsAppReminderModal
        isOpen={whatsAppModal.isOpen}
        onClose={() => setWhatsAppModal({ isOpen: false, student: null, slot: null })}
        student={whatsAppModal.student}
        slot={whatsAppModal.slot}
        settings={settings}
      />

      {/* 6. Integrated Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
