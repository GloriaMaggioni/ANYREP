import { Exercise, TemplateExercise } from '../types';

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  if (m === 0) return `${s}s`;
  return s ? `${m}m ${s}s` : `${m}m`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

// "12 reps", "12 reps / side", "30s", "Ladder 1→5→1"
export function formatTarget(item: TemplateExercise, exercise?: Exercise): string {
  const side = exercise?.per_side ? ' / side' : '';
  if (item.ladder) return `Ladder ${item.ladder.join('-')}`;
  if (item.duration) return `${item.duration}s${side}`;
  if (item.reps) return `${item.reps} reps${side}`;
  return '—';
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
