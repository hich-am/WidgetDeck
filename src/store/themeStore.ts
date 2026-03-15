"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Theme {
  id: string;
  name: string;
  colors: {
    base: string;
    surface: string;
    widget: string;
    borderMuted: string;
    accent: string;
    accentHover: string;
    cyan: string;
    amber: string;
    textPrimary: string;
    textMuted: string;
  };
}

export const THEMES: Theme[] = [
  // ── Light Themes ──
  {
    id: "canvas",
    name: "Canvas",
    colors: {
      base: "#F7F7F9",
      surface: "#FFFFFF",
      widget: "#FFFFFF",
      borderMuted: "#E5E7EB",
      accent: "#6366F1",
      accentHover: "#818CF8",
      cyan: "#34D399",
      amber: "#F59E0B",
      textPrimary: "#111111",
      textMuted: "#6B7280",
    },
  },
  {
    id: "warm-sand",
    name: "Warm Sand",
    colors: {
      base: "#FAF8F5",
      surface: "#FFFFFF",
      widget: "#FFFDFB",
      borderMuted: "#E8E2DA",
      accent: "#D97706",
      accentHover: "#F59E0B",
      cyan: "#059669",
      amber: "#EA580C",
      textPrimary: "#1C1917",
      textMuted: "#78716C",
    },
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    colors: {
      base: "#F0F9FF",
      surface: "#FFFFFF",
      widget: "#FAFEFF",
      borderMuted: "#DBEAFE",
      accent: "#0EA5E9",
      accentHover: "#38BDF8",
      cyan: "#06B6D4",
      amber: "#F59E0B",
      textPrimary: "#0C1E2E",
      textMuted: "#64748B",
    },
  },
  {
    id: "rose-garden",
    name: "Rose Garden",
    colors: {
      base: "#FFF5F7",
      surface: "#FFFFFF",
      widget: "#FFFBFC",
      borderMuted: "#FECDD3",
      accent: "#F43F5E",
      accentHover: "#FB7185",
      cyan: "#EC4899",
      amber: "#F59E0B",
      textPrimary: "#1A1A1A",
      textMuted: "#71717A",
    },
  },
  {
    id: "sage",
    name: "Sage",
    colors: {
      base: "#F4F7F4",
      surface: "#FFFFFF",
      widget: "#FBFDFB",
      borderMuted: "#D4E2D4",
      accent: "#16A34A",
      accentHover: "#22C55E",
      cyan: "#10B981",
      amber: "#EAB308",
      textPrimary: "#14261A",
      textMuted: "#6B7C6B",
    },
  },
  {
    id: "lavender-mist",
    name: "Lavender Mist",
    colors: {
      base: "#F8F5FF",
      surface: "#FFFFFF",
      widget: "#FDFBFF",
      borderMuted: "#E4D5F7",
      accent: "#8B5CF6",
      accentHover: "#A78BFA",
      cyan: "#C084FC",
      amber: "#F59E0B",
      textPrimary: "#1A1025",
      textMuted: "#7C728A",
    },
  },
  {
    id: "coral-sunset",
    name: "Coral Sunset",
    colors: {
      base: "#FFF7F5",
      surface: "#FFFFFF",
      widget: "#FFFDFC",
      borderMuted: "#FFD5CC",
      accent: "#FF6B6B",
      accentHover: "#FF8A8A",
      cyan: "#FB923C",
      amber: "#F59E0B",
      textPrimary: "#1A1111",
      textMuted: "#8A7070",
    },
  },
  {
    id: "monochrome",
    name: "Monochrome",
    colors: {
      base: "#F5F5F5",
      surface: "#FFFFFF",
      widget: "#FFFFFF",
      borderMuted: "#E0E0E0",
      accent: "#333333",
      accentHover: "#555555",
      cyan: "#666666",
      amber: "#999999",
      textPrimary: "#111111",
      textMuted: "#888888",
    },
  },
  // ── Dark Themes ──
  {
    id: "midnight",
    name: "Midnight",
    colors: {
      base: "#0F1115",
      surface: "#161A21",
      widget: "#1D222B",
      borderMuted: "#2A2F38",
      accent: "#6C63FF",
      accentHover: "#8078FF",
      cyan: "#22D3EE",
      amber: "#F59E0B",
      textPrimary: "#E6E8EB",
      textMuted: "#9AA4B2",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    colors: {
      base: "#21222C",
      surface: "#282A36",
      widget: "#2D303D",
      borderMuted: "#44475A",
      accent: "#BD93F9",
      accentHover: "#CFA9FF",
      cyan: "#8BE9FD",
      amber: "#F1FA8C",
      textPrimary: "#F8F8F2",
      textMuted: "#6272A4",
    },
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    colors: {
      base: "#1A1B26",
      surface: "#1F2028",
      widget: "#24283B",
      borderMuted: "#33384D",
      accent: "#7AA2F7",
      accentHover: "#89B4FA",
      cyan: "#7DCFFF",
      amber: "#E0AF68",
      textPrimary: "#C0CAF5",
      textMuted: "#565F89",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    colors: {
      base: "#0A0A12",
      surface: "#12101E",
      widget: "#1A1628",
      borderMuted: "#2A2440",
      accent: "#FF2D95",
      accentHover: "#FF5AAD",
      cyan: "#00FFF0",
      amber: "#FFE500",
      textPrimary: "#EAEAFF",
      textMuted: "#8888AA",
    },
  },
  {
    id: "nord",
    name: "Nord",
    colors: {
      base: "#2E3440",
      surface: "#3B4252",
      widget: "#434C5E",
      borderMuted: "#4C566A",
      accent: "#88C0D0",
      accentHover: "#8FBCBB",
      cyan: "#81A1C1",
      amber: "#EBCB8B",
      textPrimary: "#ECEFF4",
      textMuted: "#D8DEE9",
    },
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    colors: {
      base: "#1E1E2E",
      surface: "#24243A",
      widget: "#2A2A44",
      borderMuted: "#363654",
      accent: "#CBA6F7",
      accentHover: "#D9BEFF",
      cyan: "#89DCEB",
      amber: "#F9E2AF",
      textPrimary: "#CDD6F4",
      textMuted: "#7F849C",
    },
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    colors: {
      base: "#0D1117",
      surface: "#161B22",
      widget: "#1C2128",
      borderMuted: "#30363D",
      accent: "#58A6FF",
      accentHover: "#79B8FF",
      cyan: "#3FB9D0",
      amber: "#D29922",
      textPrimary: "#E6EDF3",
      textMuted: "#7D8590",
    },
  },
  {
    id: "forest",
    name: "Forest",
    colors: {
      base: "#0C110C",
      surface: "#141A14",
      widget: "#1C241C",
      borderMuted: "#2A352A",
      accent: "#4ADE80",
      accentHover: "#6EE7A0",
      cyan: "#2DD4BF",
      amber: "#A3E635",
      textPrimary: "#E4EDE4",
      textMuted: "#7A947A",
    },
  },
];

interface ThemeStore {
  activeThemeId: string;
  themePickerOpen: boolean;
  setTheme: (id: string) => void;
  openThemePicker: () => void;
  closeThemePicker: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      activeThemeId: "canvas",
      themePickerOpen: false,
      setTheme: (id) => set({ activeThemeId: id }),
      openThemePicker: () => set({ themePickerOpen: true }),
      closeThemePicker: () => set({ themePickerOpen: false }),
    }),
    {
      name: "widgetdeck-theme",
      partialize: (state) => ({ activeThemeId: state.activeThemeId }),
    }
  )
);

export function getActiveTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
