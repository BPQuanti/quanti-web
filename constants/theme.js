export const colors = {
  bg: '#09090B',
  card: '#18181B',
  cardGlass: 'rgba(24, 24, 27, 0.7)',
  input: '#27272A',
  accent: '#7C3AED',
  accentDeep: '#7C3AED',
  accentSoft: '#DDD6FE',
  glow: '#C084FC',
  text: '#FAFAFA',
  white: '#FAFAFA',
  muted: '#A1A1AA',
  inactive: '#71717A',
  border: '#27272A',
  borderViolet: 'rgba(139, 92, 246, 0.2)',
  borderGlow: 'rgba(139, 92, 246, 0.2)',
  tab: '#09090B',
  tabActive: '#C084FC',
  insight: '#C084FC',
  mock: '#FBBF24',
  overlay: 'rgba(9, 9, 11, 0.85)',
};

export const radii = {
  sm: 8,
  md: 16,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const glow = {
  shadowColor: '#7C3AED',
  shadowOpacity: 0.25,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 0 },
  elevation: 8,
};

export const fonts = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
  mono: 'GeistMono_500Medium',
};

export const surfaces = {
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  cardGlow: {
    backgroundColor: colors.card,
    borderColor: colors.borderViolet,
    borderWidth: 1,
    borderRadius: radii.md,
    ...glow,
  },
  glass: {
    backgroundColor: colors.cardGlass,
    borderColor: colors.borderViolet,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...glow,
  },
};

export const theme = {
  colors,
  radii,
  glow,
  fonts,
  surfaces,
};

export default theme;
