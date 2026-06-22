// STEP 4 — DESIGN TOKENS. Use these values everywhere. Never deviate.
export const tokens = {
  bg: "#000000",
  textPrimary: "#ffffff",
  textBody: "#E5E5E5",
  accent: "#C8A96E", // Everose gold
  accentHover: "#E8C98E",
  dim: "#888888", // never below this on black
  borderSubtle: "rgba(200,169,110,0.2)",
  fontDisplay: "var(--font-playfair)",
  fontBody: "var(--font-inter)",
} as const;

// Reusable label style: Inter, 0.65rem, letter-spacing 0.25em, uppercase, accent
export const labelStyle: React.CSSProperties = {
  fontFamily: tokens.fontBody,
  fontWeight: 500,
  fontSize: "0.65rem",
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  color: tokens.accent,
};

// Total extracted frames. Update this to match scripts/extract-frames.sh output.
export const FRAME_COUNT = 120;
