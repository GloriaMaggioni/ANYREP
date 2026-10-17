import { LADDER } from '../config/options';
import { getExercise } from '../services/data';
import { Template } from '../types';

// A workout is flattened into a list of steps that the timer walks through:
// IDLE → COUNTDOWN → WORKING → REST_EXERCISE → WORKING → … → REST_ROUND → … → COMPLETE
export type Step =
  | { kind: 'countdown'; seconds: number }
  | {
      kind: 'work';
      // null = untimed: the user taps DONE when the set is finished.
      seconds: number | null;
      exerciseIndex: number;
      round: number;
      targetReps: number | null;
    }
  | { kind: 'rest_exercise'; seconds: number; round: number; nextExerciseIndex: number }
  | { kind: 'rest_round'; seconds: number; completedRound: number; nextExerciseIndex: number }
  | { kind: 'amrap'; seconds: number };

export const COUNTDOWN_SECONDS = 3;
const UNTIMED_ESTIMATE = 30;

export function buildSteps(t: Template): Step[] {
  const steps: Step[] = [{ kind: 'countdown', seconds: COUNTDOWN_SECONDS }];
  const items = t.exercise_list;
  if (items.length === 0) return steps;

  if (t.structure === 'amrap') {
    steps.push({ kind: 'amrap', seconds: Math.max(1, t.total_time_minutes) * 60 });
    return steps;
  }

  const rounds = Math.max(1, t.rounds);

  if (t.structure === 'emom') {
    // Every minute starts the next exercise; whatever is left of the minute is rest.
    for (let r = 1; r <= rounds; r++) {
      items.forEach((item, i) => {
        steps.push({ kind: 'work', seconds: 60, exerciseIndex: i, round: r, targetReps: item.reps });
      });
    }
    return steps;
  }

  if (t.structure === 'ladder') {
    for (let r = 1; r <= rounds; r++) {
      items.forEach((item, i) => {
        const rungs = item.ladder ?? LADDER;
        rungs.forEach((reps, k) => {
          steps.push({ kind: 'work', seconds: null, exerciseIndex: i, round: r, targetReps: reps });
          const lastRung = k === rungs.length - 1;
          const lastExercise = i === items.length - 1;
          if (lastRung && lastExercise) {
            if (r < rounds) pushRest(steps, 'rest_round', t.rest_round_seconds, r, 0);
          } else {
            pushRest(steps, 'rest_exercise', t.rest_exercise_seconds, r, lastRung ? i + 1 : i);
          }
        });
      });
    }
    return steps;
  }

  // rounds, tabata, custom
  const work = t.work_seconds > 0 ? t.work_seconds : null;
  for (let r = 1; r <= rounds; r++) {
    items.forEach((item, i) => {
      steps.push({ kind: 'work', seconds: work, exerciseIndex: i, round: r, targetReps: item.reps });
      if (i < items.length - 1) {
        pushRest(steps, 'rest_exercise', t.rest_exercise_seconds, r, i + 1);
      } else if (r < rounds) {
        pushRest(steps, 'rest_round', t.rest_round_seconds, r, 0);
      }
    });
  }
  return steps;
}

function pushRest(
  steps: Step[],
  kind: 'rest_exercise' | 'rest_round',
  seconds: number,
  round: number,
  nextExerciseIndex: number,
) {
  if (seconds <= 0) return;
  if (kind === 'rest_exercise') {
    steps.push({ kind, seconds, round, nextExerciseIndex });
  } else {
    steps.push({ kind, seconds, completedRound: round, nextExerciseIndex });
  }
}

export function estimateMinutes(t: Template): number {
  if (t.structure === 'amrap') return t.total_time_minutes;
  const seconds = buildSteps(t)
    .filter((s) => s.kind !== 'countdown')
    .reduce((sum, s) => sum + (s.seconds ?? UNTIMED_ESTIMATE), 0);
  return Math.max(1, Math.round(seconds / 60));
}

export function exerciseName(t: Template, index: number): string {
  const item = t.exercise_list[index];
  return (item && getExercise(item.exercise_id)?.name) ?? 'Exercise';
}
