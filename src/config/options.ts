import { Direction, Equipment, Level, Location, Structure } from '../types';

export interface Option<T> {
  value: T;
  label: string;
}

export const DIRECTIONS: Option<Direction>[] = [
  { value: 'upper', label: 'Upper' },
  { value: 'lower', label: 'Lower' },
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'legs', label: 'Legs' },
  { value: 'core', label: 'Core' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'mix', label: 'Mix' },
];

export const EQUIPMENT: Option<Equipment>[] = [
  { value: 'none', label: 'None' },
  { value: 'chair', label: 'Chair' },
  { value: 'wall', label: 'Wall' },
  { value: 'bar', label: 'Bar' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'band', label: 'Band' },
  { value: 'machine', label: 'Machine' },
  { value: 'table', label: 'Table' },
  { value: 'towel', label: 'Towel' },
];

export const LEVELS: Option<Level>[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const LOCATIONS: Option<Location>[] = [
  { value: 'home', label: 'Home' },
  { value: 'gym', label: 'Gym' },
  { value: 'anywhere', label: 'Anywhere' },
];

export const STRUCTURES: Option<Structure>[] = [
  { value: 'rounds', label: 'Rounds' },
  { value: 'tabata', label: 'Tabata' },
  { value: 'emom', label: 'EMOM' },
  { value: 'amrap', label: 'AMRAP' },
  { value: 'ladder', label: 'Ladder' },
  { value: 'custom', label: 'Custom' },
];

export const STRUCTURE_HINTS: Record<Structure, string> = {
  rounds: 'X exercises × Y rounds, rest between each',
  tabata: '20s work / 10s rest × 8 cycles',
  emom: 'One exercise every minute, on the minute',
  amrap: 'As many rounds as possible in the time limit',
  ladder: 'Reps go 1-2-3-4-5 up, then back down',
  custom: 'You define work, rest and rounds',
};

export const DEFAULT_TIMER = {
  work_seconds: 45,
  rest_exercise_seconds: 15,
  rest_round_seconds: 60,
  rounds: 4,
};

export const LADDER = [1, 2, 3, 4, 5, 4, 3, 2, 1];

export function labelOf<T>(options: Option<T>[], value: T): string {
  return options.find((o) => o.value === value)?.label ?? String(value);
}
