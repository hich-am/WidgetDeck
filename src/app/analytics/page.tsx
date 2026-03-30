"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import WidgetContainer from "@/components/layout/WidgetContainer";
import { widgetComponents } from "@/components/widgets/widgetRegistry";

const AnalyticsWidget = widgetComponents.analytics;

export default function AnalyticsPage() {
  return (
    <DashboardShell mainClassName="px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <WidgetContainer
          id="analytics"
          title="Analytics"
          icon="BarChart2"
          hideExpand
          contentClassName="p-6"
        >
          <AnalyticsWidget />
        </WidgetContainer>
      </div>
    </DashboardShell>
  );
}
