import { ReactNode } from 'react';
import { Platform, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../config/theme';

const STROKE = 6;

export function TimerCircle({
  progress,
  size = 220,
  children,
  rest,
}: {
  progress: number;
  size?: number;
  children?: ReactNode;
  rest?: boolean;
}) {
  const r = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        ...(Platform.OS === 'web'
          ? { boxShadow: '0 0 48px rgba(108,99,255,0.15)' }
          : { shadowColor: colors.accent, shadowOpacity: 0.15, shadowRadius: 24, elevation: 6 }),
      }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={rest ? colors.accentSecondary : colors.accent} />
            <Stop offset="1" stopColor={rest ? colors.accent : colors.accentSecondary} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={STROKE} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring)"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </Svg>
      {children}
    </View>
  );
}
