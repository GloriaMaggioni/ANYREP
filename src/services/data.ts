// Read-only catalog: the same JSON that gets seeded into Firestore.
// Bundling it means exercises and templates work offline from the first launch.
import exercisesJson from '../../seed/exercises.json';
import templatesJson from '../../seed/templates.json';
import { Exercise, Template } from '../types';

export const EXERCISES = exercisesJson as Exercise[];
export const PREMADE_TEMPLATES = templatesJson as Template[];

const exerciseById = new Map(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id: string): Exercise | undefined {
  return exerciseById.get(id);
}
