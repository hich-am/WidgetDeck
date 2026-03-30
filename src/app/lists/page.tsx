"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import WidgetContainer from "@/components/layout/WidgetContainer";
import { widgetComponents } from "@/components/widgets/widgetRegistry";

const ListsWidget = widgetComponents.lists;

export default function ListsPage() {
  return (
    <DashboardShell mainClassName="px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <WidgetContainer
          id="lists"
          title="Lists"
          icon="List"
          hideExpand
          contentClassName="p-6"
        >
          <ListsWidget />
        </WidgetContainer>
      </div>
    </DashboardShell>
  );
}
