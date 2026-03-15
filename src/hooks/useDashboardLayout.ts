"use client";

import { useCallback } from "react";
import type { Layout, ResponsiveLayouts } from "react-grid-layout";
import { useDashboardStore } from "@/store/dashboardStore";
import { getDefaultLayouts } from "@/config/widgets";

export function useDashboardLayout() {
  const { layouts, setLayouts, enabledWidgets, resetLayout } =
    useDashboardStore();

  const onLayoutChange = useCallback(
    (_currentLayout: Layout, allLayouts: ResponsiveLayouts) => {
      setLayouts(allLayouts);
    },
    [setLayouts]
  );

  const breakpoints = { lg: 1200, md: 768, sm: 0 };
  const cols = { lg: 12, md: 10, sm: 6 };

  return {
    layouts: layouts || getDefaultLayouts(),
    enabledWidgets,
    onLayoutChange,
    breakpoints,
    cols,
    resetLayout,
  };
}
