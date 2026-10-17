import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { FilterSheet } from '../../src/components/FilterSheet';
import { Button, Card, Chip, EmptyState, Screen, SectionTitle, styles as ui } from '../../src/components/ui';
import { WorkoutCard } from '../../src/components/WorkoutCard';
import { DIRECTIONS } from '../../src/config/options';
import { colors, radius, spacing, TOUCH, type } from '../../src/config/theme';
import { useStore } from '../../src/hooks/useStore';
import { PREMADE_TEMPLATES } from '../../src/services/data';
import { Filters } from '../../src/types';
import { countActiveFilters, EMPTY_FILTERS, matchesTemplate, toggle } from '../../src/utils/filters';
import { computeStreak } from '../../src/utils/stats';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const user = useStore((s) => s.user);
  const history = useStore((s) => s.history);
  const saved = useStore((s) => s.savedWorkouts);
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const [sheetOpen, setSheetOpen] = useState(false);

  const all = useMemo(() => [...saved, ...PREMADE_TEMPLATES], [saved]);
  const results = useMemo(() => all.filter((t) => matchesTemplate(t, filters)), [all, filters]);
  const streak = computeStreak(history);
  const active = countActiveFilters(filters);
  const last = history[0];
  const lastTemplate = last && all.find((t) => t.id === last.template_id);

  return (
    <Screen>
      <View style={{ paddingTop: spacing.lg, gap: spacing.xs }}>
        <Text style={type.small}>{greeting()},</Text>
        <Text style={type.h1}>{user?.display_name ?? 'Athlete'} 👋</Text>
      </View>

      <View style={ui.row}>
        <Card style={{ flex: 1 }}>
          <View style={ui.row}>
            <Ionicons name="flame" size={22} color={colors.warning} />
            <Text style={type.h2}>{streak}</Text>
          </View>
          <Text style={type.small}>day streak</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <View style={ui.row}>
            <Ionicons name="trophy-outline" size={22} color={colors.accentSecondary} />
            <Text style={type.h2}>{history.length}</Text>
          </View>
          <Text style={type.small}>workouts done</Text>
        </Card>
      </View>

      {lastTemplate ? (
        <Card>
          <Text style={type.small}>Quick start · last workout</Text>
          <Text style={type.h3}>{lastTemplate.name}</Text>
          <Button title="Start again" icon="play" onPress={() => router.push({ pathname: '/workout/timer', params: { id: lastTemplate.id } })} />
        </Card>
      ) : (
        <Card>
          <Text style={type.h3}>New here?</Text>
          <Text style={type.small}>Pick a direction below or open the filters to find a workout that fits where you are.</Text>
        </Card>
      )}

      <SectionTitle
        right={
          <Pressable onPress={() => setSheetOpen(true)} style={[ui.row, { minHeight: TOUCH, paddingHorizontal: spacing.sm, borderRadius: radius.chip }]} accessibilityRole="button">
            <Ionicons name="options-outline" size={18} color={colors.accent} />
            <Text style={[type.chip, { color: colors.accent }]}>Filters{active ? ` (${active})` : ''}</Text>
          </Pressable>
        }
      >
        Workouts
      </SectionTitle>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        <Chip label="All" selected={filters.direction.length === 0} onPress={() => setFilters({ ...filters, direction: [] })} />
        {DIRECTIONS.map((d) => (
          <Chip key={d.value} label={d.label} selected={filters.direction.includes(d.value)} onPress={() => setFilters({ ...filters, direction: toggle(filters.direction, d.value) })} />
        ))}
      </ScrollView>

      <Text style={type.small}>
        {results.length} of {all.length} workouts
      </Text>

      {results.map((t) => (
        <WorkoutCard key={t.id} workout={t} onPress={() => router.push(`/workout/${t.id}`)} />
      ))}
      {results.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No workouts match"
          text="Try removing a filter, or build your own workout."
          action={<Button title="Clear filters" variant="secondary" onPress={() => setFilters(EMPTY_FILTERS)} />}
        />
      ) : null}

      <FilterSheet
        visible={sheetOpen}
        value={filters}
        onApply={setFilters}
        onClose={() => setSheetOpen(false)}
        resultCount={(f: Filters) => all.filter((t) => matchesTemplate(t, f)).length}
      />
    </Screen>
  );
}
