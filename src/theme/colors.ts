export type ColorPalette = {
  bg: string;
  bgElevated: string;
  bgCard: string;
  border: string;
  text: string;
  textMuted: string;
  textDim: string;
  accent: string;
  accentMuted: string;
  success: string;
  warning: string;
  danger: string;
  // Cycle phase palette (spec §7.1)
  phaseMenstrual: string;
  phaseFollicular: string;
  phaseOvulation: string;
  phaseLuteal: string;
};

export const darkColors: ColorPalette = {
  bg: '#0A0A0B',
  bgElevated: '#141417',
  bgCard: '#1C1C21',
  border: '#2A2A30',
  text: '#F2F2F5',
  textMuted: '#9A9AA5',
  textDim: '#62626C',
  accent: '#C9A8FF',
  accentMuted: '#6B5A8A',
  success: '#8AE6B4',
  warning: '#F4C95D',
  danger: '#F08A8A',
  phaseMenstrual: '#D96A6A',
  phaseFollicular: '#8FD1A3',
  phaseOvulation: '#F2C063',
  phaseLuteal: '#A99CE0',
};

export const lightColors: ColorPalette = {
  bg: '#FAFAFB',
  bgElevated: '#FFFFFF',
  bgCard: '#F2F2F4',
  border: '#E2E2E6',
  text: '#0F0F12',
  textMuted: '#5A5A63',
  textDim: '#9A9AA5',
  accent: '#6B4DB8',
  accentMuted: '#C9B8E6',
  success: '#3E9C67',
  warning: '#C99436',
  danger: '#C15454',
  phaseMenstrual: '#C15454',
  phaseFollicular: '#4FA86C',
  phaseOvulation: '#D39A2A',
  phaseLuteal: '#7E6EC5',
};
