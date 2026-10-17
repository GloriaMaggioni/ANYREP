import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, MAX_WIDTH, radius, spacing, TOUCH, type } from '../config/theme';
import { Option } from '../config/options';

type IconName = keyof typeof Ionicons.glyphMap;

export function Screen({
  children,
  scroll = true,
  footer,
}: {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
}) {
  const body = <View style={styles.inner}>{children}</View>;
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.scrollContent, { flex: 1 }]}>{body}</View>
      )}
      {footer ? (
        <View style={styles.footer}>
          <View style={[styles.inner, styles.footerInner]}>{footer}</View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function Header({ title, right, onBack }: { title?: string; right?: ReactNode; onBack?: () => void }) {
  return (
    <View style={styles.header}>
      <IconButton
        icon="chevron-back"
        label="Back"
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      />
      <Text style={[type.h3, { flex: 1, textAlign: 'center' }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ minWidth: TOUCH, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const fg = variant === 'primary' ? colors.text : variant === 'danger' ? colors.danger : variant === 'ghost' ? colors.textSecondary : colors.accent;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && { backgroundColor: colors.accent },
        variant === 'secondary' && { borderWidth: 2, borderColor: colors.accent },
        variant === 'danger' && { borderWidth: 2, borderColor: colors.danger },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
          <Text style={[type.button, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  color = colors.text,
  size = 22,
  disabled,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      style={({ pressed }) => [styles.iconButton, (pressed || disabled) && { opacity: disabled ? 0.3 : 0.6 }]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[type.chip, { color: selected ? colors.text : colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

export function ChipGroup<T>({
  options,
  selected,
  onToggle,
  anyLabel,
  onAny,
}: {
  options: Option<T>[];
  selected: T[];
  onToggle: (value: T) => void;
  anyLabel?: string;
  onAny?: () => void;
}) {
  return (
    <View style={styles.chipRow}>
      {anyLabel && onAny ? <Chip label={anyLabel} selected={selected.length === 0} onPress={onAny} /> : null}
      {options.map((o) => (
        <Chip key={String(o.value)} label={o.label} selected={selected.includes(o.value)} onPress={() => onToggle(o.value)} />
      ))}
    </View>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { borderColor: colors.accent }, style]}
    >
      {children}
    </Pressable>
  );
}

export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  suffix = '',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={[type.body, { flex: 1 }]}>{label}</Text>
      <IconButton icon="remove-circle-outline" label={`Decrease ${label}`} disabled={value <= min} onPress={() => onChange(Math.max(min, value - step))} color={colors.accent} />
      <Text style={[type.h3, { minWidth: 64, textAlign: 'center' }]}>
        {value}
        {suffix}
      </Text>
      <IconButton icon="add-circle-outline" label={`Increase ${label}`} disabled={value >= max} onPress={() => onChange(Math.min(max, value + step))} color={colors.accent} />
    </View>
  );
}

export function Tag({ label, color = colors.textSecondary }: { label: string; color?: string }) {
  return (
    <View style={[styles.tag, { borderColor: color }]}>
      <Text style={[type.chip, { color }]}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={type.h2}>{children}</Text>
      {right}
    </View>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={40} color={colors.textMuted} />
      <Text style={type.h3}>{title}</Text>
      <Text style={[type.small, { textAlign: 'center' }]}>{text}</Text>
      {action}
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MAX_WIDTH, gap: spacing.md },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgSecondary, padding: spacing.md, alignItems: 'center' },
  footerInner: { flexDirection: 'row', gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.sm, gap: spacing.sm },
  button: {
    minHeight: 48,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  iconButton: { minWidth: TOUCH, minHeight: TOUCH, alignItems: 'center', justifyContent: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: 36,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', minHeight: TOUCH },
  tag: { borderWidth: 1, borderRadius: radius.chip, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
