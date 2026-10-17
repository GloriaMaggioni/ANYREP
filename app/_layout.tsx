import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/config/theme';
import { useStore } from '../src/hooks/useStore';
import { cues } from '../src/services/feedback';

export default function RootLayout() {
  const hasHydrated = useStore((s) => s.hasHydrated);
  const muted = useStore((s) => s.muted);

  useEffect(() => cues.setMuted(muted), [muted]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {/* The navigator must render from the first frame, so the loader is an overlay. */}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="workout/library" options={{ presentation: 'modal' }} />
        <Stack.Screen name="workout/timer" options={{ gestureEnabled: false }} />
      </Stack>
      {!hasHydrated ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }]}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}
    </SafeAreaProvider>
  );
}
