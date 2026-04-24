import type { TextStyle } from 'react-native';

export const typography = {
  display: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '600' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodyStrong: { fontSize: 16, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '400' },
  overline: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
