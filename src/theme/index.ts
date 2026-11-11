// Kynetic design tokens — from the "Kynetic Final Colour Palette":
// FFFBF5 cream · B9B9B9 light grey · 666666 grey · 202020 charcoal · FF7700 orange · 30BABA teal
export const colors = {
  bg: '#202020', // palette charcoal
  surface: 'rgba(42,42,42,0.72)', // charcoal glass for cards (background glows through)
  surfaceHigh: 'rgba(60,60,60,0.75)',
  surfaceSolid: '#2A2A2A',
  border: 'rgba(255,251,245,0.09)',
  text: '#FFFBF5', // palette cream
  textDim: '#B9B9B9', // palette light grey
  textMute: '#8A8A8A', // between palette greys, readable on charcoal
  grey: '#666666', // palette grey (inactive bits)
  orange: '#FF7700', // palette orange (primary)
  orangeDim: '#FF770026', // 15% alpha, for tints
  teal: '#30BABA', // palette teal (secondary accent)
  good: '#30BABA',
  warn: '#FFC23D',
  bad: '#FF4D5E',
  left: '#FF7700', // left side in L/R charts
  right: '#30BABA', // right side in L/R charts
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radius = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 };

export const type = {
  display: { fontSize: 40, fontWeight: '800' as const, letterSpacing: -1.2, color: colors.text },
  h1: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.8, color: colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.4, color: colors.text },
  h3: { fontSize: 17, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.text, lineHeight: 22 },
  small: { fontSize: 14, fontWeight: '400' as const, color: colors.textDim, lineHeight: 19 },
  label: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 1.2, color: colors.textMute, textTransform: 'uppercase' as const },
  number: { fontSize: 34, fontWeight: '800' as const, color: colors.text, fontVariant: ['tabular-nums' as const] },
};

/** Colour for a 0–100 score. */
export const scoreColor = (s: number) => (s >= 85 ? colors.good : s >= 65 ? colors.orange : s >= 45 ? colors.warn : colors.bad);
