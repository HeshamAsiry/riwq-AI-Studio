import { RecurringSlot, SessionRecord, Student, TimeConflict, PersonalScheduleItem } from '../types';
import { DAYS_ARABIC } from '../data/timezones';
import { parseTime, formatTime24, formatTime12 } from './timezones';

function timeToMinutes(timeStr: string): number {
  const { hours, minutes } = parseTime(timeStr);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, totalMinutes % 1440);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return formatTime24(hours, minutes);
}

/**
 * Checks if two time intervals overlap on the same day
 */
export function doIntervalsOverlap(
  start1Min: number,
  duration1Min: number,
  start2Min: number,
  duration2Min: number
): boolean {
  const end1Min = start1Min + duration1Min;
  const end2Min = start2Min + duration2Min;
  return Math.max(start1Min, start2Min) < Math.min(end1Min, end2Min);
}

/**
 * Checks if a personal schedule item applies to a specific day of week and optional date
 */
export function doesPersonalItemApplyToDay(
  pItem: PersonalScheduleItem,
  dayOfWeek: number,
  specificDate?: string
): boolean {
  if (pItem.isActive === false) return false;

  const freq =
    pItem.frequency ||
    pItem.recurrenceType ||
    (pItem.isRecurring ? 'weekly' : pItem.specificDate ? 'once' : 'weekly');

  if (freq === 'daily') {
    return true;
  }

  if (freq === 'weekly') {
    if (Array.isArray(pItem.daysOfWeek) && pItem.daysOfWeek.length > 0) {
      return pItem.daysOfWeek.includes(dayOfWeek);
    }
    if (typeof pItem.dayOfWeek === 'number') {
      return pItem.dayOfWeek === dayOfWeek;
    }
    return false;
  }

  if (freq === 'once') {
    if (specificDate && pItem.specificDate) {
      return pItem.specificDate === specificDate;
    }
    if (pItem.specificDate) {
      const parts = pItem.specificDate.split('-').map(Number);
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.getDay() === dayOfWeek;
      }
    }
    if (typeof pItem.dayOfWeek === 'number') {
      return pItem.dayOfWeek === dayOfWeek;
    }
    return false;
  }

  if (Array.isArray(pItem.daysOfWeek) && pItem.daysOfWeek.length > 0) {
    return pItem.daysOfWeek.includes(dayOfWeek);
  }
  return pItem.dayOfWeek === dayOfWeek;
}

/**
 * Checks if a candidate recurring slot conflicts with any existing active recurring slot or personal schedule
 */
export function checkRecurringSlotConflict(
  candidateSlot: {
    id?: string;
    studentId: string;
    dayOfWeek: number;
    teacherStartTime: string;
    durationMinutes: number;
  },
  existingSlots: RecurringSlot[] = [],
  students: Student[] = [],
  personalSchedule: PersonalScheduleItem[] = []
): TimeConflict | null {
  const candStart = timeToMinutes(candidateSlot.teacherStartTime);
  const candDur = candidateSlot.durationMinutes;

  const currentStudent = students.find(s => s.id === candidateSlot.studentId);
  const candStudentName = currentStudent?.name || 'الطالب المحدد';

  // 1. Check with student slots
  for (const slot of existingSlots) {
    if (!slot.active) continue;
    if (candidateSlot.id && slot.id === candidateSlot.id) continue; // skip self when editing
    if (slot.dayOfWeek !== candidateSlot.dayOfWeek) continue;

    const slotStart = timeToMinutes(slot.teacherStartTime);
    const slotDur = slot.durationMinutes;

    if (doIntervalsOverlap(candStart, candDur, slotStart, slotDur)) {
      const conflictingStudent = students.find(s => s.id === slot.studentId);
      const confStudentName = conflictingStudent?.name || 'طالب آخر';
      const dayName = DAYS_ARABIC.find(d => d.index === slot.dayOfWeek)?.name || 'اليوم';

      return {
        hasConflict: true,
        type: 'recurring_overlap',
        conflictingSlot1: {
          id: candidateSlot.id || 'new',
          studentName: candStudentName,
          dayOrDate: dayName,
          time: candidateSlot.teacherStartTime,
          duration: candDur,
        },
        conflictingSlot2: {
          id: slot.id,
          studentName: confStudentName,
          dayOrDate: dayName,
          time: slot.teacherStartTime,
          duration: slotDur,
        },
        details: `يوجد تعارض في يوم ${dayName}: موعد ${candStudentName} (${formatTime12(candidateSlot.teacherStartTime)} - ${candDur} دقيقة) يتعارض مع موعد ${confStudentName} (${formatTime12(slot.teacherStartTime)} - ${slotDur} دقيقة).`,
      };
    }
  }

  // 2. Check with personal schedule slots on that day
  for (const pItem of personalSchedule) {
    if (!doesPersonalItemApplyToDay(pItem, candidateSlot.dayOfWeek)) continue;
    const pStart = timeToMinutes(pItem.startTime);
    const pDur = pItem.durationMinutes;

    if (doIntervalsOverlap(candStart, candDur, pStart, pDur)) {
      const dayName = DAYS_ARABIC.find(d => d.index === candidateSlot.dayOfWeek)?.name || 'اليوم';
      return {
        hasConflict: true,
        type: 'personal_overlap',
        conflictingSlot1: {
          id: candidateSlot.id || 'new',
          studentName: candStudentName,
          dayOrDate: dayName,
          time: candidateSlot.teacherStartTime,
          duration: candDur,
        },
        conflictingSlot2: {
          id: pItem.id,
          studentName: `جدولك الشخصي: ${pItem.title}`,
          dayOrDate: dayName,
          time: pItem.startTime,
          duration: pDur,
        },
        details: `يوجد تعارض في يوم ${dayName}: موعد ${candStudentName} (${formatTime12(candidateSlot.teacherStartTime)}) يتعارض مع التزامك الشخصي (${pItem.title} - ${formatTime12(pItem.startTime)}).`,
      };
    }
  }

  return null;
}

/**
 * Checks all existing recurring slots and personal schedule for any active conflicts
 */
export function findAllRecurringConflicts(
  slots: RecurringSlot[] = [],
  students: Student[] = [],
  personalSchedule: PersonalScheduleItem[] = []
): TimeConflict[] {
  const conflicts: TimeConflict[] = [];
  const activeSlots = slots.filter(s => s.active);

  // Slot vs Slot
  for (let i = 0; i < activeSlots.length; i++) {
    for (let j = i + 1; j < activeSlots.length; j++) {
      const slot1 = activeSlots[i];
      const slot2 = activeSlots[j];

      if (slot1.dayOfWeek === slot2.dayOfWeek) {
        const start1 = timeToMinutes(slot1.teacherStartTime);
        const start2 = timeToMinutes(slot2.teacherStartTime);

        if (doIntervalsOverlap(start1, slot1.durationMinutes, start2, slot2.durationMinutes)) {
          const s1 = students.find(s => s.id === slot1.studentId);
          const s2 = students.find(s => s.id === slot2.studentId);
          const dayName = DAYS_ARABIC.find(d => d.index === slot1.dayOfWeek)?.name || 'اليوم';

          conflicts.push({
            hasConflict: true,
            type: 'recurring_overlap',
            conflictingSlot1: {
              id: slot1.id,
              studentName: s1?.name || 'طالب 1',
              dayOrDate: dayName,
              time: slot1.teacherStartTime,
              duration: slot1.durationMinutes,
            },
            conflictingSlot2: {
              id: slot2.id,
              studentName: s2?.name || 'طالب 2',
              dayOrDate: dayName,
              time: slot2.teacherStartTime,
              duration: slot2.durationMinutes,
            },
            details: `تعارض يوم ${dayName} بين [${s1?.name || 'طالب'}] (${formatTime12(slot1.teacherStartTime)}) و [${s2?.name || 'طالب'}] (${formatTime12(slot2.teacherStartTime)})`,
          });
        }
      }
    }
  }

  // Slot vs Personal Schedule
  for (const slot of activeSlots) {
    for (const pItem of personalSchedule) {
      if (doesPersonalItemApplyToDay(pItem, slot.dayOfWeek)) {
        const start1 = timeToMinutes(slot.teacherStartTime);
        const start2 = timeToMinutes(pItem.startTime);

        if (doIntervalsOverlap(start1, slot.durationMinutes, start2, pItem.durationMinutes)) {
          const s1 = students.find(s => s.id === slot.studentId);
          const dayName = DAYS_ARABIC.find(d => d.index === slot.dayOfWeek)?.name || 'اليوم';

          conflicts.push({
            hasConflict: true,
            type: 'personal_overlap',
            conflictingSlot1: {
              id: slot.id,
              studentName: s1?.name || 'طالب',
              dayOrDate: dayName,
              time: slot.teacherStartTime,
              duration: slot.durationMinutes,
            },
            conflictingSlot2: {
              id: pItem.id,
              studentName: `وردك/درسك: ${pItem.title}`,
              dayOrDate: dayName,
              time: pItem.startTime,
              duration: pItem.durationMinutes,
            },
            details: `تعارض يوم ${dayName} بين حصة [${s1?.name || 'طالب'}] (${formatTime12(slot.teacherStartTime)}) وموعدك الشخصي [${pItem.title}] (${formatTime12(pItem.startTime)})`,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Check if a specific date session conflicts with other sessions or recurring slots on that day
 */
export function checkSessionConflict(
  candidateSession: {
    id?: string;
    studentId: string;
    date: string; // YYYY-MM-DD
    teacherStartTime: string;
    durationMinutes: number;
  },
  existingSessions: SessionRecord[],
  students: Student[]
): TimeConflict | null {
  const candStart = timeToMinutes(candidateSession.teacherStartTime);
  const candDur = candidateSession.durationMinutes;
  const candStudent = students.find(s => s.id === candidateSession.studentId);
  const candStudentName = candStudent?.name || 'الطالب المحدد';

  for (const session of existingSessions) {
    if (session.status === 'student_cancelled' || session.status === 'absent') continue;
    if (candidateSession.id && session.id === candidateSession.id) continue;
    if (session.date !== candidateSession.date) continue;

    const sessStart = timeToMinutes(session.teacherStartTime);
    const sessDur = session.durationMinutes;

    if (doIntervalsOverlap(candStart, candDur, sessStart, sessDur)) {
      const confStudent = students.find(s => s.id === session.studentId);
      return {
        hasConflict: true,
        type: 'session_overlap',
        conflictingSlot1: {
          id: candidateSession.id || 'new',
          studentName: candStudentName,
          dayOrDate: candidateSession.date,
          time: candidateSession.teacherStartTime,
          duration: candDur,
        },
        conflictingSlot2: {
          id: session.id,
          studentName: confStudent?.name || 'طالب آخر',
          dayOrDate: session.date,
          time: session.teacherStartTime,
          duration: sessDur,
        },
        details: `يوجد تعارض في تاريخ ${candidateSession.date}: حصة ${candStudentName} (${formatTime12(candidateSession.teacherStartTime)}) تتعارض مع حصة ${confStudent?.name || 'طالب آخر'} (${formatTime12(session.teacherStartTime)}).`,
      };
    }
  }

  return null;
}

export interface AvailableTimeWindow {
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

/**
 * Calculates open available windows based on working hours minus student slots & personal schedule
 */
export function calculateAvailableSlots(
  workingDays: number[],
  workingHoursStart: string,
  workingHoursEnd: string,
  existingSlots: RecurringSlot[],
  personalSchedule: PersonalScheduleItem[] = [],
  minDurationMinutes: number = 30
): AvailableTimeWindow[] {
  const availableWindows: AvailableTimeWindow[] = [];
  const startLimit = timeToMinutes(workingHoursStart);
  const endLimit = timeToMinutes(workingHoursEnd);

  for (const day of workingDays) {
    const dayName = DAYS_ARABIC.find(d => d.index === day)?.name || `يوم ${day}`;
    
    // Collect all busy intervals on this day
    const busyIntervals: { start: number; end: number }[] = [];

    // 1. Student active recurring slots
    existingSlots
      .filter(s => s.active && s.dayOfWeek === day)
      .forEach(s => {
        const start = timeToMinutes(s.teacherStartTime);
        busyIntervals.push({ start, end: start + s.durationMinutes });
      });

    // 2. Personal schedule items
    personalSchedule
      .filter(p => doesPersonalItemApplyToDay(p, day))
      .forEach(p => {
        const start = timeToMinutes(p.startTime);
        busyIntervals.push({ start, end: start + p.durationMinutes });
      });

    // Sort busy intervals by start time
    busyIntervals.sort((a, b) => a.start - b.start);

    // Merge overlapping busy intervals
    const mergedBusy: { start: number; end: number }[] = [];
    for (const interval of busyIntervals) {
      if (mergedBusy.length === 0) {
        mergedBusy.push({ ...interval });
      } else {
        const last = mergedBusy[mergedBusy.length - 1];
        if (interval.start <= last.end) {
          last.end = Math.max(last.end, interval.end);
        } else {
          mergedBusy.push({ ...interval });
        }
      }
    }

    // Find free gaps between startLimit and endLimit
    let currentPointer = startLimit;
    for (const busy of mergedBusy) {
      const busyStartClamped = Math.max(startLimit, Math.min(busy.start, endLimit));
      const busyEndClamped = Math.max(startLimit, Math.min(busy.end, endLimit));

      if (busyStartClamped > currentPointer) {
        const duration = busyStartClamped - currentPointer;
        if (duration >= minDurationMinutes) {
          availableWindows.push({
            dayOfWeek: day,
            dayName,
            startTime: minutesToTime(currentPointer),
            endTime: minutesToTime(busyStartClamped),
            durationMinutes: duration,
          });
        }
      }
      currentPointer = Math.max(currentPointer, busyEndClamped);
    }

    if (currentPointer < endLimit) {
      const duration = endLimit - currentPointer;
      if (duration >= minDurationMinutes) {
        availableWindows.push({
          dayOfWeek: day,
          dayName,
          startTime: minutesToTime(currentPointer),
          endTime: minutesToTime(endLimit),
          durationMinutes: duration,
        });
      }
    }
  }

  return availableWindows;
}

/**
 * Suggest next available time slot on the same day
 */
export function suggestNextAvailableTime(
  dayOfWeek: number,
  durationMinutes: number,
  existingSlots: RecurringSlot[],
  workingHoursStart: string = '08:00',
  workingHoursEnd: string = '22:00'
): string[] {
  const daySlots = existingSlots
    .filter(s => s.active && s.dayOfWeek === dayOfWeek)
    .map(s => ({
      start: timeToMinutes(s.teacherStartTime),
      end: timeToMinutes(s.teacherStartTime) + s.durationMinutes,
    }))
    .sort((a, b) => a.start - b.start);

  const startLimit = timeToMinutes(workingHoursStart);
  const endLimit = timeToMinutes(workingHoursEnd);

  const suggestions: string[] = [];

  // Check from startLimit to endLimit with 15-min intervals
  for (let t = startLimit; t + durationMinutes <= endLimit; t += 15) {
    const candidateEnd = t + durationMinutes;
    const hasOverlap = daySlots.some(s => Math.max(t, s.start) < Math.min(candidateEnd, s.end));
    if (!hasOverlap) {
      suggestions.push(minutesToTime(t));
      if (suggestions.length >= 4) break;
    }
  }

  return suggestions;
}

