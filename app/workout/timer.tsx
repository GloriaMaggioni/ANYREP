import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimerCircle } from '../../src/components/TimerCircle';
import { Button, Card, EmptyState, IconButton, Screen, styles as ui } from '../../src/components/ui';
import { colors, MAX_WIDTH, spacing, type } from '../../src/config/theme';
import { useStore, useTemplate } from '../../src/hooks/useStore';
import { useWorkoutTimer } from '../../src/hooks/useWorkoutTimer';
import { getExercise } from '../../src/services/data';
import { cues } from '../../src/services/feedback';
import { Template } from '../../src/types';
import { formatClock, formatDuration, formatTarget } from '../../src/utils/format';
import { buildSteps, exerciseName, Step } from '../../src/utils/timerEngine';

export default function TimerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = useTemplate(id);
  if (!workout || workout.exercise_list.length === 0) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Workout not found" text="Go back and pick a workout." action={<Button title="Home" onPress={() => router.replace('/')} />} />
      </Screen>
    );
  }
  return <LiveWorkout key={workout.id} workout={workout} />;
}

function confirmEnd(onYes: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm('End this workout now? Your progress so far will be saved.')) onYes();
  } else {
    Alert.alert('End workout?', 'Your progress so far will be saved.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: onYes },
    ]);
  }
}

function LiveWorkout({ workout }: { workout: Template }) {
  const steps = useMemo(() => buildSteps(workout), [workout]);
  const timer = useWorkoutTimer(steps);
  const { status, step, index } = timer;
  const addHistory = useStore((s) => s.addHistory);

  // Reps tapped per step index (+1 REP), and AMRAP progress.
  const [reps, setReps] = useState<Record<number, number>>({});
  const [amrapExercise, setAmrapExercise] = useState(0);
  const [amrapRounds, setAmrapRounds] = useState(0);
  const recorded = useRef(false);

  const n = workout.exercise_list.length;
  const isAmrap = workout.structure === 'amrap';
  const totalRounds = isAmrap ? null : Math.max(1, workout.rounds);

  const addRep = () => {
    cues.tap();
    setReps((r) => ({ ...r, [index]: (r[index] ?? 0) + 1 }));
  };

  // DONE on a set: credit the target reps if the user didn't count manually.
  const done = () => {
    if (step?.kind === 'work' && !reps[index] && step.targetReps) {
      setReps((r) => ({ ...r, [index]: step.targetReps ?? 0 }));
    }
    timer.next();
  };

  const amrapNext = () => {
    const item = workout.exercise_list[amrapExercise];
    setReps((r) => ({ ...r, [-1 - amrapRounds * n - amrapExercise]: item.reps ?? 0 }));
    if (amrapExercise === n - 1) {
      setAmrapRounds((r) => r + 1);
      cues.roundEnd();
    } else {
      cues.tap();
    }
    setAmrapExercise((i) => (i + 1) % n);
  };

  const finishedNaturally = timer.completedAll;
  const doneUpTo = finishedNaturally ? steps.length : index;
  const summary = useMemo(() => summarize(workout, steps, doneUpTo, reps, isAmrap ? amrapRounds : null), [workout, steps, doneUpTo, reps, isAmrap, amrapRounds]);

  // Save to history once, when the workout ends with at least one set done.
  useEffect(() => {
    if (status !== 'complete' || recorded.current) return;
    recorded.current = true;
    if (summary.exercises.length === 0 && summary.totalReps === 0) return;
    addHistory({
      template_id: workout.id,
      template_name: workout.name,
      duration_seconds: Math.round(timer.workoutElapsed),
      rounds_completed: summary.rounds,
      total_reps: summary.totalReps,
      exercises_done: summary.exercises,
    });
  }, [status, summary, workout, timer.workoutElapsed, addHistory]);

  // Keyboard shortcuts on PC: Space = start/pause/resume, → = done/skip.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'idle') timer.start();
        else if (status === 'running') timer.pause();
        else if (status === 'paused') timer.resume();
      } else if (e.code === 'ArrowRight' && status !== 'idle' && status !== 'complete') {
        if (step?.kind === 'amrap') amrapNext();
        else done();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (status === 'complete') {
    return <Complete workout={workout} summary={summary} seconds={timer.workoutElapsed} finished={finishedNaturally} />;
  }

  const end = () => (index === 0 && status === 'idle' ? router.back() : confirmEnd(timer.finish));
  const isRest = step?.kind === 'rest_exercise' || step?.kind === 'rest_round';

  return (
    <SafeAreaView style={[ui.screen, { alignItems: 'center' }]}>
      <View style={styles.container}>
        <View style={ui.row}>
          <IconButton icon="close" label="End workout" onPress={end} />
          <Text style={[type.h3, { flex: 1, textAlign: 'center' }]} numberOfLines={1}>
            {workout.name}
          </Text>
          <Text style={[type.small, { minWidth: 44, textAlign: 'right' }]}>{formatClock(timer.workoutElapsed)}</Text>
        </View>
        <ProgressBar value={steps.length > 1 ? index / (steps.length - 1) : 0} />

        <View style={styles.center}>
          {status === 'idle' ? (
            <Idle workout={workout} />
          ) : step ? (
            <StepView
              workout={workout}
              step={step}
              steps={steps}
              index={index}
              remaining={timer.remaining}
              elapsed={timer.stepElapsed}
              progress={timer.progress}
              reps={reps[index] ?? 0}
              totalRounds={totalRounds}
              amrapExercise={amrapExercise}
              amrapRounds={amrapRounds}
            />
          ) : null}
          {status === 'paused' ? <Text style={[type.h3, { color: colors.warning }]}>PAUSED</Text> : null}
        </View>

        <View style={{ gap: spacing.sm }}>
          {status === 'idle' ? (
            <Button title="Start" icon="play" onPress={timer.start} />
          ) : step?.kind === 'work' ? (
            <View style={ui.row}>
              <Button title="+1 Rep" variant="secondary" onPress={addRep} style={{ flex: 1 }} />
              <Button title="Done" icon="checkmark" onPress={done} style={{ flex: 1 }} />
            </View>
          ) : step?.kind === 'amrap' ? (
            <Button title={`Done · next exercise`} icon="checkmark" onPress={amrapNext} />
          ) : isRest ? (
            <Button title="Skip rest" icon="play-skip-forward" variant="secondary" onPress={timer.next} />
          ) : null}
          {status === 'running' || status === 'paused' ? (
            <View style={ui.row}>
              <Button
                title={status === 'paused' ? 'Resume' : 'Pause'}
                icon={status === 'paused' ? 'play' : 'pause'}
                variant="ghost"
                onPress={status === 'paused' ? timer.resume : timer.pause}
                style={{ flex: 1 }}
              />
              <Button title="End" icon="stop" variant="ghost" onPress={end} style={{ flex: 1 }} />
            </View>
          ) : null}
          {Platform.OS === 'web' ? (
            <Text style={[type.small, { textAlign: 'center', color: colors.textMuted }]}>Space: start / pause · →: done / skip</Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

function Idle({ workout }: { workout: Template }) {
  return (
    <>
      <Ionicons name="barbell-outline" size={56} color={colors.accent} />
      <Text style={type.h1}>Ready?</Text>
      <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center' }]}>
        {workout.exercise_list.length} exercises · ≈ {workout.total_time_minutes} min
      </Text>
      <Text style={[type.small, { textAlign: 'center' }]}>First up: {exerciseName(workout, 0)}</Text>
    </>
  );
}

function StepView(p: {
  workout: Template;
  step: Step;
  steps: Step[];
  index: number;
  remaining: number | null;
  elapsed: number;
  progress: number;
  reps: number;
  totalRounds: number | null;
  amrapExercise: number;
  amrapRounds: number;
}) {
  const { workout, step } = p;

  if (step.kind === 'countdown') {
    return (
      <>
        <Text style={type.h3}>Get ready</Text>
        <TimerCircle progress={p.progress}>
          <Text style={type.timer}>{Math.ceil(p.remaining ?? 0) || 'GO'}</Text>
        </TimerCircle>
        <Text style={type.small}>First up: {exerciseName(workout, 0)}</Text>
      </>
    );
  }

  if (step.kind === 'amrap') {
    const item = workout.exercise_list[p.amrapExercise];
    return (
      <>
        <Text style={[type.small, { color: colors.accentSecondary }]}>AMRAP · Round {p.amrapRounds + 1}</Text>
        <Text style={[type.h1, { textAlign: 'center' }]}>{exerciseName(workout, p.amrapExercise)}</Text>
        <Text style={type.h3}>{formatTarget(item, getExercise(item.exercise_id))}</Text>
        <TimerCircle progress={p.progress}>
          <Text style={type.timer}>{formatClock(p.remaining ?? 0)}</Text>
          <Text style={type.small}>left</Text>
        </TimerCircle>
        <Text style={type.small}>{p.amrapRounds} rounds completed</Text>
      </>
    );
  }

  if (step.kind === 'work') {
    const item = workout.exercise_list[step.exerciseIndex];
    const ex = getExercise(item.exercise_id);
    const target = step.targetReps != null ? `${step.targetReps} reps${ex?.per_side ? ' / side' : ''}` : formatTarget(item, ex);
    return (
      <>
        <Text style={[type.small, { color: colors.accentSecondary }]}>
          Round {step.round}
          {p.totalRounds ? `/${p.totalRounds}` : ''} · Exercise {step.exerciseIndex + 1}/{workout.exercise_list.length}
        </Text>
        <Text style={[type.h1, { textAlign: 'center' }]}>{ex?.name}</Text>
        <Text style={type.h3}>{target}</Text>
        <TimerCircle progress={step.seconds ? p.progress : 0}>
          <Text style={type.timer}>{step.seconds ? Math.ceil(p.remaining ?? 0) : formatClock(p.elapsed)}</Text>
          <Text style={type.small}>{step.seconds ? 'seconds' : 'tap DONE when finished'}</Text>
        </TimerCircle>
        <Text style={type.h3}>
          {p.reps} <Text style={type.small}>reps counted</Text>
        </Text>
      </>
    );
  }

  // Rest between exercises / rounds
  const nextIdx = step.nextExerciseIndex;
  const nextWork = p.steps.slice(p.index + 1).find((s) => s.kind === 'work');
  const nextItem = workout.exercise_list[nextIdx];
  const nextTarget =
    nextWork?.kind === 'work' && nextWork.targetReps != null ? `${nextWork.targetReps} reps` : formatTarget(nextItem, getExercise(nextItem.exercise_id));
  return (
    <>
      <Text style={[type.h2, { color: colors.accentSecondary }]}>
        {step.kind === 'rest_round' ? `Round ${step.completedRound} complete!` : 'Rest'}
      </Text>
      <TimerCircle progress={p.progress} rest>
        <Text style={type.timer}>{Math.ceil(p.remaining ?? 0)}</Text>
        <Text style={type.small}>seconds</Text>
      </TimerCircle>
      <Card style={{ alignSelf: 'stretch', alignItems: 'center' }}>
        <Text style={type.small}>Next up</Text>
        <Text style={type.h3}>{exerciseName(workout, nextIdx)}</Text>
        <Text style={type.small}>{nextTarget}</Text>
      </Card>
    </>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.border, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(value * 100)}%`, height: '100%', backgroundColor: colors.accent }} />
    </View>
  );
}

interface Summary {
  rounds: number;
  totalReps: number;
  exercises: string[];
}

function summarize(t: Template, steps: Step[], doneUpTo: number, reps: Record<number, number>, amrapRounds: number | null): Summary {
  const totalReps = Object.values(reps).reduce((a, b) => a + b, 0);

  if (amrapRounds != null) {
    const names = t.exercise_list.map((i) => getExercise(i.exercise_id)?.name ?? '');
    const touched = Object.keys(reps).length;
    return { rounds: amrapRounds, totalReps, exercises: names.slice(0, Math.min(names.length, touched)) };
  }

  const done = steps.slice(0, doneUpTo).filter((s): s is Extract<Step, { kind: 'work' }> => s.kind === 'work');
  const lastOfRound = new Map<number, number>();
  steps.forEach((s, i) => s.kind === 'work' && lastOfRound.set(s.round, i));
  const rounds = [...lastOfRound.values()].filter((i) => i < doneUpTo).length;
  const exercises = [...new Set(done.map((s) => getExercise(t.exercise_list[s.exerciseIndex].exercise_id)?.name ?? ''))];
  return { rounds, totalReps, exercises };
}

function Complete({ workout, summary, seconds, finished }: { workout: Template; summary: Summary; seconds: number; finished: boolean }) {
  const saveWorkout = useStore((s) => s.saveWorkout);
  const [savedId, setSavedId] = useState<string | null>(workout.is_premade ? null : workout.id);
  const [shareNote, setShareNote] = useState('');

  const share = async () => {
    const message = `I just finished "${workout.name}" on WORKOUT 💪 ${formatDuration(seconds)}, ${summary.rounds} rounds, ${summary.totalReps} reps.`;
    try {
      if (Platform.OS === 'web' && !navigator.share) {
        await navigator.clipboard.writeText(message);
        setShareNote('Copied to clipboard');
      } else {
        await Share.share({ message });
      }
    } catch {
      setShareNote('Sharing is not available here');
    }
  };

  return (
    <Screen
      footer={
        <>
          <Button title="Repeat" icon="refresh" variant="secondary" style={{ flex: 1 }} onPress={() => router.replace({ pathname: '/workout/timer', params: { id: workout.id } })} />
          <Button title="Done" style={{ flex: 1 }} onPress={() => router.dismissAll()} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xxl }}>
        <Ionicons name={finished ? 'trophy' : 'flag'} size={64} color={finished ? colors.warning : colors.accent} />
        <Text style={type.h1}>{finished ? 'Workout complete!' : 'Workout ended'}</Text>
        <Text style={[type.body, { color: colors.textSecondary }]}>{workout.name}</Text>
      </View>

      <View style={ui.row}>
        <Stat label="Time" value={formatDuration(seconds)} />
        <Stat label="Rounds" value={String(summary.rounds)} />
        <Stat label="Reps" value={String(summary.totalReps)} />
      </View>

      <Card>
        <Text style={type.h3}>Exercises done</Text>
        {summary.exercises.length ? (
          summary.exercises.map((name) => (
            <View key={name} style={ui.row}>
              <Ionicons name="checkmark-circle" size={18} color={colors.accentSecondary} />
              <Text style={type.body}>{name}</Text>
            </View>
          ))
        ) : (
          <Text style={type.small}>No sets completed — not saved to history.</Text>
        )}
      </Card>

      <View style={ui.row}>
        <Button
          title={savedId ? 'Saved' : 'Save workout'}
          icon={savedId ? 'bookmark' : 'bookmark-outline'}
          variant="ghost"
          disabled={!!savedId}
          style={{ flex: 1 }}
          onPress={() => setSavedId(saveWorkout(workout))}
        />
        <Button title="Share" icon="share-outline" variant="ghost" style={{ flex: 1 }} onPress={share} />
      </View>
      {shareNote ? <Text style={[type.small, { textAlign: 'center' }]}>{shareNote}</Text> : null}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center' }}>
      <Text style={type.h2}>{value}</Text>
      <Text style={type.small}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: MAX_WIDTH, padding: spacing.md, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
});
