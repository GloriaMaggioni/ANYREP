import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DIRECTIONS, EQUIPMENT, LEVELS, LOCATIONS } from '../config/options';
import { colors, MAX_WIDTH, radius, spacing, type } from '../config/theme';
import { Filters } from '../types';
import { EMPTY_FILTERS, toggle } from '../utils/filters';
import { Button, ChipGroup, IconButton, styles as ui } from './ui';

export function FilterSheet({
  visible,
  value,
  onApply,
  onClose,
  resultCount,
}: {
  visible: boolean;
  value: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
  resultCount?: (f: Filters) => number;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const set = <K extends keyof Filters>(key: K, list: Filters[K]) => setDraft((d) => ({ ...d, [key]: list }));
  const count = resultCount?.(draft);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close filters" />
      <View style={styles.sheet}>
        <View style={styles.inner}>
          <View style={ui.row}>
            <Text style={[type.h2, { flex: 1 }]}>Filters</Text>
            <IconButton icon="close" label="Close" onPress={onClose} />
          </View>
          <ScrollView contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.md }}>
            <Section title="Direction">
              <ChipGroup options={DIRECTIONS} selected={draft.direction} anyLabel="Any" onAny={() => set('direction', [])} onToggle={(v) => set('direction', toggle(draft.direction, v))} />
            </Section>
            <Section title="Equipment" hint="Pick everything you have — workouts needing only those show up.">
              <ChipGroup options={EQUIPMENT} selected={draft.equipment} anyLabel="Any" onAny={() => set('equipment', [])} onToggle={(v) => set('equipment', toggle(draft.equipment, v))} />
            </Section>
            <Section title="Level">
              <ChipGroup options={LEVELS} selected={draft.level} anyLabel="Any" onAny={() => set('level', [])} onToggle={(v) => set('level', toggle(draft.level, v))} />
            </Section>
            <Section title="Location">
              <ChipGroup options={LOCATIONS} selected={draft.location} anyLabel="Any" onAny={() => set('location', [])} onToggle={(v) => set('location', toggle(draft.location, v))} />
            </Section>
          </ScrollView>
          <View style={ui.row}>
            <Button title="Reset" variant="ghost" onPress={() => setDraft(EMPTY_FILTERS)} />
            <Button
              title={count === undefined ? 'Apply' : `Show ${count} workouts`}
              onPress={() => {
                onApply(draft);
                onClose();
              }}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={type.h3}>{title}</Text>
      {hint ? <Text style={type.small}>{hint}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: radius.card * 1.5,
    borderTopRightRadius: radius.card * 1.5,
    borderTopWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  inner: { width: '100%', maxWidth: MAX_WIDTH, gap: spacing.md, flexShrink: 1 },
});
