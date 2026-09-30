/**
 * Single source of truth for design tokens across Loop Web & Mobile.
 * Adheres strictly to WCAG 2.2 AA (and AAA high-contrast where feasible).
 * Designed for readability, especially for elderly/low-vision users.
 */

export interface ColorRole {
  background: string;
  surface: string;
  surfaceSubtle: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  success: string;
  successBg: string;
  successText: string;
  warning: string;
  warningBg: string;
  warningText: string;
  danger: string;
  dangerBg: string;
  dangerText: string;
  info: string;
  infoBg: string;
  infoText: string;
}

export const themes: Record<'light' | 'dark' | 'highContrast', ColorRole> = {
  light: {
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9', // Slate 100
    border: '#CBD5E1', // Slate 300
    textPrimary: '#0F172A', // Slate 900 - Contrast > 12:1 against surface
    textSecondary: '#334155', // Slate 700 - Contrast > 7:1
    textMuted: '#64748B', // Slate 500 - Contrast > 4.5:1
    primary: '#0D9488', // Teal 600
    primaryHover: '#0F766E', // Teal 700
    primaryText: '#FFFFFF',
    success: '#15803D', // Green 700
    successBg: '#DCFCE7', // Green 100
    successText: '#14532D',
    warning: '#B45309', // Amber 700
    warningBg: '#FEF3C7', // Amber 100
    warningText: '#78350F',
    danger: '#B91C1C', // Red 700
    dangerBg: '#FEE2E2', // Red 100
    dangerText: '#7F1D1D',
    info: '#1D4ED8', // Blue 700
    infoBg: '#DBEAFE', // Blue 100
    infoText: '#1E3A8A'
  },
  dark: {
    background: '#0B0F19',
    surface: '#111827', // Gray 900
    surfaceSubtle: '#1F2937', // Gray 800
    border: '#374151', // Gray 700
    textPrimary: '#F9FAFB', // Gray 50 - Contrast > 14:1
    textSecondary: '#E5E7EB', // Gray 200 - Contrast > 9:1
    textMuted: '#9CA3AF', // Gray 400 - Contrast > 4.5:1
    primary: '#14B8A6', // Teal 500
    primaryHover: '#2DD4BF', // Teal 400
    primaryText: '#042F2E',
    success: '#22C55E', // Green 500
    successBg: '#052E16',
    successText: '#86EFAC',
    warning: '#F59E0B', // Amber 500
    warningBg: '#451A03',
    warningText: '#FDE68A',
    danger: '#EF4444', // Red 500
    dangerBg: '#450A0A',
    dangerText: '#FCA5A5',
    info: '#3B82F6', // Blue 500
    infoBg: '#172554',
    infoText: '#93C5FD'
  },
  highContrast: {
    background: '#000000',
    surface: '#000000',
    surfaceSubtle: '#121212',
    border: '#FFFFFF', // Pure white borders for AAA contrast
    textPrimary: '#FFFFFF', // 21:1 contrast
    textSecondary: '#FFFF00', // Yellow for max visibility
    textMuted: '#E0E0E0',
    primary: '#00FFFF', // Cyan
    primaryHover: '#80FFFF',
    primaryText: '#000000',
    success: '#00FF66',
    successBg: '#00290F',
    successText: '#FFFFFF',
    warning: '#FFD700',
    warningBg: '#332B00',
    warningText: '#FFFFFF',
    danger: '#FF3333',
    dangerBg: '#330000',
    dangerText: '#FFFFFF',
    info: '#3399FF',
    infoBg: '#001A33',
    infoText: '#FFFFFF'
  }
};

/**
 * Type scale in rem units (1rem = 16px root baseline).
 * Default body text is minimum 18px (1.125rem) for high readability.
 */
export const typography = {
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  },
  fontSize: {
    // Web rem & mobile approximate dp values
    xs: { rem: '0.875rem', px: 14 },
    sm: { rem: '1rem', px: 16 }, // Minimum absolute floor
    base: { rem: '1.125rem', px: 18 }, // Default Loop text (18px)
    lg: { rem: '1.25rem', px: 20 },
    xl: { rem: '1.5rem', px: 24 },
    '2xl': { rem: '1.875rem', px: 30 },
    '3xl': { rem: '2.25rem', px: 36 },
    '4xl': { rem: '3rem', px: 48 } // Large check-in status
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
};

export const spacing = {
  0: '0rem',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',    // 16px
  5: '1.25rem', // 20px
  6: '1.5rem',  // 24px
  8: '2rem',    // 32px
  10: '2.5rem', // 40px
  12: '3rem',   // 48px - touch target size
  16: '4rem',   // 64px - primary checkin button height
  20: '5rem'    // 80px
};

export const touchTargets = {
  minimum: '48px',
  checkInButton: '64px',
  spacingBetweenAdjacent: '8px'
};

export const borderRadius = {
  none: '0',
  sm: '0.375rem', // 6px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  xl: '1rem',     // 16px
  '2xl': '1.5rem',// 24px
  full: '9999px'
};

export const focusRing = {
  width: '3px',
  offset: '2px',
  style: 'solid',
  colorLight: '#0D9488',
  colorDark: '#2DD4BF',
  colorHighContrast: '#FFFF00'
};
