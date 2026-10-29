export const colors = {
  bg: '#09090B',
  card: '#171717',
  cardGlass: '#171717',
  glassSoft: 'rgba(255, 255, 255, 0.03)',
  input: 'rgba(255, 255, 255, 0.05)',
  accent: '#818CF8',
  accentDeep: '#6366F1',
  accentSoft: '#A5B4FC',
  glow: '#818CF8',
  text: '#F5F5F5',
  white: '#F5F5F5',
  heading: '#F5F5F5',
  muted: '#A3A3A3',
  inactive: '#737373',
  border: 'rgba(255, 255, 255, 0.1)',
  borderHover: 'rgba(255, 255, 255, 0.2)',
  borderViolet: 'rgba(99, 102, 241, 0.2)',
  borderGlow: 'rgba(99, 102, 241, 0.2)',
  tab: '#09090B',
  tabActive: '#818CF8',
  insight: '#A5B4FC',
  mock: '#FCD34D',
  overlay: 'rgba(9, 9, 11, 0.85)',
  amber: '#FCD34D',
  amberBg: 'rgba(245, 158, 11, 0.1)',
  amberBorder: 'rgba(245, 158, 11, 0.2)',
  emerald: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.1)',
  emeraldBorder: 'rgba(16, 185, 129, 0.2)',
  indigo: '#818CF8',
  indigoBg: 'rgba(99, 102, 241, 0.1)',
  indigoBorder: 'rgba(99, 102, 241, 0.2)',
};

export const radii = {
  sm: 8,
  md: 16,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const glow = {
  shadowColor: '#000000',
  shadowOpacity: 0.45,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 12 },
  elevation: 10,
};

export const fonts = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
  mono: 'GeistMono_500Medium',
  monoBold: 'GeistMono_700Bold',
};

export const typography = {
  kicker: {
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  heading: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  body: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
  },
  badgeText: {
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
};

export const surfaces = {
  glass: {
    backgroundColor: colors.cardGlass,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    ...glow,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  card: {
    backgroundColor: colors.cardGlass,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  cardGlow: {
    backgroundColor: colors.cardGlass,
    borderColor: colors.indigoBorder,
    borderWidth: 1,
    borderRadius: radii.md,
    ...glow,
  },
  button: {
    backgroundColor: colors.accentDeep,
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
  typography,
  surfaces,
};

export default theme;
