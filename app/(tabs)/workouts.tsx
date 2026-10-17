import { router } from 'expo-router';
import { Text } from 'react-native';
import { Button, EmptyState, Screen } from '../../src/components/ui';
import { WorkoutCard } from '../../src/components/WorkoutCard';
import { spacing, type } from '../../src/config/theme';
import { useStore } from '../../src/hooks/useStore';

export default function SavedWorkouts() {
  const saved = useStore((s) => s.savedWorkouts);
  const sorted = [...saved].sort((a, b) => (b.last_used_at ?? b.created_at).localeCompare(a.last_used_at ?? a.created_at));

  return (
    <Screen>
      <Text style={[type.h1, { paddingTop: spacing.lg }]}>My Workouts</Text>
      <Text style={type.small}>Workouts you created or customized. Most recently used first.</Text>
      {sorted.map((t) => (
        <WorkoutCard key={t.id} workout={t} onPress={() => router.push(`/workout/${t.id}`)} />
      ))}
      {sorted.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title="Nothing saved yet"
          text="Edit any workout and save it, or build one from scratch."
          action={<Button title="Create workout" icon="add" onPress={() => router.push('/create')} />}
        />
      ) : null}
    </Screen>
  );
}
