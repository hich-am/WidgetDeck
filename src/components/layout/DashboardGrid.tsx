"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
  ResponsiveGridLayout,
  useContainerWidth,
} from "react-grid-layout";
import type { Layout, ResponsiveLayouts } from "react-grid-layout";
import type { WidgetId } from "@/types/widget";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { DEFAULT_WIDGETS, HOME_WIDGET_IDS } from "@/config/widgets";
import { widgetComponents } from "@/components/widgets/widgetRegistry";
import { widgetPreviewComponents } from "@/components/widgets/widgetPreviews";
import WidgetContainer from "@/components/layout/WidgetContainer";
import { HEADER_HEIGHT } from "@/config/layout";

type LayoutWithMinDimensions = Layout & { minW?: number; minH?: number };

const MARGIN = 20; // px between cells (both axes)
const PADDING_V = 18; // top+bottom padding inside grid
const MIN_ROW_HEIGHT = 68; // keeps preview cards spacious with the 20px grid margin on desktop

export default function DashboardGrid() {
  const { layouts, enabledWidgets, onLayoutChange, breakpoints, cols } =
    useDashboardLayout();

  const { width, containerRef, mounted } = useContainerWidth();

  // Measure available height once mounted & on resize
  const [availableH, setAvailableH] = useState<number>(0);

  useEffect(() => {
    const calc = () => setAvailableH(window.innerHeight - HEADER_HEIGHT);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const visibleWidgets = useMemo(() => {
    const baseline = enabledWidgets.filter((id) => HOME_WIDGET_IDS.includes(id));
    const filled = baseline.length > 0 ? [...baseline] : [...HOME_WIDGET_IDS];

    for (const id of HOME_WIDGET_IDS) {
      if (filled.length >= HOME_WIDGET_IDS.length) break;
      if (!filled.includes(id)) filled.push(id);
    }

    return filled.slice(0, HOME_WIDGET_IDS.length);
  }, [enabledWidgets]);

  const enabledWidgetConfigs = useMemo(
    () => DEFAULT_WIDGETS.filter((w) => visibleWidgets.includes(w.id)),
    [visibleWidgets]
  );

  const defaultLayouts = useMemo(() => {
    const build = (key: "lg" | "md" | "sm") =>
      new Map<WidgetId, LayoutWithMinDimensions>(
        DEFAULT_WIDGETS.map((w) => [
          w.id,
          { ...w.defaultLayout[key], minW: w.minW, minH: w.minH },
        ])
      );
    return { lg: build("lg"), md: build("md"), sm: build("sm") };
  }, []);

  const filteredLayouts = useMemo(() => {
    const resLayouts = layouts as ResponsiveLayouts;
    const build = (key: "lg" | "md" | "sm") => {
      const base = (resLayouts[key] ?? []).filter((item) =>
        visibleWidgets.includes(item.i as WidgetId)
      );
      const baseMap = new Map<WidgetId, LayoutWithMinDimensions>(
        base.map((item) => [item.i as WidgetId, item])
      );

      return visibleWidgets.map((id) => {
        const existing = baseMap.get(id);
        if (existing) return existing;
        const fallback = defaultLayouts[key].get(id as WidgetId);
        return fallback ?? ({ i: id, x: 0, y: 0, w: 3, h: 3 } as LayoutWithMinDimensions);
      });
    };
    return {
      lg: build("lg"),
      md: build("md"),
      sm: build("sm"),
    };
  }, [defaultLayouts, layouts, visibleWidgets]);

  // Find the max row extent used in current layout so we can size rows to fit
  const maxRow = useMemo(() => {
    const lgLayouts = filteredLayouts.lg ?? [];
    if (lgLayouts.length === 0) return 0;
    return lgLayouts.reduce((acc, item) => Math.max(acc, item.y + item.h), 0);
  }, [filteredLayouts]);

  // rowHeight = (totalHeight - top/bottom padding - margins between rows) / maxRow
  const rowHeight = useMemo(() => {
    if (!availableH || !maxRow) return MIN_ROW_HEIGHT;
    const usable = availableH - PADDING_V * 2 - MARGIN * (maxRow - 1);
    const divisor = Math.max(maxRow, 1);
    return Math.max(MIN_ROW_HEIGHT, Math.floor(usable / divisor));
  }, [availableH, maxRow]);

  return (
    <div
      ref={containerRef}
      className="relative z-10 h-full px-6"
      style={{ paddingTop: PADDING_V, paddingBottom: PADDING_V }}
    >
      {mounted && availableH > 0 && (
        <ResponsiveGridLayout
          className="layout"
          width={width}
          layouts={filteredLayouts as ResponsiveLayouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={rowHeight}
          margin={[MARGIN, MARGIN] as const}
          containerPadding={[0, 0] as const}
          onLayoutChange={(currentLayout: Layout[], allLayouts: ResponsiveLayouts) => {
            onLayoutChange(currentLayout, allLayouts);
          }}
          dragConfig={{ handle: ".widget-drag-handle" }}
        >
          {enabledWidgetConfigs.map((config) => {
            const WidgetContent =
              widgetPreviewComponents[config.id] ?? widgetComponents[config.id];
            return (
              <div key={config.id}>
                <WidgetContainer
                  id={config.id}
                  title={config.title}
                  icon={config.icon}
                  contentClassName="space-y-4"
                >
                  <WidgetContent />
                </WidgetContainer>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
