/**
 * Report PDF design tokens.
 * Hex values for use in both React-PDF and CSS.
 */

export const reportPdfTheme = {
  colors: {
    primary: "#0F5C2E",
    primaryLight: "#E8F5E9",
    secondary: "#0D47A1",
    secondaryLight: "#E3F2FD",
    accent: "#B45309",
    accentLight: "#FFF3E0",
    neutral: {
      900: "#1a1a1a",
      700: "#334155",
      600: "#475569",
      500: "#64748b",
      400: "#94a3b8",
      200: "#e2e8f0",
      100: "#f1f5f9",
      50: "#f8fafc",
      white: "#ffffff",
    },
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",
  },
  fonts: {
    heading: "Helvetica-Bold",
    body: "Helvetica",
  },
  spacing: {
    pagePadding: 40,
    sectionGap: 24,
    blockGap: 16,
    cardPadding: 16,
    headerBottom: 20,
    footerTop: 16,
  },
  typography: {
    titleSize: 22,
    subtitleSize: 11,
    sectionTitleSize: 14,
    bodySize: 10,
    smallSize: 9,
    kpiValueSize: 18,
    kpiLabelSize: 9,
  },
  radii: {
    card: 6,
    small: 4,
  },
} as const;

export type ReportPdfTheme = typeof reportPdfTheme;
