"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Theme {
  id: string;
  name: string;
  category: "light" | "dark";
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
    category: "light",
    colors: {
      base: "#F7F7F9",
      surface: "#FFFFFF",
      widget: "#FFFFFF",
      borderMuted: "#E8E8ED",
      accent: "#5B8DEF",
      accentHover: "#7DA5F3",
      cyan: "#5CB99A",
      amber: "#E8956A",
      textPrimary: "#1A1A2E",
      textMuted: "#8E8EA0",
    },
  },
  {
    id: "warm-sand",
    name: "Warm Sand",
    category: "light",
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
    category: "light",
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
    category: "light",
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
    category: "light",
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
    category: "light",
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
    category: "light",
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
    category: "light",
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
  {
    id: "peach-blossom",
    name: "Peach Blossom",
    category: "light",
    colors: {
      base: "#FFF8F3",
      surface: "#FFFFFF",
      widget: "#FFFCFA",
      borderMuted: "#F5D5C8",
      accent: "#E8794F",
      accentHover: "#F09572",
      cyan: "#F472B6",
      amber: "#FB923C",
      textPrimary: "#2D1810",
      textMuted: "#9C7B6E",
    },
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh",
    category: "light",
    colors: {
      base: "#F0FDF9",
      surface: "#FFFFFF",
      widget: "#F8FEFB",
      borderMuted: "#C6F0E0",
      accent: "#0D9488",
      accentHover: "#14B8A6",
      cyan: "#06B6D4",
      amber: "#F59E0B",
      textPrimary: "#0F2620",
      textMuted: "#5B8A7C",
    },
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    category: "light",
    colors: {
      base: "#FFFDF5",
      surface: "#FFFFFF",
      widget: "#FFFEF9",
      borderMuted: "#F0E4C0",
      accent: "#CA8A04",
      accentHover: "#EAB308",
      cyan: "#D97706",
      amber: "#EA580C",
      textPrimary: "#1C1508",
      textMuted: "#8E7D54",
    },
  },
  {
    id: "nordic-snow",
    name: "Nordic Snow",
    category: "light",
    colors: {
      base: "#F3F5F7",
      surface: "#FAFBFC",
      widget: "#FFFFFF",
      borderMuted: "#D9DFE6",
      accent: "#4B7BEC",
      accentHover: "#6C93F0",
      cyan: "#45AAF2",
      amber: "#FED330",
      textPrimary: "#1A2333",
      textMuted: "#8896A6",
    },
  },
  {
    id: "honey-cream",
    name: "Honey Cream",
    category: "light",
    colors: {
      base: "#FDF9F0",
      surface: "#FFFDF7",
      widget: "#FFFEF9",
      borderMuted: "#EBE0CC",
      accent: "#B45309",
      accentHover: "#D97706",
      cyan: "#0891B2",
      amber: "#D97706",
      textPrimary: "#271D0B",
      textMuted: "#957A54",
    },
  },
  // ── Dark Themes ──
  {
    id: "midnight",
    name: "Midnight",
    category: "dark",
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
    category: "dark",
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
    category: "dark",
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
    category: "dark",
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
    category: "dark",
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
    category: "dark",
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
    category: "dark",
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
    category: "dark",
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
  {
    id: "nebula",
    name: "Nebula",
    category: "dark",
    colors: {
      base: "#110B1C",
      surface: "#1A1228",
      widget: "#221A34",
      borderMuted: "#352A4E",
      accent: "#E879F9",
      accentHover: "#F0ABFC",
      cyan: "#A78BFA",
      amber: "#F9A8D4",
      textPrimary: "#F0E6FF",
      textMuted: "#9580B5",
    },
  },
  {
    id: "monokai-pro",
    name: "Monokai Pro",
    category: "dark",
    colors: {
      base: "#191919",
      surface: "#222222",
      widget: "#2C2C2C",
      borderMuted: "#3A3A3A",
      accent: "#FFD866",
      accentHover: "#FFE08A",
      cyan: "#78DCE8",
      amber: "#FC9867",
      textPrimary: "#FCFCFA",
      textMuted: "#939293",
    },
  },
  {
    id: "aurora-borealis",
    name: "Aurora",
    category: "dark",
    colors: {
      base: "#0A1014",
      surface: "#101820",
      widget: "#162028",
      borderMuted: "#1E3040",
      accent: "#22D3EE",
      accentHover: "#67E8F9",
      cyan: "#34D399",
      amber: "#A78BFA",
      textPrimary: "#E0F2FE",
      textMuted: "#7AA8C0",
    },
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    category: "dark",
    colors: {
      base: "#0A0E1A",
      surface: "#101526",
      widget: "#161D32",
      borderMuted: "#232E48",
      accent: "#3B82F6",
      accentHover: "#60A5FA",
      cyan: "#06B6D4",
      amber: "#FBBF24",
      textPrimary: "#D6E0F0",
      textMuted: "#6B82A8",
    },
  },
  {
    id: "ember-glow",
    name: "Ember Glow",
    category: "dark",
    colors: {
      base: "#1A0E0A",
      surface: "#241410",
      widget: "#2E1C16",
      borderMuted: "#442A20",
      accent: "#F97316",
      accentHover: "#FB923C",
      cyan: "#FBBF24",
      amber: "#EF4444",
      textPrimary: "#FDE8D8",
      textMuted: "#B08770",
    },
  },
];

interface ThemeStore {
  activeThemeId: string;
  themePickerOpen: boolean;
  uiMode: "minimal" | "advanced";
  ambientSound: string | null;
  ambientVolume: number;
  setTheme: (id: string) => void;
  openThemePicker: () => void;
  closeThemePicker: () => void;
  setUiMode: (mode: "minimal" | "advanced") => void;
  setAmbientSound: (sound: string | null) => void;
  setAmbientVolume: (volume: number) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      activeThemeId: "canvas",
      themePickerOpen: false,
      uiMode: "advanced",
      ambientSound: null,
      ambientVolume: 0.5,
      setTheme: (id) => set({ activeThemeId: id }),
      openThemePicker: () => set({ themePickerOpen: true }),
      closeThemePicker: () => set({ themePickerOpen: false }),
      setUiMode: (mode) => set({ uiMode: mode }),
      setAmbientSound: (sound) => set({ ambientSound: sound }),
      setAmbientVolume: (volume) => set({ ambientVolume: volume }),
    }),
    {
      name: "widgetdeck-theme",
      partialize: (state) => ({
        activeThemeId: state.activeThemeId,
        uiMode: state.uiMode,
        ambientSound: state.ambientSound,
        ambientVolume: state.ambientVolume,
      }),
    }
  )
);

export function getActiveTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
