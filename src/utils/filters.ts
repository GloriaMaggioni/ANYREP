import { Direction, Exercise, Filters, Template } from '../types';

export const EMPTY_FILTERS: Filters = { direction: [], equipment: [], level: [], location: [] };

// "Upper" and "Lower" are umbrella directions: an upper-body search also
// finds push and pull days, a lower-body search also finds leg days.
const DIRECTION_ALIASES: Partial<Record<Direction, Direction[]>> = {
  upper: ['upper', 'push', 'pull'],
  lower: ['lower', 'legs'],
};

function expandDirections(selected: Direction[]): Set<Direction> {
  return new Set(selected.flatMap((d) => DIRECTION_ALIASES[d] ?? [d]));
}

export function countActiveFilters(f: Filters): number {
  return f.direction.length + f.equipment.length + f.level.length + f.location.length;
}

// AND between categories; an empty category means "Any" and does not filter.
export function matchesTemplate(t: Template, f: Filters): boolean {
  if (f.direction.length && !expandDirections(f.direction).has(t.direction)) return false;

  // Equipment is OR: every piece of gear the workout needs must be something
  // the user ticked, so "None + Chair" shows no-gear and chair workouts.
  if (f.equipment.length && !t.equipment.every((e) => f.equipment.includes(e))) return false;

  if (f.level.length && t.level !== 'all' && !f.level.includes(t.level)) return false;

  if (f.location.length && t.location !== 'anywhere' && !f.location.includes(t.location)) {
    return false;
  }
  return true;
}

export function matchesExercise(e: Exercise, f: Filters, search = ''): boolean {
  if (search && !e.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
  if (f.direction.length) {
    const wanted = expandDirections(f.direction);
    if (!e.direction.some((d) => wanted.has(d))) return false;
  }
  if (f.equipment.length && !e.equipment.every((eq) => f.equipment.includes(eq))) return false;
  if (f.level.length && !f.level.includes(e.level)) return false;
  if (f.location.length && !e.location.some((l) => f.location.includes(l))) return false;
  return true;
}

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
