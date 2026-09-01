import { COMMON_TIMEZONES } from '../data/timezones';

/**
 * Parses time string "HH:MM" into hours and minutes
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = (timeStr || '00:00').split(':').map(Number);
  return { hours: isNaN(h) ? 0 : h, minutes: isNaN(m) ? 0 : m };
}

/**
 * Formats hours and minutes into "HH:MM" 24h
 */
export function formatTime24(hours: number, minutes: number): string {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Formats time into standard Arabic 12-hour format with AM/PM (ص / م)
 */
export function formatTime12(timeStr: string): string {
  const { hours, minutes } = parseTime(timeStr);
  const period = hours >= 12 ? 'م' : 'ص';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const m = String(minutes).padStart(2, '0');
  return `${displayHours}:${m} ${period}`;
}

/**
 * Get current UTC date representing the given teacher time on a specific reference day
 */
function getReferenceDateForTeacher(teacherTime: string, teacherTimezone: string, baseDateStr?: string): Date {
  const { hours, minutes } = parseTime(teacherTime);
  const now = baseDateStr ? new Date(baseDateStr) : new Date();
  
  // Format year, month, day in teacher's timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: teacherTimezone || 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const formattedDate = formatter.format(now); // e.g. "2026-09-01"
  const [year, month, day] = formattedDate.split('-').map(Number);

  // We find the UTC epoch that matches this local date/time in teacher's timezone
  // A clean iterative approach using Intl
  let targetUtc = Date.UTC(year, month - 1, day, hours, minutes, 0);

  // Adjust for teacher's timezone offset
  const testDate = new Date(targetUtc);
  const teacherLocalStr = testDate.toLocaleString('en-US', {
    timeZone: teacherTimezone || 'Africa/Cairo',
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
  
  // Extract parsed local hours
  const match = teacherLocalStr.match(/(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+)/);
  if (match) {
    const localHour = parseInt(match[4], 10);
    const localMinute = parseInt(match[5], 10);
    const diffMinutes = (hours * 60 + minutes) - (localHour * 60 + localMinute);
    targetUtc += diffMinutes * 60 * 1000;
  }

  return new Date(targetUtc);
}

/**
 * Converts a time in teacher's timezone to student's timezone
 */
export function convertTeacherTimeToStudentTime(
  teacherTime: string,
  teacherTimezone: string,
  studentTimezone: string,
  baseDateStr?: string
): {
  studentTime: string;
  studentTime24: string;
  studentTime12: string;
  dayOffset: number; // -1: previous day, 0: same day, +1: next day
  offsetDescription: string;
} {
  if (!teacherTimezone || !studentTimezone || teacherTimezone === studentTimezone) {
    return {
      studentTime: teacherTime,
      studentTime24: teacherTime,
      studentTime12: formatTime12(teacherTime),
      dayOffset: 0,
      offsetDescription: 'نفس التوقيت تماماً',
    };
  }

  try {
    const utcDate = getReferenceDateForTeacher(teacherTime, teacherTimezone, baseDateStr);

    const studentFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: studentTimezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const parts = studentFormatter.formatToParts(utcDate);
    const hourPart = parts.find(p => p.type === 'hour')?.value || '00';
    const minutePart = parts.find(p => p.type === 'minute')?.value || '00';
    const studentTime24 = `${hourPart.padStart(2, '0')}:${minutePart.padStart(2, '0')}`;

    // Calculate time difference in hours
    const { hours: tHours, minutes: tMinutes } = parseTime(teacherTime);
    const { hours: sHours, minutes: sMinutes } = parseTime(studentTime24);

    let diffMinutes = (sHours * 60 + sMinutes) - (tHours * 60 + tMinutes);
    // Handle day wrap for diff description
    if (diffMinutes > 720) diffMinutes -= 1440;
    if (diffMinutes < -720) diffMinutes += 1440;

    const diffHours = diffMinutes / 60;
    let offsetDescription = '';
    if (diffHours === 0) {
      offsetDescription = 'نفس التوقيت';
    } else if (diffHours > 0) {
      offsetDescription = `الطالب يسبقك بـ ${Math.abs(diffHours)} ساعة`;
    } else {
      offsetDescription = `الطالب متأخر عنك بـ ${Math.abs(diffHours)} ساعة`;
    }

    // Determine day offset relative to teacher reference date
    const teacherFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: teacherTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const teacherDateStr = teacherFormatter.format(utcDate);

    const studentDateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: studentTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const studentDateStr = studentDateFormatter.format(utcDate);

    let dayOffset = 0;
    if (studentDateStr > teacherDateStr) dayOffset = 1;
    else if (studentDateStr < teacherDateStr) dayOffset = -1;

    return {
      studentTime: studentTime24,
      studentTime24,
      studentTime12: formatTime12(studentTime24),
      dayOffset,
      offsetDescription
    };
  } catch (error) {
    console.error('Timezone conversion error:', error);
    return {
      studentTime: teacherTime,
      studentTime24: teacherTime,
      studentTime12: formatTime12(teacherTime),
      dayOffset: 0,
      offsetDescription: 'تعذر حساب الفرق',
    };
  }
}

/**
 * Get Timezone label or city name from timezone ID
 */
export const convertTeacherToStudentTime = convertTeacherTimeToStudentTime;

/**
 * Get Timezone label or city name from timezone ID
 */
export function getTimeZoneLabel(tzId: string): string {
  const found = COMMON_TIMEZONES.find(t => t.id === tzId);
  if (found) {
    return `${found.flag} ${found.name}`;
  }
  return tzId;
}

/**
 * Get current time in specified timezone formatted nicely
 */
export function getCurrentTimeInZone(tzId: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA', {
      timeZone: tzId,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toLocaleTimeString();
  }
}
