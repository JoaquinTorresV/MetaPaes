/**
 * Design System — Atelier PAES
 * "The Architectural Scholar" — basado en el DESIGN.md oficial
 * 
 * Reglas:
 * - Sin bordes explícitos (usar cambios de superficie)
 * - Primary siempre como gradiente en CTAs
 * - Sombras azul-tintadas, nunca negras
 */

export const colors = {
  // Primary
  primary: '#004ac6',
  primaryContainer: '#2563eb',

  // Surfaces (escalonadas para profundidad sin bordes)
  surface: '#f8f9fa',
  surfaceLow: '#f3f4f5',
  surfaceLowest: '#ffffff',
  surfaceHigh: '#e7e8e9',
  surfaceHighest: '#e1e3e4',

  // On-surface text
  onSurface: '#191c1d',
  onSurfaceVariant: '#434655',

  // Secondary / accents
  secondary: '#495c95',
  secondaryContainer: '#acbfff',

  // Semantic
  tertiary: '#943700',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',

  // Borders (usar con opacidad)
  outline: '#737686',
  outlineVariant: '#c3c6d7',
} as const

export const gradients = {
  primary: ['#004ac6', '#2563eb'] as [string, string],
} as const

export const shadows = {
  // Sombra azul-tintada (firma del design system)
  card: {
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
  },
  premium: {
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 8,
  },
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

export const typography = {
  // Manrope exclusivamente
  family: {
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semibold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
    extrabold: 'Manrope_800ExtraBold',
  },
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    display: 28,
    hero: 36,
  },
  tracking: {
    tight: -0.02,
    normal: 0,
    wide: 0.04,
    wider: 0.08,
  },
} as const

export type Colors = typeof colors
export type Spacing = typeof spacing
