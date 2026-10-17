import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { Button, Card, EmptyState, Header, IconButton, Screen, SectionTitle, styles as ui, Tag } from '../../src/components/ui';
import { DIRECTIONS, EQUIPMENT, labelOf, STRUCTURE_HINTS, STRUCTURES } from '../../src/config/options';
import { colors, type } from '../../src/config/theme';
import { useStore, useTemplate } from '../../src/hooks/useStore';
import { getExercise } from '../../src/services/data';
import { capitalize, formatTarget } from '../../src/utils/format';

export default function WorkoutPreview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = useTemplate(id);
  const startDraftFrom = useStore((s) => s.startDraftFrom);
  const deleteWorkout = useStore((s) => s.deleteWorkout);
  const [open, setOpen] = useState<number | null>(null);

  if (!workout) {
    return (
      <Screen>
        <Header />
        <EmptyState icon="alert-circle-outline" title="Workout not found" text="It may have been deleted." />
      </Screen>
    );
  }

  const remove = () => {
    const doIt = () => {
      deleteWorkout(workout.id);
      router.replace('/workouts');
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${workout.name}"?`)) doIt();
    } else {
      Alert.alert('Delete workout?', workout.name, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: doIt }]);
    }
  };

  const s = workout.structure;
  const timing =
    s === 'amrap'
      ? `${workout.total_time_minutes} min time cap`
      : s === 'emom'
        ? `${workout.rounds} rounds · 1 exercise per minute`
        : s === 'ladder'
          ? `${workout.rounds} round · ${workout.rest_exercise_seconds}s rest between sets`
          : `${workout.rounds} rounds · ${workout.work_seconds || 'untimed'}${workout.work_seconds ? 's' : ''} work · ${workout.rest_exercise_seconds}s rest · ${workout.rest_round_seconds}s between rounds`;

  return (
    <Screen
      footer={
        <>
          <Button
            title="Edit"
            icon="create-outline"
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => {
              startDraftFrom(workout);
              router.push('/workout/edit');
            }}
          />
          <Button
            title="Start"
            icon="play"
            style={{ flex: 1 }}
            disabled={workout.exercise_list.length === 0}
            onPress={() => router.push({ pathname: '/workout/timer', params: { id: workout.id } })}
          />
        </>
      }
    >
      <Header
        title={workout.is_premade ? 'Workout' : 'My Workout'}
        right={!workout.is_premade ? <IconButton icon="trash-outline" label="Delete workout" color={colors.danger} onPress={remove} /> : null}
      />
      <Text style={type.h1}>{workout.name}</Text>
      <View style={ui.wrap}>
        <Tag label={labelOf(DIRECTIONS, workout.direction)} color={colors.accent} />
        <Tag label={labelOf(STRUCTURES, s)} color={colors.accent} />
        <Tag label={capitalize(workout.level)} color={colors.accentSecondary} />
        <Tag label={capitalize(workout.location)} />
        {workout.equipment.map((e) => (
          <Tag key={e} label={labelOf(EQUIPMENT, e)} />
        ))}
      </View>

      <Card>
        <Text style={type.h3}>≈ {workout.total_time_minutes} min</Text>
        <Text style={type.small}>{timing}</Text>
        <Text style={[type.small, { color: colors.textMuted }]}>{STRUCTURE_HINTS[s]}</Text>
      </Card>

      <SectionTitle right={<Text style={type.small}>{workout.exercise_list.length} exercises</Text>}>Exercises</SectionTitle>
      {workout.exercise_list.map((item, i) => {
        const ex = getExercise(item.exercise_id);
        return (
          <Pressable key={`${item.exercise_id}-${i}`} onPress={() => setOpen(open === i ? null : i)} accessibilityRole="button">
            <Card>
              <View style={ui.row}>
                <Text style={[type.small, { width: 20 }]}>{i + 1}</Text>
                <Text style={[type.body, { flex: 1 }]}>{ex?.name}</Text>
                <Text style={[type.small, { color: colors.accentSecondary }]}>{formatTarget(item, ex)}</Text>
              </View>
              {open === i && ex ? (
                <>
                  <Text style={type.small}>{ex.description}</Text>
                  <Text style={[type.small, { color: colors.textMuted }]}>Muscles: {ex.muscle_group.map(capitalize).join(', ')}</Text>
                </>
              ) : null}
            </Card>
          </Pressable>
        );
      })}
    </Screen>
  );
}
