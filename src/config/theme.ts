import { Platform, TextStyle } from 'react-native';

export const colors = {
  bg: '#0A0A0A',
  bgSecondary: '#141414',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#606060',
  accent: '#6C63FF',
  accentSecondary: '#00D4AA',
  warning: '#FFB800',
  danger: '#FF4466',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  card: 16,
  chip: 20,
  button: 30,
};

const fontFamily = Platform.select({
  web: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  default: undefined,
});

export const type: Record<string, TextStyle> = {
  h1: { fontFamily, fontSize: 28, lineHeight: 34, fontWeight: '700', color: colors.text },
  h2: { fontFamily, fontSize: 22, lineHeight: 29, fontWeight: '600', color: colors.text },
  h3: { fontFamily, fontSize: 18, lineHeight: 25, fontWeight: '600', color: colors.text },
  body: { fontFamily, fontSize: 16, lineHeight: 24, color: colors.text },
  small: { fontFamily, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  timer: { fontFamily, fontSize: 72, lineHeight: 72, fontWeight: '700', color: colors.text },
  chip: { fontFamily, fontSize: 12, fontWeight: '500' },
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
};

// Minimum size for anything tappable (acceptance criteria: ≥ 44pt).
export const TOUCH = 44;

// Content is centered and capped so the app stays readable on a PC screen.
export const MAX_WIDTH = 720;
