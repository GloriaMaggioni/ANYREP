import { Platform, Switch, Text, TextInput, View, Alert } from 'react-native';
import { Button, Card, ChipGroup, Screen, SectionTitle, styles as ui } from '../../src/components/ui';
import { LEVELS, LOCATIONS } from '../../src/config/options';
import { colors, radius, spacing, TOUCH, type } from '../../src/config/theme';
import { useStore } from '../../src/hooks/useStore';
import { formatDate } from '../../src/utils/format';

function confirm(message: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onYes();
  } else {
    Alert.alert('Are you sure?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', style: 'destructive', onPress: onYes },
    ]);
  }
}

export default function Profile() {
  const user = useStore((s) => s.user);
  const muted = useStore((s) => s.muted);
  const setMuted = useStore((s) => s.setMuted);
  const updateProfile = useStore((s) => s.updateProfile);
  const logout = useStore((s) => s.logout);
  const clearHistory = useStore((s) => s.clearHistory);

  if (!user) return null;

  return (
    <Screen>
      <Text style={[type.h1, { paddingTop: spacing.lg }]}>Profile</Text>

      <Card>
        <Text style={type.small}>Display name</Text>
        <TextInput
          value={user.display_name}
          onChangeText={(display_name) => updateProfile({ display_name })}
          style={{ ...type.h3, minHeight: TOUCH, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card / 2, paddingHorizontal: spacing.md, backgroundColor: colors.bgSecondary }}
          maxLength={30}
        />
        <Text style={type.small}>
          {user.is_guest ? 'Guest account' : user.email} · member since {formatDate(user.created_at)}
        </Text>
      </Card>

      <SectionTitle>Your level</SectionTitle>
      <ChipGroup options={LEVELS} selected={[user.level]} onToggle={(level) => updateProfile({ level })} />

      <SectionTitle>Where you usually train</SectionTitle>
      <ChipGroup options={LOCATIONS} selected={[user.preferred_location]} onToggle={(preferred_location) => updateProfile({ preferred_location })} />

      <SectionTitle>Settings</SectionTitle>
      <Card>
        <View style={[ui.row, { minHeight: TOUCH }]}>
          <Text style={[type.body, { flex: 1 }]}>Sound cues</Text>
          <Switch value={!muted} onValueChange={(on) => setMuted(!on)} trackColor={{ true: colors.accent, false: colors.border }} />
        </View>
      </Card>

      <Button title="Clear history" variant="ghost" icon="trash-outline" onPress={() => confirm('Delete your whole workout history?', clearHistory)} />
      <Button title="Log out" variant="danger" icon="log-out-outline" onPress={logout} />
    </Screen>
  );
}
