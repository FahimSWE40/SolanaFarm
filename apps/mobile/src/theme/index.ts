/**
 * Solana Seeker Design Theme
 * Futuristic dark mode with Solana-inspired neon accents.
 * Based on the Stitch design reference.
 */

export const colors = {
  // Core background
  background: '#0C0A14',
  surface: '#1A1625',
  surfaceVariant: '#241E33',
  surfaceElevated: '#2D2640',

  // Primary - Neon Purple
  primary: '#D8B9FF',
  primaryContainer: '#5B3E99',
  primaryDim: '#B388FF',
  onPrimary: '#1A0042',

  // Secondary - Neon Green
  secondary: '#00F5A0',
  secondaryContainer: '#003D28',
  secondaryDim: '#00D68F',
  onSecondary: '#002114',

  // Tertiary - Cyan
  tertiary: '#00E5FF',
  tertiaryContainer: '#004D67',
  onTertiary: '#003548',

  // Accent
  accent: '#FFD700',
  accentPink: '#FF6B9D',
  accentOrange: '#FF8A50',

  // Error
  error: '#FFB4AB',
  errorContainer: '#93000A',
  onError: '#690005',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#CAC4D0',
  textMuted: '#79747E',
  textDisabled: '#49454F',

  // Borders
  outline: '#4C4355',
  outlineVariant: '#332D3E',

  // Status
  success: '#00F5A0',
  warning: '#FFD700',
  info: '#00E5FF',

  // Gradient presets
  gradientPrimary: ['#5B3E99', '#D8B9FF'],
  gradientSecondary: ['#003D28', '#00F5A0'],
  gradientCard: ['#241E33', '#1A1625'],
  gradientAccent: ['#D8B9FF', '#00E5FF'],
  gradientGlow: ['#5B3E9960', '#D8B9FF20', '#00000000'],

  // Reward tier colors
  diamond: '#B9F2FF',
  platinum: '#E5E4E2',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',

  // Badge rarity
  common: '#9E9E9E',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#AB47BC',
  legendary: '#FFD700',
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
  // Using Space Grotesk for headings and Inter for body
  fontFamily: {
    heading: 'SpaceGrotesk_700Bold',
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
  full: 999,
};

export const shadows = {
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glowGreen: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default { colors, spacing, typography, borderRadius, shadows };
