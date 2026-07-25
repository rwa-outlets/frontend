/**
 * RWA Outlets - Design Tokens (JavaScript Export)
 * 
 * This file exports all design tokens from DESIGN.md for programmatic use
 * in React components, animations, and dynamic styling.
 */

// ===========================================================================
// DARK MODE TOKENS (Default)
// ===========================================================================

export const darkTokens = {
  // Surface Colors
  surface: '#0c150f',
  surfaceDim: '#0c150f',
  surfaceBright: '#323c34',
  surfaceContainerLowest: '#07100a',
  surfaceContainerLow: '#141e17',
  surfaceContainer: '#18221b',
  surfaceContainerHigh: '#232c25',
  surfaceContainerHighest: '#2d3730',
  
  // On-Surface Colors
  onSurface: '#dae5db',
  onSurfaceVariant: '#b9cbbd',
  inverseSurface: '#dae5db',
  inverseOnSurface: '#29332c',
  outline: '#849588',
  outlineVariant: '#3a4a3f',
  
  // Primary Palette
  primary: '#f5fff5',
  onPrimary: '#003920',
  primaryContainer: '#00ffa3',
  onPrimaryContainer: '#007146',
  inversePrimary: '#006d43',
  primaryFixed: '#52ffac',
  primaryFixedDim: '#00e290',
  onPrimaryFixed: '#002111',
  onPrimaryFixedVariant: '#005231',
  surfaceTint: '#00e290',
  
  // Secondary Palette
  secondary: '#d1bcff',
  onSecondary: '#3c0090',
  secondaryContainer: '#7000ff',
  onSecondaryContainer: '#ddcdff',
  secondaryFixed: '#e9ddff',
  secondaryFixedDim: '#d1bcff',
  onSecondaryFixed: '#23005b',
  onSecondaryFixedVariant: '#5700c9',
  
  // Tertiary Palette
  tertiary: '#fffbff',
  onTertiary: '#3b2f00',
  tertiaryContainer: '#ffdd67',
  onTertiaryContainer: '#766000',
  tertiaryFixed: '#ffe17b',
  tertiaryFixedDim: '#e4c451',
  onTertiaryFixed: '#231b00',
  onTertiaryFixedVariant: '#564500',
  
  // Error Palette
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  
  // Background
  background: '#0c150f',
  onBackground: '#dae5db',
  surfaceVariant: '#2d3730',
  
  // Glass System
  surfaceGlass: 'rgba(255, 255, 255, 0.04)',
  borderGlass: 'rgba(255, 255, 255, 0.12)',
  
  // Neon Accents
  neonCyan: '#00F0FF',
  neonGreen: '#00ffa3',
  neonViolet: '#7000ff',
  neonGold: '#ffdd67',
  neonError: '#ffb4ab',
  
  // Special Colors
  deepVoid: '#020408',
};

// ===========================================================================
// LIGHT MODE TOKENS (Inverted)
// ===========================================================================

export const lightTokens = {
  // Surface Colors - Inverted
  surface: '#f5faf7',
  surfaceDim: '#f5faf7',
  surfaceBright: '#c8d5ca',
  surfaceContainerLowest: '#fefdfc',
  surfaceContainerLow: '#f2f9f4',
  surfaceContainer: '#ecf4ee',
  surfaceContainerHigh: '#e4eee8',
  surfaceContainerHighest: '#dbe7e1',
  
  // On-Surface Colors - Dark
  onSurface: '#1a2e1f',
  onSurfaceVariant: '#43544a',
  inverseSurface: '#1a2e1f',
  inverseOnSurface: '#f0fbf4',
  outline: '#73887a',
  outlineVariant: '#c4d4c8',
  
  // Primary Palette - Dark variants
  primary: '#003920',
  onPrimary: '#f5fff5',
  primaryContainer: '#005231',
  onPrimaryContainer: '#52ffac',
  inversePrimary: '#52ffac',
  primaryFixed: '#007146',
  primaryFixedDim: '#005231',
  onPrimaryFixed: '#dae5db',
  onPrimaryFixedVariant: '#00ffa3',
  surfaceTint: '#005231',
  
  // Secondary Palette
  secondary: '#5700c9',
  onSecondary: '#e9ddff',
  secondaryContainer: '#d1bcff',
  onSecondaryContainer: '#3c0090',
  secondaryFixed: '#3c0090',
  secondaryFixedDim: '#5700c9',
  onSecondaryFixed: '#ffffff',
  onSecondaryFixedVariant: '#d1bcff',
  
  // Tertiary Palette
  tertiary: '#564500',
  onTertiary: '#ffe17b',
  tertiaryContainer: '#766000',
  onTertiaryContainer: '#fffbff',
  tertiaryFixed: '#231b00',
  tertiaryFixedDim: '#564500',
  onTertiaryFixed: '#ffffff',
  onTertiaryFixedVariant: '#ffe17b',
  
  // Error Palette
  error: '#690005',
  onError: '#ffb4ab',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  
  // Background
  background: '#f5faf7',
  onBackground: '#1a2e1f',
  surfaceVariant: '#dbe7e1',
  
  // Glass System - Darker for contrast
  surfaceGlass: 'rgba(0, 50, 30, 0.04)',
  borderGlass: 'rgba(0, 50, 30, 0.10)',
  
  // Neon Accents - More subtle in light mode
  neonCyan: '#006680',
  neonGreen: '#005231',
  neonViolet: '#5700c9',
  neonGold: '#766000',
  neonError: '#93000a',
  
  // Special Colors
  deepVoid: '#f5faf7',
};

// ===========================================================================
// TYPOGRAPHY TOKENS
// ===========================================================================

export const typography = {
  fontDisplay: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
  
  displayXl: {
    fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: '72px',
    fontWeight: '800',
    lineHeight: '80px',
    letterSpacing: '-0.04em',
  },
  headlineLg: {
    fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: '40px',
    fontWeight: '700',
    lineHeight: '48px',
    letterSpacing: '-0.02em',
  },
  headlineLgMobile: {
    fontSize: '32px',
    lineHeight: '40px',
  },
  bodyMd: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '24px',
  },
  labelMono: {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '16px',
    letterSpacing: '0.08em',
  },
};

// ===========================================================================
// SPACING TOKENS (8px base)
// ===========================================================================

export const spacing = {
  base: '8px',
  xs: '4px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
  containerPadding: '2rem',
  gutter: '1.5rem',
  outletGap: '4rem',
};

// ===========================================================================
// ROUNDED CORNER TOKENS
// ===========================================================================

export const rounded = {
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
  interactive: '1rem',
};

// ===========================================================================
// ELEVATION / BLUR TOKENS
// ===========================================================================

export const blur = {
  level1: '20px',
  level2: '40px',
  level3: '60px',
};

// ===========================================================================
// LAYOUT TOKENS
// ===========================================================================

export const layout = {
  maxWidth: '1440px',
  sidebarWidth: '280px',
  sidebarCollapsedWidth: '80px',
  topbarHeight: '72px',
};

// ===========================================================================
// TRANSITION TOKENS
// ===========================================================================

export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '400ms ease',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// ===========================================================================
// Z-INDEX SCALE
// ===========================================================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
};

// ===========================================================================
// POOL TYPE COLORS
// ===========================================================================

export const poolColors = {
  express: {
    background: 'rgba(0, 255, 163, 0.1)',
    border: '#00ffa3',
    text: '#00ffa3',
    glow: '0 0 20px rgba(0, 255, 163, 0.3)',
  },
  patient: {
    background: 'rgba(112, 0, 255, 0.1)',
    border: '#7000ff',
    text: '#d1bcff',
    glow: '0 0 20px rgba(112, 0, 255, 0.3)',
  },
  market: {
    background: 'rgba(255, 221, 103, 0.1)',
    border: '#ffdd67',
    text: '#ffdd67',
    glow: '0 0 20px rgba(255, 221, 103, 0.3)',
  },
};

// ===========================================================================
// STATUS COLORS
// ===========================================================================

export const statusColors = {
  active: {
    background: 'rgba(0, 255, 163, 0.1)',
    border: '#00ffa3',
    text: '#00ffa3',
    dot: '#00ffa3',
    glow: '0 0 10px #00ffa3',
  },
  pending: {
    background: 'rgba(255, 221, 103, 0.1)',
    border: '#ffdd67',
    text: '#ffdd67',
    dot: '#ffdd67',
    glow: '0 0 10px #ffdd67',
  },
  settled: {
    background: 'rgba(0, 255, 163, 0.1)',
    border: '#00ffa3',
    text: '#00ffa3',
    dot: '#00ffa3',
    glow: '0 0 10px #00ffa3',
  },
  claimable: {
    background: 'rgba(0, 255, 163, 0.2)',
    border: '#00ffa3',
    text: '#00ffa3',
    dot: '#00ffa3',
    glow: '0 0 15px #00ffa3',
  },
  claimed: {
    background: 'rgba(112, 0, 255, 0.1)',
    border: '#7000ff',
    text: '#d1bcff',
    dot: '#7000ff',
    glow: '0 0 10px #7000ff',
  },
  error: {
    background: 'rgba(255, 180, 171, 0.1)',
    border: '#ffb4ab',
    text: '#ffb4ab',
    dot: '#ffb4ab',
    glow: '0 0 10px #ffb4ab',
  },
};

// ===========================================================================
// ASSET COLORS
// ===========================================================================

export const assetColors = {
  USDC: {
    background: 'rgba(0, 255, 163, 0.1)',
    border: '#00ffa3',
    text: '#00ffa3',
  },
  RWAT: {
    background: 'rgba(112, 0, 255, 0.1)',
    border: '#7000ff',
    text: '#d1bcff',
  },
  rwaTBILL: {
    background: 'rgba(0, 255, 163, 0.1)',
    border: '#00ffa3',
    text: '#00ffa3',
  },
  rwaCREDIT: {
    background: 'rgba(112, 0, 255, 0.1)',
    border: '#7000ff',
    text: '#d1bcff',
  },
  REALT: {
    background: 'rgba(255, 221, 103, 0.1)',
    border: '#ffdd67',
    text: '#ffdd67',
  },
};

// ===========================================================================
// MAIN EXPORT
// ===========================================================================

export const tokens = {
  dark: darkTokens,
  light: lightTokens,
  typography,
  spacing,
  rounded,
  blur,
  layout,
  transitions,
  zIndex,
  poolColors,
  statusColors,
  assetColors,
};

export default tokens;
