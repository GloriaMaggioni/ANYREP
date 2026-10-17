import { HistoryEntry } from '../types';

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Consecutive days with at least one workout, counting back from today.
// A streak survives until the end of the day after the last workout.
export function computeStreak(history: HistoryEntry[], now = new Date()): number {
  const days = new Set(history.map((h) => dayKey(new Date(h.completed_at))));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function totals(history: HistoryEntry[]) {
  return history.reduce(
    (acc, h) => ({
      workouts: acc.workouts + 1,
      seconds: acc.seconds + h.duration_seconds,
      reps: acc.reps + h.total_reps,
    }),
    { workouts: 0, seconds: 0, reps: 0 },
  );
}

// Workouts per day for the last 7 days, oldest first.
export function lastSevenDays(history: HistoryEntry[], now = new Date()) {
  const result: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    result.push({
      label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      count: history.filter((h) => dayKey(new Date(h.completed_at)) === key).length,
    });
  }
  return result;
}
