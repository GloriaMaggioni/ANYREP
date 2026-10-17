import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Button, Card, ChipGroup, EmptyState, Header, Screen, styles as ui, Tag } from '../../src/components/ui';
import { DIRECTIONS, EQUIPMENT, labelOf, LEVELS } from '../../src/config/options';
import { colors, radius, spacing, TOUCH, type } from '../../src/config/theme';
import { useStore } from '../../src/hooks/useStore';
import { EXERCISES, getExercise } from '../../src/services/data';
import { Exercise, Filters } from '../../src/types';
import { capitalize } from '../../src/utils/format';
import { EMPTY_FILTERS, matchesExercise, toggle } from '../../src/utils/filters';

function target(e: Exercise) {
  const side = e.per_side ? ' / side' : '';
  return e.duration_default ? `${e.duration_default}s${side}` : `${e.reps_default} reps${side}`;
}

export default function ExerciseLibrary() {
  const { mode, index } = useLocalSearchParams<{ mode?: 'add' | 'swap'; index?: string }>();
  const draft = useStore((s) => s.draft);
  const addExercise = useStore((s) => s.addExercise);
  const swapExercise = useStore((s) => s.swapExercise);

  const swapIndex = mode === 'swap' ? Number(index) : null;
  const replacing = swapIndex != null && draft ? getExercise(draft.exercise_list[swapIndex]?.exercise_id ?? '') : undefined;

  // When swapping, start with the same direction as the exercise being replaced.
  const [filters, setFilters] = useState<Filters>(() =>
    replacing ? { ...EMPTY_FILTERS, direction: [replacing.direction[0]] } : EMPTY_FILTERS,
  );
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [addedCount, setAddedCount] = useState(0);

  const results = useMemo(() => EXERCISES.filter((e) => matchesExercise(e, filters, search)), [filters, search]);
  const canPick = !!draft && !!mode;

  const pick = (e: Exercise) => {
    if (swapIndex != null) {
      swapExercise(swapIndex, e);
      router.back();
    } else {
      addExercise(e);
      setAddedCount((c) => c + 1);
    }
  };

  return (
    <Screen
      footer={
        mode === 'add' ? (
          <Button title={addedCount ? `Done · ${addedCount} added` : 'Done'} style={{ flex: 1 }} onPress={() => router.back()} />
        ) : undefined
      }
    >
      <Header title={swapIndex != null ? 'Swap Exercise' : 'Exercise Library'} />
      {replacing ? <Text style={type.small}>Replacing: {replacing.name}</Text> : null}

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search exercises"
        placeholderTextColor={colors.textMuted}
        style={{ ...type.body, minHeight: TOUCH, borderWidth: 1, borderColor: colors.border, borderRadius: radius.chip, paddingHorizontal: spacing.md, backgroundColor: colors.bgSecondary }}
      />
      <ChipGroup options={DIRECTIONS} selected={filters.direction} anyLabel="All" onAny={() => setFilters({ ...filters, direction: [] })} onToggle={(v) => setFilters({ ...filters, direction: toggle(filters.direction, v) })} />
      <ChipGroup options={EQUIPMENT} selected={filters.equipment} anyLabel="Any gear" onAny={() => setFilters({ ...filters, equipment: [] })} onToggle={(v) => setFilters({ ...filters, equipment: toggle(filters.equipment, v) })} />
      <ChipGroup options={LEVELS} selected={filters.level} anyLabel="Any level" onAny={() => setFilters({ ...filters, level: [] })} onToggle={(v) => setFilters({ ...filters, level: toggle(filters.level, v) })} />
      <Text style={type.small}>{results.length} exercises</Text>

      {results.map((e) => (
        <Card key={e.id}>
          <View style={ui.row}>
            <Pressable style={{ flex: 1, minHeight: TOUCH, justifyContent: 'center' }} onPress={() => setOpen(open === e.id ? null : e.id)} accessibilityRole="button">
              <Text style={type.body}>{e.name}</Text>
              <Text style={type.small}>
                {target(e)} · {e.equipment.map((q) => labelOf(EQUIPMENT, q)).join(', ')}
              </Text>
            </Pressable>
            {canPick ? <Button title={swapIndex != null ? 'Swap' : 'Add'} variant="secondary" onPress={() => pick(e)} style={{ minHeight: TOUCH }} /> : null}
          </View>
          {open === e.id ? (
            <>
              <View style={ui.wrap}>
                <Tag label={capitalize(e.level)} color={colors.accentSecondary} />
                {e.muscle_group.map((m) => (
                  <Tag key={m} label={capitalize(m)} />
                ))}
              </View>
              <Text style={type.small}>{e.description}</Text>
            </>
          ) : null}
        </Card>
      ))}
      {results.length === 0 ? <EmptyState icon="search-outline" title="No exercises found" text="Try a different search or fewer filters." /> : null}
    </Screen>
  );
}
