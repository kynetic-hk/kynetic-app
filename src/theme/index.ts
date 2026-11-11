// Kynetic design tokens — dark base with the brand orange.
// TODO: swap `orange` for the exact hex from the logo file once confirmed.
export const colors = {
  bg: '#0E0E10',
  surface: '#17171A',
  surfaceHigh: '#212126',
  border: '#2A2A30',
  text: '#F5F5F7',
  textDim: '#A1A1AA',
  textMute: '#6B6B75',
  orange: '#FF6B1A',
  orangeDim: '#FF6B1A26', // 15% alpha, for tints
  good: '#3DDC97',
  warn: '#FFC23D',
  bad: '#FF4D5E',
  left: '#FF6B1A', // left side in L/R charts
  right: '#F5F5F7', // right side in L/R charts
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
