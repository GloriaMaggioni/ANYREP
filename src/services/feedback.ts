import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Audio cues are synthesized with the Web Audio API, so no sound files are
// needed. On iOS/Android the cues fall back to haptics only for now.
type Ctx = AudioContext;
let ctx: Ctx | null = null;
let muted = false;

function audio(): Ctx | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  // Browsers start the context suspended until a user gesture.
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq: number, startOffset: number, duration = 0.14, volume = 0.25) {
  const c = audio();
  if (!c || muted) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const t0 = c.currentTime + startOffset;
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function haptic(kind: 'light' | 'heavy' | 'success') {
  if (Platform.OS === 'web') return;
  if (kind === 'success') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    Haptics.impactAsync(
      kind === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light,
    );
  }
}

export const cues = {
  // Call from a button press so browsers allow sound later on.
  unlock() {
    audio();
  },
  setMuted(value: boolean) {
    muted = value;
  },
  countdownTick() {
    tone(660, 0);
    haptic('light');
  },
  go() {
    tone(990, 0, 0.35);
    haptic('heavy');
  },
  workEnd() {
    tone(880, 0);
    tone(880, 0.2);
    haptic('light');
  },
  restEnd() {
    tone(990, 0, 0.2);
    haptic('light');
  },
  roundEnd() {
    tone(880, 0);
    tone(880, 0.2);
    tone(880, 0.4);
    haptic('heavy');
  },
  complete() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.15, 0.3));
    haptic('success');
  },
  tap() {
    haptic('light');
  },
};
