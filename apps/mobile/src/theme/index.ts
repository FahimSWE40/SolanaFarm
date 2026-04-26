export const colors = {
  // Core backgrounds
  background: '#020205',
  surface: '#0A0B1E',
  surfaceBright: '#1d1e32',
  surfaceVariant: '#323348',
  surfaceElevated: '#27283d',

  // Primary — lavender text / neon purple glow
  primary: '#d8b9ff',
  primaryContainer: '#9945FF',
  primaryDim: '#b87cff',
  onPrimary: '#020205',

  // Secondary — neon green
  secondary: '#14F195',
  secondaryDim: '#a0ffc3',
  secondaryContainer: '#00ec91',
  onSecondary: '#00391f',

  // Tertiary — cyan
  tertiary: '#75d1ff',
  tertiaryContainer: '#004D67',
  onTertiary: '#003548',

  // Gold / premium
  gold: '#D4AF37',
  goldLight: '#F9E29C',

  // Error
  error: '#ffb4ab',
  errorContainer: '#93000A',

  // Text
  textPrimary: '#e1e0fb',
  textSecondary: '#cec2d8',
  textMuted: '#79747E',
  textDisabled: '#49454F',

  // Borders
  outline: '#4c4355',
  outlineVariant: 'rgba(255,255,255,0.07)',

  // Status
  success: '#14F195',
  warning: '#D4AF37',
  info: '#75d1ff',

  // Glass card surfaces
  glassCard: 'rgba(10,11,30,0.60)',
  glassCardBright: 'rgba(22,23,45,0.65)',

  // Accent legacy (kept for badge system)
  accent: '#d8b9ff',
  accentOrange: '#FF8A50',
  accentPink: '#FF6B9D',

  // Reward tiers
  diamond: '#B9F2FF',
  platinum: '#E5E4E2',
  gold2: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',

  // Badge rarity
  common: '#9E9E9E',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#AB47BC',
  legendary: '#FFD700',

  // Gradient presets
  gradientPrimary: ['#9945FF', '#d8b9ff'] as string[],
  gradientSecondary: ['#003D28', '#14F195'] as string[],
  gradientXP: ['#9945FF', '#b87cff', '#14F195'] as string[],
  gradientGold: ['#D4AF37', '#F9E29C'] as string[],
  gradientCard: ['rgba(153,69,255,0.14)', 'rgba(10,11,30,0.75)', 'rgba(20,241,149,0.05)'] as string[],
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

export const typography = {
  fontFamily: {
    heading: 'SpaceGrotesk_700Bold',
    headingBlack: 'SpaceGrotesk_700Bold',
    headingMedium: 'SpaceGrotesk_500Medium',
    headingLight: 'SpaceGrotesk_300Light',
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    bodySemiBold: 'Inter_600SemiBold',
  },
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 40,
    hero: 48,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 999,
};

export const shadows = {
  glow: {
    shadowColor: '#9945FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  glowGreen: {
    shadowColor: '#14F195',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  glowGold: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default { colors, spacing, typography, borderRadius, shadows };
