export const Colors = {
  // Background layers
  bg: '#0D1B2A',
  bgCard: '#152232',
  bgElevated: '#1C2F42',
  bgInput: '#1A2B3C',

  // Primary palette
  primary: '#00D4AA',
  primaryDark: '#00A88A',
  primaryLight: '#4DFFDA',

  // Accent palette
  accent: '#FF6B6B',
  accentOrange: '#FF9F43',
  accentPurple: '#A29BFE',
  accentBlue: '#4ECDC4',
  accentGold: '#FFD93D',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8899AA',
  textMuted: '#4A6070',
  textOnPrimary: '#0D1B2A',

  // Status
  success: '#00D4AA',
  warning: '#FFD93D',
  danger: '#FF6B6B',
  info: '#4ECDC4',

  // Member brand colors
  memberColors: {
    ajay: '#FF6B6B',
    ronit: '#4ECDC4',
    seema: '#A29BFE',
    cheshta: '#FFD93D',
    shivi: '#FF9F43',
  },

  // Nutrition macros
  protein: '#FF6B6B',
  carbs: '#4ECDC4',
  fat: '#FFD93D',
  fiber: '#A29BFE',

  // Border
  border: '#1E3248',
  borderLight: '#2A4560',
} as const;

export const Gradients = {
  ajay: ['#FF6B6B', '#FF4757'] as [string, string],
  ronit: ['#4ECDC4', '#1ABC9C'] as [string, string],
  seema: ['#A29BFE', '#6C5CE7'] as [string, string],
  cheshta: ['#FFD93D', '#FFC107'] as [string, string],
  shivi: ['#FF9F43', '#F39C12'] as [string, string],
  primary: ['#00D4AA', '#00A88A'] as [string, string],
  card: ['#152232', '#1C2F42'] as [string, string],
  dark: ['#0D1B2A', '#152232'] as [string, string],
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 48,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;
