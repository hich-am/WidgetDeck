"use client";

import React, { useMemo } from "react";
import {
  ResponsiveGridLayout,
  useContainerWidth,
} from "react-grid-layout";
import type { Layout, ResponsiveLayouts } from "react-grid-layout";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { DEFAULT_WIDGETS } from "@/config/widgets";
import { widgetComponents } from "@/components/widgets/widgetRegistry";
import WidgetContainer from "@/components/layout/WidgetContainer";

export default function DashboardGrid() {
  const { layouts, enabledWidgets, onLayoutChange, breakpoints, cols } =
    useDashboardLayout();

  const { width, containerRef, mounted } = useContainerWidth();

  const enabledWidgetConfigs = useMemo(
    () => DEFAULT_WIDGETS.filter((w) => enabledWidgets.includes(w.id)),
    [enabledWidgets]
  );

  return (
    <div ref={containerRef} className="relative z-10 min-h-screen px-4 pb-8 pt-4">
      {mounted && (
        <ResponsiveGridLayout
          className="layout"
          width={width}
          layouts={layouts as ResponsiveLayouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={100}
          margin={[16, 16] as const}
          containerPadding={[0, 0] as const}
          onLayoutChange={(currentLayout: Layout, allLayouts: ResponsiveLayouts) => {
            onLayoutChange(currentLayout, allLayouts);
          }}
          dragConfig={{
            handle: ".widget-drag-handle",
          }}
        >
          {enabledWidgetConfigs.map((config) => {
            const WidgetContent = widgetComponents[config.id];
            return (
              <div key={config.id}>
                <WidgetContainer
                  id={config.id}
                  title={config.title}
                  icon={config.icon}
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
