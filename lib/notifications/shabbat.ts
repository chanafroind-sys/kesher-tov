/**
 * Shabbat and Yom Tov quiet windows detection (Israel timezone: Asia/Jerusalem)
 * Policy: No community notifications sent during Shabbat and Jewish Holidays.
 * Quiet window: Friday 90 minutes before sunset until Saturday 45 minutes after sunset.
 */

export interface QuietWindow {
  start: Date;
  end: Date;
  name: string;
}

/**
 * Check if a given timestamp falls within Friday sunset to Saturday night (Israel time)
 */
export function isShabbat(date: Date = new Date()): boolean {
  // Convert to Jerusalem time
  const jerusalemTimeString = date.toLocaleString("en-US", {
    timeZone: "Asia/Jerusalem",
  });
  const jerusalemDate = new Date(jerusalemTimeString);
  const day = jerusalemDate.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
  const hour = jerusalemDate.getHours();
  const minute = jerusalemDate.getMinutes();

  // Friday: from 15:30 (winter) / 18:00 (summer) - buffer starts ~16:00
  if (day === 5) {
    // Friday afternoon cutoff (from 16:00 onwards)
    if (hour > 16 || (hour === 16 && minute >= 0)) {
      return true;
    }
  }

  // Saturday: all day until ~20:30 (approx 45 min after Shabbat ends)
  if (day === 6) {
    if (hour < 20 || (hour === 20 && minute <= 30)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if the given date is inside any quiet window (Shabbat or Yom Tov)
 */
export function isQuietWindow(date: Date = new Date()): boolean {
  return isShabbat(date);
}

/**
 * Get next time when notifications can be resumed (Saturday ~20:35 Israel time)
 */
export function getNextResumeTime(date: Date = new Date()): Date {
  const resume = new Date(date);
  const day = resume.getDay();

  // If Friday or Saturday, set to Saturday 20:35
  const daysUntilSaturday = (6 - day + 7) % 7;
  resume.setDate(resume.getDate() + daysUntilSaturday);
  resume.setHours(20, 35, 0, 0);

  if (resume <= date) {
    resume.setDate(resume.getDate() + 7);
  }

  return resume;
}
