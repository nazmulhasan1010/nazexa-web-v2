export type FullThemeVars = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
  brand1: string;
  brand2: string;
  brand3: string;
};

export type ThemePreset = {
  id: string;
  name: string;
  isCustom: boolean;
  vars: FullThemeVars;
};

export type SiteThemeConfig = {
  activeThemeId: string;
  customThemes: ThemePreset[];
  // Legacy fields
  brand1?: string;
  brand2?: string;
  brand3?: string;
  radius?: string;
  glow?: boolean;
};

export const PRESET_THEMES: ThemePreset[] = [
  {
    id: 'preset-aurora',
    name: 'Aurora (Default Dark)',
    isCustom: false,
    vars: {
      background: 'oklch(0.16 0.017 250)',
      foreground: 'oklch(0.97 0.005 240)',
      card: 'oklch(0.205 0.019 252)',
      cardForeground: 'oklch(0.97 0.005 240)',
      popover: 'oklch(0.195 0.019 252)',
      popoverForeground: 'oklch(0.97 0.005 240)',
      primary: 'oklch(0.82 0.15 190)',
      primaryForeground: 'oklch(0.17 0.03 220)',
      secondary: 'oklch(0.26 0.025 252)',
      secondaryForeground: 'oklch(0.95 0.005 240)',
      muted: 'oklch(0.25 0.022 252)',
      mutedForeground: 'oklch(0.7 0.02 250)',
      accent: 'oklch(0.25 0.05 190)',
      accentForeground: 'oklch(0.95 0.05 190)',
      destructive: 'oklch(0.62 0.22 25)',
      destructiveForeground: 'oklch(0.98 0.003 248)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 14%)',
      ring: 'oklch(0.82 0.15 190 / 60%)',
      radius: '0.625rem',
      brand1: 'oklch(0.82 0.15 190)',
      brand2: 'oklch(0.68 0.17 265)',
      brand3: 'oklch(0.5 0.15 220)',
    },
  },
  {
    id: 'preset-ember',
    name: 'Ember (Warm Light)',
    isCustom: false,
    vars: {
      background: 'oklch(0.98 0.01 60)',
      foreground: 'oklch(0.2 0.02 60)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.2 0.02 60)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.2 0.02 60)',
      primary: 'oklch(0.6 0.2 25)',
      primaryForeground: 'oklch(0.98 0 0)',
      secondary: 'oklch(0.95 0.02 60)',
      secondaryForeground: 'oklch(0.3 0.02 60)',
      muted: 'oklch(0.92 0.02 60)',
      mutedForeground: 'oklch(0.5 0.02 60)',
      accent: 'oklch(0.92 0.05 35)',
      accentForeground: 'oklch(0.3 0.05 35)',
      destructive: 'oklch(0.6 0.2 25)',
      destructiveForeground: 'oklch(0.98 0 0)',
      border: 'oklch(0.88 0.02 60)',
      input: 'oklch(0.88 0.02 60)',
      ring: 'oklch(0.6 0.2 25 / 60%)',
      radius: '0.5rem',
      brand1: 'oklch(0.6 0.2 25)',
      brand2: 'oklch(0.5 0.2 15)',
      brand3: 'oklch(0.7 0.16 340)',
    },
  },
  {
    id: 'preset-forest',
    name: 'Forest (Earthy Light)',
    isCustom: false,
    vars: {
      background: 'oklch(0.98 0.01 130)',
      foreground: 'oklch(0.2 0.02 130)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.2 0.02 130)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.2 0.02 130)',
      primary: 'oklch(0.45 0.13 150)',
      primaryForeground: 'oklch(0.98 0 0)',
      secondary: 'oklch(0.95 0.02 130)',
      secondaryForeground: 'oklch(0.3 0.02 130)',
      muted: 'oklch(0.92 0.02 130)',
      mutedForeground: 'oklch(0.5 0.02 130)',
      accent: 'oklch(0.92 0.05 140)',
      accentForeground: 'oklch(0.3 0.05 140)',
      destructive: 'oklch(0.6 0.2 25)',
      destructiveForeground: 'oklch(0.98 0 0)',
      border: 'oklch(0.88 0.02 130)',
      input: 'oklch(0.88 0.02 130)',
      ring: 'oklch(0.45 0.13 150 / 60%)',
      radius: '0.375rem',
      brand1: 'oklch(0.45 0.13 150)',
      brand2: 'oklch(0.55 0.13 160)',
      brand3: 'oklch(0.65 0.13 170)',
    },
  },
  {
    id: 'preset-midnight',
    name: 'Midnight (Deep Dark)',
    isCustom: false,
    vars: {
      background: 'oklch(0.12 0.02 270)',
      foreground: 'oklch(0.98 0 0)',
      card: 'oklch(0.16 0.02 270)',
      cardForeground: 'oklch(0.98 0 0)',
      popover: 'oklch(0.16 0.02 270)',
      popoverForeground: 'oklch(0.98 0 0)',
      primary: 'oklch(0.65 0.18 280)',
      primaryForeground: 'oklch(0.98 0 0)',
      secondary: 'oklch(0.22 0.03 270)',
      secondaryForeground: 'oklch(0.95 0 0)',
      muted: 'oklch(0.20 0.03 270)',
      mutedForeground: 'oklch(0.7 0.02 270)',
      accent: 'oklch(0.22 0.05 280)',
      accentForeground: 'oklch(0.95 0.05 280)',
      destructive: 'oklch(0.6 0.2 25)',
      destructiveForeground: 'oklch(0.98 0 0)',
      border: 'oklch(1 0 0 / 12%)',
      input: 'oklch(1 0 0 / 16%)',
      ring: 'oklch(0.65 0.18 280 / 60%)',
      radius: '0.75rem',
      brand1: 'oklch(0.65 0.18 280)',
      brand2: 'oklch(0.55 0.18 290)',
      brand3: 'oklch(0.45 0.18 300)',
    },
  },
  {
    id: 'preset-monochrome',
    name: 'Monochrome (Minimalist Light)',
    isCustom: false,
    vars: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.1 0 0)',
      card: 'oklch(0.98 0 0)',
      cardForeground: 'oklch(0.1 0 0)',
      popover: 'oklch(0.98 0 0)',
      popoverForeground: 'oklch(0.1 0 0)',
      primary: 'oklch(0.1 0 0)',
      primaryForeground: 'oklch(0.98 0 0)',
      secondary: 'oklch(0.92 0 0)',
      secondaryForeground: 'oklch(0.3 0 0)',
      muted: 'oklch(0.95 0 0)',
      mutedForeground: 'oklch(0.5 0 0)',
      accent: 'oklch(0.92 0 0)',
      accentForeground: 'oklch(0.3 0 0)',
      destructive: 'oklch(0.6 0.2 25)',
      destructiveForeground: 'oklch(0.98 0 0)',
      border: 'oklch(0.85 0 0)',
      input: 'oklch(0.85 0 0)',
      ring: 'oklch(0.1 0 0 / 60%)',
      radius: '0rem',
      brand1: 'oklch(0.1 0 0)',
      brand2: 'oklch(0.3 0 0)',
      brand3: 'oklch(0.5 0 0)',
    },
  },
];
