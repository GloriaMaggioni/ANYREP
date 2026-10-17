import { router } from 'expo-router';
import { Text } from 'react-native';
import { Button, EmptyState, Header, Screen } from '../../src/components/ui';
import { WorkoutEditor } from '../../src/components/WorkoutEditor';
import { colors, type } from '../../src/config/theme';
import { useStore } from '../../src/hooks/useStore';

export default function EditWorkout() {
  const draft = useStore((s) => s.draft);
  const saveWorkout = useStore((s) => s.saveWorkout);

  if (!draft) {
    return (
      <Screen>
        <Header title="Edit Workout" />
        <EmptyState icon="create-outline" title="Nothing to edit" text="Open a workout and tap Edit." />
      </Screen>
    );
  }

  const empty = draft.exercise_list.length === 0;
  const save = () => {
    const id = saveWorkout(draft);
    router.dismissTo(`/workout/${id}`);
  };

  return (
    <Screen
      footer={
        <>
          <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
          <Button title={draft.is_premade ? 'Save as mine' : 'Save'} icon="bookmark" style={{ flex: 1 }} disabled={empty} onPress={save} />
        </>
      }
    >
      <Header title="Edit Workout" />
      {draft.is_premade ? (
        <Text style={[type.small, { color: colors.accentSecondary }]}>
          Premade workouts stay unchanged — saving creates your own copy in My Workouts.
        </Text>
      ) : null}
      <WorkoutEditor draft={draft} />
    </Screen>
  );
}
