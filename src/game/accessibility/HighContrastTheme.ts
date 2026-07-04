/**
 * High-contrast color palette for accessibility.
 * Provides WCAG AAA contrast ratios (7:1 minimum).
 */
export const HIGH_CONTRAST = {
  background: 0x000000,
  foreground: 0xffffff,
  primary: 0x00ffff,
  secondary: 0xffff00,
  error: 0xff4444,
  success: 0x44ff44,
  border: 0xffffff,
  text: '#ffffff',
  textMuted: '#cccccc',
  accent: '#00ffff',
} as const;

export const STANDARD_THEME = {
  background: 0x05070b,
  foreground: 0xc8d6e5,
  primary: 0x4cc9f0,
  secondary: 0x8899aa,
  error: 0xff6b6b,
  success: 0x51cf66,
  border: 0x334455,
  text: '#c8d6e5',
  textMuted: '#667788',
  accent: '#4cc9f0',
} as const;

export interface ThemeColors {
  readonly background: number;
  readonly foreground: number;
  readonly primary: number;
  readonly secondary: number;
  readonly error: number;
  readonly success: number;
  readonly border: number;
  readonly text: string;
  readonly textMuted: string;
  readonly accent: string;
}

export function getTheme(highContrast: boolean): ThemeColors {
  return highContrast ? HIGH_CONTRAST : STANDARD_THEME;
}
