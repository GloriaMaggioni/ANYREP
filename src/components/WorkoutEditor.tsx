import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { DIRECTIONS, LEVELS, LOCATIONS, STRUCTURE_HINTS, STRUCTURES } from '../config/options';
import { colors, radius, spacing, TOUCH, type } from '../config/theme';
import { useStore } from '../hooks/useStore';
import { getExercise } from '../services/data';
import { Template } from '../types';
import { formatTarget } from '../utils/format';
import { Button, Card, ChipGroup, EmptyState, IconButton, SectionTitle, Stepper, styles as ui } from './ui';

// Shared by "Edit Workout" and "Start from Scratch": both edit the store's draft.
export function WorkoutEditor({ draft }: { draft: Template }) {
  const updateDraft = useStore((s) => s.updateDraft);
  const removeExercise = useStore((s) => s.removeExercise);
  const moveExercise = useStore((s) => s.moveExercise);
  const updateExercise = useStore((s) => s.updateExercise);

  const s = draft.structure;
  const usesWork = s === 'rounds' || s === 'custom' || s === 'tabata';
  const usesRest = s !== 'emom' && s !== 'amrap';
  const usesRounds = s !== 'amrap';

  return (
    <View style={{ gap: spacing.md }}>
      <Card>
        <Text style={type.small}>Workout name</Text>
        <TextInput
          value={draft.name}
          onChangeText={(name) => updateDraft({ name })}
          placeholder="My Workout"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          maxLength={40}
        />
      </Card>

      <SectionTitle>Structure</SectionTitle>
      <ChipGroup options={STRUCTURES} selected={[s]} onToggle={(structure) => updateDraft({ structure })} />
      <Text style={type.small}>{STRUCTURE_HINTS[s]}</Text>

      <Card>
        {usesWork ? (
          <Stepper label="Work" value={draft.work_seconds} step={5} min={s === 'custom' ? 0 : 5} max={600} suffix="s" onChange={(work_seconds) => updateDraft({ work_seconds })} />
        ) : null}
        {usesRest ? (
          <Stepper label="Rest between exercises" value={draft.rest_exercise_seconds} step={5} max={300} suffix="s" onChange={(rest_exercise_seconds) => updateDraft({ rest_exercise_seconds })} />
        ) : null}
        {usesRest ? (
          <Stepper label="Rest between rounds" value={draft.rest_round_seconds} step={5} max={600} suffix="s" onChange={(rest_round_seconds) => updateDraft({ rest_round_seconds })} />
        ) : null}
        {usesRounds ? (
          <Stepper label="Rounds" value={draft.rounds} min={1} max={30} onChange={(rounds) => updateDraft({ rounds })} />
        ) : null}
        {s === 'amrap' ? (
          <Stepper label="Time cap" value={draft.total_time_minutes} min={1} max={90} suffix=" min" onChange={(total_time_minutes) => updateDraft({ total_time_minutes })} />
        ) : null}
        {s === 'custom' && draft.work_seconds === 0 ? (
          <Text style={type.small}>Work set to 0s: each set is untimed and ends when you tap DONE.</Text>
        ) : null}
        <Text style={[type.small, { color: colors.accentSecondary }]}>≈ {draft.total_time_minutes} min total</Text>
      </Card>

      <SectionTitle>Details</SectionTitle>
      <Text style={type.small}>Direction</Text>
      <ChipGroup options={DIRECTIONS} selected={[draft.direction]} onToggle={(direction) => updateDraft({ direction })} />
      <Text style={type.small}>Level</Text>
      <ChipGroup options={LEVELS} selected={draft.level === 'all' ? [] : [draft.level]} onToggle={(level) => updateDraft({ level })} />
      <Text style={type.small}>Location</Text>
      <ChipGroup options={LOCATIONS} selected={[draft.location]} onToggle={(location) => updateDraft({ location })} />

      <SectionTitle right={<Text style={type.small}>{draft.exercise_list.length} exercises</Text>}>Exercises</SectionTitle>
      {draft.exercise_list.length === 0 ? (
        <EmptyState icon="barbell-outline" title="No exercises yet" text="Add exercises from the library to build your workout." />
      ) : null}
      {draft.exercise_list.map((item, i) => {
        const ex = getExercise(item.exercise_id);
        const timed = item.duration != null;
        return (
          <Card key={`${item.exercise_id}-${i}`}>
            <View style={ui.row}>
              <Text style={[type.small, { width: 20 }]}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={type.body}>{ex?.name ?? 'Unknown exercise'}</Text>
                <Text style={type.small}>{formatTarget(item, ex)}</Text>
              </View>
              <IconButton icon="arrow-up" label="Move up" size={18} disabled={i === 0} onPress={() => moveExercise(i, -1)} />
              <IconButton icon="arrow-down" label="Move down" size={18} disabled={i === draft.exercise_list.length - 1} onPress={() => moveExercise(i, 1)} />
              <IconButton icon="trash-outline" label="Remove" size={18} color={colors.danger} onPress={() => removeExercise(i)} />
            </View>
            {!item.ladder ? (
              timed ? (
                <Stepper label="Hold" value={item.duration ?? 0} step={5} min={5} max={300} suffix="s" onChange={(duration) => updateExercise(i, { duration })} />
              ) : (
                <Stepper label="Target reps" value={item.reps ?? 0} min={1} max={100} onChange={(reps) => updateExercise(i, { reps })} />
              )
            ) : null}
            <Button title="Swap" icon="swap-horizontal" variant="ghost" onPress={() => router.push({ pathname: '/workout/library', params: { mode: 'swap', index: String(i) } })} />
          </Card>
        );
      })}
      <Button title="Add exercise" icon="add" variant="secondary" onPress={() => router.push({ pathname: '/workout/library', params: { mode: 'add' } })} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    ...type.h3,
    minHeight: TOUCH,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card / 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgSecondary,
  },
});
