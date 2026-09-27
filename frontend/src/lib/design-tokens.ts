/**
 * Tokens de diseño XAMA-ONG
 * Fuente única de verdad para colores, tipografía, sombras, radios...
 * Uso: import { tokens } from "@/lib/design-tokens"
 */

export const tokens = {
  // ─── Paleta principal (basada en emerald) ───
  colors: {
    primary: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",  // ← color principal
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },
    // Estados
    success: "#059669",
    warning: "#f59e0b",
    danger: "#dc2626",
    info: "#3b82f6",
    // Superficies
    surface: {
      light: "#ffffff",
      subtle: "#f8fafc",
      muted: "#f1f5f9",
      dark: "#0f172a",
      darkSubtle: "#1e293b",
    },
    // Texto
    text: {
      primary: "#0f172a",
      secondary: "#475569",
      muted: "#94a3b8",
      inverse: "#ffffff",
    },
  },

  // ─── Espaciado y radios ───
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
  },

  // ─── Sombras ───
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    // Sombra especial "verde" para CTA principal
    primary:
      "0 4px 14px 0 rgba(5, 150, 105, 0.25), 0 2px 4px 0 rgba(5, 150, 105, 0.1)",
    primaryHover:
      "0 6px 20px 0 rgba(5, 150, 105, 0.35), 0 4px 8px 0 rgba(5, 150, 105, 0.15)",
  },

  // ─── Transiciones ───
  transition: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

// ─── Colores semánticos para gráficos ───
export const chartColors = {
  emerald: "#10b981",
  green: "#22c55e",
  amber: "#f59e0b",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  rose: "#ef4444",
  slate: "#64748b",
};
