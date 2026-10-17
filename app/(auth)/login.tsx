import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Screen } from '../../src/components/ui';
import { colors, radius, spacing, TOUCH, type } from '../../src/config/theme';
import { useStore } from '../../src/hooks/useStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const signIn = useStore((s) => s.signIn);
  const continueAsGuest = useStore((s) => s.continueAsGuest);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    signIn(name, email);
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.logo}>WORKOUT</Text>
        <Text style={[type.body, { color: colors.textSecondary }]}>Get strong anywhere. No gear needed.</Text>
      </View>

      <Card>
        <Text style={type.h2}>Sign in</Text>
        <Text style={type.small}>Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.textMuted} style={styles.input} autoComplete="name" />
        <Text style={type.small}>Email</Text>
        <TextInput
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setError('');
          }}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          onSubmitEditing={submit}
        />
        {error ? <Text style={[type.small, { color: colors.danger }]}>{error}</Text> : null}
        <Button title="Sign in" onPress={submit} />
      </Card>

      <Button title="Continue as guest" variant="secondary" onPress={continueAsGuest} />
      <Text style={[type.small, { textAlign: 'center', color: colors.textMuted }]}>
        Your profile, workouts and history are saved on this device.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  logo: { ...type.h1, fontSize: 40, lineHeight: 44, letterSpacing: 4, color: colors.accent },
  input: {
    ...type.body,
    minHeight: TOUCH,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card / 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgSecondary,
  },
});
