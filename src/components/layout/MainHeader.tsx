"use client";

import { useMemo } from "react";
import { Search, Bell, User, Paintbrush, Flame, Clock3, Target, ArrowRight } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useContentStore, getTodayFocusMinutes, todayStr } from "@/store/contentStore";
import { useThemeStore } from "@/store/themeStore";
import { HEADER_HEIGHT } from "@/config/layout";

function formatDate(): string {
  return new Date().toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function MainHeader() {
  const { openCommandPalette, openDailyReview, expandWidget } = useDashboardStore();
  const { openThemePicker } = useThemeStore();
  const { tasks, focusLog, dailyStreak } = useContentStore();
  const today = todayStr();

  const { pendingCount, completedToday } = useMemo(() => {
    const pending = tasks.filter((t) => !t.done).length;
    const completed = tasks.filter(
      (t) => t.done && (t.completedAt ?? "").startsWith(today)
    ).length;
    return { pendingCount: pending, completedToday: completed };
  }, [tasks, today]);
  const todayFocus = getTodayFocusMinutes(focusLog);
  const progressTotal = pendingCount + completedToday;
  const progress = progressTotal === 0 ? 0 : Math.round((completedToday / progressTotal) * 100);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header
      className="flex shrink-0 items-center justify-between border-b border-border-muted/60 bg-surface/80 px-6 backdrop-blur-xl"
      style={{ height: HEADER_HEIGHT }}
    >
      {/* Left: title + subtitle */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
              {greeting}
            </p>
            <h1 className="text-lg font-bold tracking-tight text-text-primary">
              What should you focus on today?
            </h1>
          </div>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            {formatDate()}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl bg-base/80 px-3 py-2">
            <Target className="h-4 w-4 text-accent" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-text-muted">
                Progress
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {progress}% complete
                </span>
                <span className="text-[11px] text-text-muted">
                  {pendingCount} open
                </span>
                <div className="h-1.5 w-20 rounded-full bg-base/60">
                  <div
                    className="h-1.5 rounded-full bg-accent"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-base/80 px-3 py-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-text-muted">Streak</p>
              <p className="text-sm font-semibold text-text-primary">
                {dailyStreak} day{dailyStreak === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-base/80 px-3 py-2">
            <Clock3 className="h-4 w-4 text-cyan-300" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-text-muted">
                Focus today
              </p>
              <p className="text-sm font-semibold text-text-primary">
                {todayFocus} minutes
              </p>
            </div>
          </div>

          <button
            onClick={() => expandWidget("pomodoro")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"
          >
            Start focus
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
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
