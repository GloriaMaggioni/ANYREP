import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { DIRECTIONS, EQUIPMENT, labelOf, STRUCTURES } from '../config/options';
import { colors, type } from '../config/theme';
import { Template } from '../types';
import { capitalize } from '../utils/format';
import { Card, styles, Tag } from './ui';

export function WorkoutCard({ workout, onPress }: { workout: Template; onPress: () => void }) {
  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <Text style={[type.h3, { flex: 1 }]} numberOfLines={1}>
          {workout.name}
        </Text>
        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
        <Text style={type.small}>{workout.total_time_minutes} min</Text>
      </View>
      <Text style={type.small}>
        {labelOf(DIRECTIONS, workout.direction)} · {labelOf(STRUCTURES, workout.structure)} ·{' '}
        {workout.exercise_list.length} exercises
      </Text>
      <View style={styles.wrap}>
        <Tag label={capitalize(workout.level)} color={colors.accentSecondary} />
        <Tag label={capitalize(workout.location)} />
        {workout.equipment.map((e) => (
          <Tag key={e} label={labelOf(EQUIPMENT, e)} />
        ))}
      </View>
    </Card>
  );
}
