import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Text } from 'react-native';
import { Button, Screen } from '../../src/components/ui';
import { WorkoutEditor } from '../../src/components/WorkoutEditor';
import { spacing, type } from '../../src/config/theme';
import { useStore } from '../../src/hooks/useStore';

// Start from Scratch: a blank workout builder.
export default function Create() {
  const draft = useStore((s) => s.draft);
  const startDraftFrom = useStore((s) => s.startDraftFrom);
  const saveWorkout = useStore((s) => s.saveWorkout);

  // Coming back to this tab starts a blank workout unless one is in progress
  // (e.g. returning from the exercise library).
  useFocusEffect(
    useCallback(() => {
      const current = useStore.getState().draft;
      if (!current || current.id) startDraftFrom(null);
    }, [startDraftFrom]),
  );

  if (!draft || draft.id) return null;
  const empty = draft.exercise_list.length === 0;

  return (
    <Screen
      footer={
        <>
          <Button title="Reset" variant="ghost" onPress={() => startDraftFrom(null)} />
          <Button
            title="Save"
            icon="bookmark"
            disabled={empty}
            style={{ flex: 1 }}
            onPress={() => {
              const id = saveWorkout(draft);
              startDraftFrom(null);
              router.push(`/workout/${id}`);
            }}
          />
        </>
      }
    >
      <Text style={[type.h1, { paddingTop: spacing.lg }]}>Start from Scratch</Text>
      <WorkoutEditor draft={draft} />
    </Screen>
  );
}
