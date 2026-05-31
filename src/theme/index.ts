import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react';
import { darkColors, lightColors, type ColorPalette } from './colors';
import { radius, spacing, type Radius, type Spacing } from './spacing';
import { typography, type TypographyVariant } from './typography';

export type ThemeMode = 'dark' | 'light';

export type Theme = {
  mode: ThemeMode;
  colors: ColorPalette;
  spacing: Spacing;
  radius: Radius;
  typography: typeof typography;
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  radius,
  typography,
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  radius,
  typography,
};

const ThemeContext = createContext<Theme>(darkTheme);

export function ThemeProvider({
  mode = 'dark',
  children,
}: {
  mode?: ThemeMode;
  children: ReactNode;
}) {
  const value = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);
  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export type { ColorPalette, TypographyVariant };
