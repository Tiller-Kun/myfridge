export const colors = {
  background: "#FFFFFF",
  surface: "#F5F5F4",
  text: "#1C1917",
  textMuted: "#78716C",
  primary: "#16A34A",
  border: "#E7E5E4",
  cream: "#FBF5EA",
  card: "#FFFFFF",
  accent: "#9A5B2E",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const fontSizes = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
} as const;

export const difficultyColors = {
  Easy: { background: "#DCF1DF", text: "#2F6B3A" },
  Medium: { background: "#FCEBC4", text: "#8A5A00" },
  Hard: { background: "#F9D9D6", text: "#9B3A32" },
} as const;
