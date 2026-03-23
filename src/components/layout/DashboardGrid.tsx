"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
  ResponsiveGridLayout,
  useContainerWidth,
} from "react-grid-layout";
import type { ResponsiveLayouts } from "react-grid-layout";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { DEFAULT_WIDGETS } from "@/config/widgets";
import { widgetComponents } from "@/components/widgets/widgetRegistry";
import WidgetContainer from "@/components/layout/WidgetContainer";

const MARGIN = 20;          // px between cells (both axes)
const HEADER_H = 72;        // MainHeader height
const PADDING_V = 16;       // top+bottom padding inside grid

export default function DashboardGrid() {
  const { layouts, enabledWidgets, onLayoutChange, breakpoints, cols } =
    useDashboardLayout();

  const { width, containerRef, mounted } = useContainerWidth();

  // Measure available height once mounted & on resize
  const [availableH, setAvailableH] = useState<number>(0);

  useEffect(() => {
    const calc = () => setAvailableH(window.innerHeight - HEADER_H);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const enabledWidgetConfigs = useMemo(
    () => DEFAULT_WIDGETS.filter((w) => enabledWidgets.includes(w.id)),
    [enabledWidgets]
  );

  // Find the max row extent used in current layout so we can size rows to fit
  const maxRow = useMemo(() => {
    const lgLayouts = (layouts as ResponsiveLayouts).lg ?? [];
    return lgLayouts.reduce((acc, item) => Math.max(acc, item.y + item.h), 0) || 9;
  }, [layouts]);

  // rowHeight = (totalHeight - top/bottom padding - margins between rows) / maxRow
  const rowHeight = useMemo(() => {
    if (!availableH) return 100;
    const usable = availableH - PADDING_V * 2 - MARGIN * (maxRow - 1);
    return Math.max(60, Math.floor(usable / maxRow));
  }, [availableH, maxRow]);

  return (
    <div
      ref={containerRef}
      className="relative z-10 h-full px-5"
      style={{ paddingTop: PADDING_V, paddingBottom: PADDING_V }}
    >
      {mounted && availableH > 0 && (
        <ResponsiveGridLayout
          className="layout"
          width={width}
          layouts={layouts as ResponsiveLayouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={rowHeight}
          margin={[MARGIN, MARGIN] as const}
          containerPadding={[0, 0] as const}
          onLayoutChange={(_currentLayout: any, allLayouts: any) => {
            onLayoutChange(_currentLayout, allLayouts as ResponsiveLayouts);
          }}
          dragConfig={{ handle: ".widget-drag-handle" }}
        >
          {enabledWidgetConfigs.map((config) => {
            const WidgetContent = widgetComponents[config.id];
            return (
              <div key={config.id}>
                <WidgetContainer id={config.id} title={config.title} icon={config.icon}>
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
