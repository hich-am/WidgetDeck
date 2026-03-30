"use client";

import {
  Search,
  Bell,
  User,
  Paintbrush,
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useContentStore } from "@/store/contentStore";
import { useThemeStore } from "@/store/themeStore";

function formatDate(): string {
  return new Date().toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function MainHeader() {
  const { openCommandPalette, openDailyReview } = useDashboardStore();
  const { openThemePicker } = useThemeStore();
  const { tasks } = useContentStore();

  const pendingCount = tasks.filter((t) => !t.done).length;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-muted/60 bg-surface/80 px-6 backdrop-blur-xl">
      {/* Left: title + subtitle */}
      <div className="flex flex-col">
        <h1 className="text-base font-bold tracking-tight text-text-primary">Workspace</h1>
        <p className="text-[11px] text-text-muted">
          {formatDate()} &middot; {pendingCount} tasks pending
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Icon buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={openThemePicker}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-base hover:text-accent"
            title="Themes"
          >
            <Paintbrush className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={openCommandPalette}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-base hover:text-accent"
            title="Search (⌘K)"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={openDailyReview}
            className="relative flex h-8 w-8 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-base hover:text-accent"
            title="Review (R)"
          >
            <Bell className="h-3.5 w-3.5" />
            {pendingCount > 0 && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />
            )}
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors hover:bg-accent/15"
            title="Profile"
          >
            <User className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
