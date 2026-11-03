// src/streakLogic.js
// -------------------------------------------------------------
// Pure streak rules. No Firebase imports here, so this file can be
// tested on its own.
//
// Stored data shape:
//   { streak: number, lastCompletedDate: "YYYY-MM-DD" | null }
//
// Dates are LOCAL calendar days (not UTC), so a quiz finished at
// 8 pm in Vancouver counts for that day, not the next one.
// -------------------------------------------------------------

// Returns today's (or the given date's) local day as "YYYY-MM-DD".
export function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Whole calendar days from fromStr to toStr (both "YYYY-MM-DD").
// Uses UTC midnights so daylight-saving changes can't shift the result.
export function daysBetween(fromStr, toStr) {
  const [fy, fm, fd] = fromStr.split("-").map(Number);
  const [ty, tm, td] = toStr.split("-").map(Number);
  return Math.round(
    (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000,
  );
}

// The streak number to DISPLAY. A stored streak only counts while it is
// still alive: last completion was today or yesterday. Otherwise it has
// been broken and we show 0 (the stored value is reset on next completion).
export function effectiveStreak(data, today = localDateString()) {
  if (!data || !data.lastCompletedDate) return 0;
  const gap = daysBetween(data.lastCompletedDate, today);
  return gap <= 1 ? (data.streak ?? 0) : 0;
}

// Applies "the user just finished a quiz today" to the stored data.
// Returns the new values plus `changed` (false if already done today).
export function applyCompletion(data, today = localDateString()) {
  const last = data?.lastCompletedDate ?? null;
  const current = data?.streak ?? 0;

  // Already completed today: nothing changes (no double counting).
  if (last === today) {
    return { streak: current, lastCompletedDate: today, changed: false };
  }

  // Completed yesterday: extend. Anything else (first time or a gap): start at 1.
  const streak = last && daysBetween(last, today) === 1 ? current + 1 : 1;
  return { streak, lastCompletedDate: today, changed: true };
}
