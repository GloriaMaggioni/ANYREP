import { useCallback, useEffect, useRef, useState } from 'react';
import { cues } from '../services/feedback';
import { Step } from '../utils/timerEngine';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'complete';

// Time is measured from timestamps rather than by counting interval ticks,
// so the clock stays accurate even if the JS thread is briefly busy.
export function useWorkoutTimer(steps: Step[]) {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [index, setIndex] = useState(0);
  // true only when every step ran (or was skipped) to the end, not on END.
  const [completedAll, setCompletedAll] = useState(false);
  const [, setTick] = useState(0);

  const stepStartedAt = useRef(0);
  const stepElapsedBeforePause = useRef(0);
  const workoutStartedAt = useRef(0);
  const workoutElapsedBeforePause = useRef(0);
  const lastWholeSecond = useRef<number | null>(null);

  const step = steps[index];
  const now = Date.now();
  const running = status === 'running';
  const stepElapsed = (stepElapsedBeforePause.current + (running ? now - stepStartedAt.current : 0)) / 1000;
  const workoutElapsed =
    (workoutElapsedBeforePause.current + (running ? now - workoutStartedAt.current : 0)) / 1000;
  const remaining = step?.seconds != null ? Math.max(0, step.seconds - stepElapsed) : null;

  const goTo = useCallback(
    (next: number) => {
      const from = steps[next - 1];
      const to = steps[next];
      stepElapsedBeforePause.current = 0;
      stepStartedAt.current = Date.now();
      lastWholeSecond.current = null;

      if (!to) {
        workoutElapsedBeforePause.current += Date.now() - workoutStartedAt.current;
        setCompletedAll(true);
        setStatus('complete');
        cues.complete();
        return;
      }
      if (from?.kind === 'countdown') cues.go();
      else if (to.kind === 'rest_round') cues.roundEnd();
      else if (from?.kind === 'work' || from?.kind === 'amrap') cues.workEnd();
      else if (from?.kind === 'rest_exercise' || from?.kind === 'rest_round') cues.restEnd();
      setIndex(next);
    },
    [steps],
  );

  // Drive re-renders and auto-advance timed steps.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const s = steps[index];
      if (s?.seconds != null) {
        const elapsed = (stepElapsedBeforePause.current + Date.now() - stepStartedAt.current) / 1000;
        const left = s.seconds - elapsed;
        if (s.kind === 'countdown') {
          const whole = Math.ceil(left);
          if (whole > 0 && whole !== lastWholeSecond.current) {
            lastWholeSecond.current = whole;
            cues.countdownTick();
          }
        }
        if (left <= 0) {
          goTo(index + 1);
          return;
        }
      }
      setTick((t) => t + 1);
    }, 100);
    return () => clearInterval(id);
  }, [running, index, steps, goTo]);

  const start = useCallback(() => {
    cues.unlock();
    setIndex(0);
    setCompletedAll(false);
    stepElapsedBeforePause.current = 0;
    workoutElapsedBeforePause.current = 0;
    lastWholeSecond.current = null;
    stepStartedAt.current = workoutStartedAt.current = Date.now();
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    const t = Date.now();
    stepElapsedBeforePause.current += t - stepStartedAt.current;
    workoutElapsedBeforePause.current += t - workoutStartedAt.current;
    setStatus('paused');
  }, [status]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    stepStartedAt.current = workoutStartedAt.current = Date.now();
    setStatus('running');
  }, [status]);

  // Ends the current step early: DONE during work, SKIP during rest.
  const next = useCallback(() => {
    if (status === 'paused') {
      stepStartedAt.current = workoutStartedAt.current = Date.now();
      setStatus('running');
    }
    goTo(index + 1);
  }, [goTo, index, status]);

  const finish = useCallback(() => {
    if (status === 'running') workoutElapsedBeforePause.current += Date.now() - workoutStartedAt.current;
    setStatus('complete');
  }, [status]);

  return {
    status,
    completedAll,
    index,
    step,
    remaining,
    stepElapsed,
    workoutElapsed,
    progress: step?.seconds ? Math.min(1, stepElapsed / step.seconds) : 0,
    start,
    pause,
    resume,
    next,
    finish,
  };
}
