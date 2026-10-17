import { Redirect, Stack } from 'expo-router';
import { colors } from '../../src/config/theme';
import { useStore } from '../../src/hooks/useStore';

export default function AuthLayout() {
  const hasHydrated = useStore((s) => s.hasHydrated);
  const user = useStore((s) => s.user);
  if (hasHydrated && user) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
