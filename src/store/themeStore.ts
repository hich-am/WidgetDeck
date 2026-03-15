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
    id: "ocean",
    name: "Ocean",
    colors: {
      base: "#0B1121",
      surface: "#111827",
      widget: "#1A2332",
      borderMuted: "#253040",
      accent: "#3B82F6",
      accentHover: "#60A5FA",
      cyan: "#06B6D4",
      amber: "#F59E0B",
      textPrimary: "#E2E8F0",
      textMuted: "#94A3B8",
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    colors: {
      base: "#0A1410",
      surface: "#111D17",
      widget: "#1A2820",
      borderMuted: "#263830",
      accent: "#10B981",
      accentHover: "#34D399",
      cyan: "#2DD4BF",
      amber: "#FBBF24",
      textPrimary: "#E2F0E8",
      textMuted: "#8AAFA0",
    },
  },
  {
    id: "rose",
    name: "Rosé",
    colors: {
      base: "#140B10",
      surface: "#1D1118",
      widget: "#281A22",
      borderMuted: "#3A2630",
      accent: "#F43F5E",
      accentHover: "#FB7185",
      cyan: "#EC4899",
      amber: "#F59E0B",
      textPrimary: "#F0E2E6",
      textMuted: "#B09AA2",
    },
  },
  {
    id: "amber",
    name: "Amber Glow",
    colors: {
      base: "#141008",
      surface: "#1D1A0F",
      widget: "#282318",
      borderMuted: "#3A3420",
      accent: "#F59E0B",
      accentHover: "#FBBF24",
      cyan: "#FB923C",
      amber: "#FCD34D",
      textPrimary: "#F0ECE2",
      textMuted: "#B0A890",
    },
  },
  {
    id: "purple-haze",
    name: "Purple Haze",
    colors: {
      base: "#100B18",
      surface: "#180F24",
      widget: "#221830",
      borderMuted: "#332840",
      accent: "#A855F7",
      accentHover: "#C084FC",
      cyan: "#8B5CF6",
      amber: "#F59E0B",
      textPrimary: "#EDE2F4",
      textMuted: "#A094B0",
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
    id: "monokai",
    name: "Monokai",
    colors: {
      base: "#1E1F1C",
      surface: "#272822",
      widget: "#2F302A",
      borderMuted: "#3E3D32",
      accent: "#A6E22E",
      accentHover: "#B8F340",
      cyan: "#66D9EF",
      amber: "#FD971F",
      textPrimary: "#F8F8F2",
      textMuted: "#88846F",
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
    id: "solarized",
    name: "Solarized Dark",
    colors: {
      base: "#002B36",
      surface: "#073642",
      widget: "#0D3E4B",
      borderMuted: "#1A4D5A",
      accent: "#268BD2",
      accentHover: "#4CA2E0",
      cyan: "#2AA198",
      amber: "#B58900",
      textPrimary: "#EEE8D5",
      textMuted: "#839496",
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
    id: "one-dark",
    name: "One Dark",
    colors: {
      base: "#1E2127",
      surface: "#282C34",
      widget: "#2C313A",
      borderMuted: "#3E4451",
      accent: "#61AFEF",
      accentHover: "#7EC0F5",
      cyan: "#56B6C2",
      amber: "#E5C07B",
      textPrimary: "#ABB2BF",
      textMuted: "#636D7D",
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
      activeThemeId: "midnight",
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
