import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { Card, EmptyState, Screen, SectionTitle, styles as ui } from '../../src/components/ui';
import { colors, spacing, type } from '../../src/config/theme';
import { useStore } from '../../src/hooks/useStore';
import { formatDate, formatDuration } from '../../src/utils/format';
import { computeStreak, lastSevenDays, totals } from '../../src/utils/stats';

export default function Stats() {
  const history = useStore((s) => s.history);
  const t = totals(history);
  const week = lastSevenDays(history);
  const maxDay = Math.max(1, ...week.map((d) => d.count));

  return (
    <Screen>
      <Text style={[type.h1, { paddingTop: spacing.lg }]}>Stats</Text>

      <View style={ui.row}>
        <StatCard icon="flame" color={colors.warning} value={String(computeStreak(history))} label="day streak" />
        <StatCard icon="trophy-outline" color={colors.accentSecondary} value={String(t.workouts)} label="workouts" />
      </View>
      <View style={ui.row}>
        <StatCard icon="time-outline" color={colors.accent} value={formatDuration(t.seconds)} label="total time" />
        <StatCard icon="repeat" color={colors.accent} value={String(t.reps)} label="reps counted" />
      </View>

      <SectionTitle>Last 7 days</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: spacing.sm }}>
          {week.map((d, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
              <Text style={type.small}>{d.count || ''}</Text>
              <View
                style={{
                  width: '70%',
                  height: Math.max(4, (d.count / maxDay) * 80),
                  borderRadius: 6,
                  backgroundColor: d.count ? colors.accent : colors.border,
                }}
              />
              <Text style={type.small}>{d.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <SectionTitle>History</SectionTitle>
      {history.length === 0 ? (
        <EmptyState icon="calendar-outline" title="No workouts yet" text="Finish a workout and it will show up here." />
      ) : null}
      {history.map((h) => (
        <Card key={h.id}>
          <View style={ui.row}>
            <Text style={[type.h3, { flex: 1 }]} numberOfLines={1}>
              {h.template_name}
            </Text>
            <Text style={type.small}>{formatDate(h.completed_at)}</Text>
          </View>
          <Text style={type.small}>
            {formatDuration(h.duration_seconds)} · {h.rounds_completed} rounds · {h.total_reps} reps
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

function StatCard({ icon, color, value, label }: { icon: keyof typeof Ionicons.glyphMap; color: string; value: string; label: string }) {
  return (
    <Card style={{ flex: 1 }}>
      <View style={ui.row}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={type.h2}>{value}</Text>
      </View>
      <Text style={type.small}>{label}</Text>
    </Card>
  );
}
