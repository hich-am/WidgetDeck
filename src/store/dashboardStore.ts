"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Layout, ResponsiveLayouts } from "react-grid-layout";
import type { WidgetId } from "@/types/widget";
import { ALL_WIDGET_IDS, getDefaultLayouts } from "@/config/widgets";

interface DashboardStore {
  layouts: ResponsiveLayouts;
  enabledWidgets: WidgetId[];
  expandedWidget: WidgetId | null;
  commandPaletteOpen: boolean;

  setLayouts: (layouts: ResponsiveLayouts) => void;
  toggleWidget: (id: WidgetId) => void;
  expandWidget: (id: WidgetId) => void;
  collapseWidget: () => void;
  resetLayout: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      layouts: getDefaultLayouts(),
      enabledWidgets: [...ALL_WIDGET_IDS],
      expandedWidget: null,
      commandPaletteOpen: false,

      setLayouts: (layouts) => set({ layouts }),

      toggleWidget: (id) =>
        set((state) => ({
          enabledWidgets: state.enabledWidgets.includes(id)
            ? state.enabledWidgets.filter((w) => w !== id)
            : [...state.enabledWidgets, id],
        })),

      expandWidget: (id) => set({ expandedWidget: id }),
      collapseWidget: () => set({ expandedWidget: null }),

      resetLayout: () =>
        set({
          layouts: getDefaultLayouts(),
          enabledWidgets: [...ALL_WIDGET_IDS],
        }),

      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
    }),
    {
      name: "widgetdeck-layout",
      partialize: (state) => ({
        layouts: state.layouts,
        enabledWidgets: state.enabledWidgets,
      }),
    }
  )
);
