export type Level = 'beginner' | 'intermediate' | 'advanced';
export type TemplateLevel = Level | 'all';
export type Location = 'home' | 'gym' | 'anywhere';
export type Direction =
  | 'upper'
  | 'lower'
  | 'push'
  | 'pull'
  | 'legs'
  | 'core'
  | 'full_body'
  | 'mix';
export type Equipment =
  | 'none'
  | 'chair'
  | 'wall'
  | 'bar'
  | 'dumbbells'
  | 'band'
  | 'machine'
  | 'table'
  | 'towel';
export type Structure = 'rounds' | 'tabata' | 'emom' | 'amrap' | 'ladder' | 'custom';

export interface Exercise {
  id: string;
  slug: string;
  name: string;
  muscle_group: string[];
  equipment: Equipment[];
  level: Level;
  location: Location[];
  direction: Direction[];
  description: string;
  gif_url: string | null;
  video_url: string | null;
  reps_default: number | null;
  duration_default: number | null;
  per_side: boolean;
  created_at: string;
}

export interface TemplateExercise {
  exercise_id: string;
  order: number;
  reps: number | null;
  duration: number | null;
  ladder?: number[];
}

export interface Template {
  id: string;
  slug?: string;
  name: string;
  direction: Direction;
  structure: Structure;
  level: TemplateLevel;
  location: Location;
  equipment: Equipment[];
  is_premade: boolean;
  created_by: string | null;
  rounds: number;
  work_seconds: number;
  rest_exercise_seconds: number;
  rest_round_seconds: number;
  total_time_minutes: number;
  exercise_list: TemplateExercise[];
  created_at: string;
  last_used_at?: string;
}

export interface User {
  id: string;
  email: string | null;
  display_name: string;
  is_guest: boolean;
  level: Level;
  preferred_location: Location;
  created_at: string;
}

export interface HistoryEntry {
  id: string;
  user_id: string;
  template_id: string;
  template_name: string;
  duration_seconds: number;
  rounds_completed: number;
  total_reps: number;
  exercises_done: string[];
  completed_at: string;
}

export interface Filters {
  direction: Direction[];
  equipment: Equipment[];
  level: Level[];
  location: Location[];
}
