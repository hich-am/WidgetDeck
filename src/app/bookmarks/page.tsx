"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import WidgetContainer from "@/components/layout/WidgetContainer";
import { widgetComponents } from "@/components/widgets/widgetRegistry";

const BookmarksWidget = widgetComponents.bookmarks;

export default function BookmarksPage() {
  return (
    <DashboardShell mainClassName="px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <WidgetContainer
          id="bookmarks"
          title="Bookmarks"
          icon="Bookmark"
          hideExpand
          contentClassName="p-6"
        >
          <BookmarksWidget />
        </WidgetContainer>
      </div>
    </DashboardShell>
  );
}
