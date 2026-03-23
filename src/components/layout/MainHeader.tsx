"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  Settings,
  User,
  LayoutGrid,
  Columns,
  Copy,
  Paintbrush,
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useContentStore } from "@/store/contentStore";
import { useThemeStore } from "@/store/themeStore";
import GamificationBar from "@/components/GamificationBar";

function formatDate(): string {
  return new Date().toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function MainHeader() {
  const { openCommandPalette, openDailyReview, resetLayout } = useDashboardStore();
  const { openThemePicker } = useThemeStore();
  const { tasks, focusLog } = useContentStore();
  const [activeTab, setActiveTab] = useState<"layout" | "templates" | "settings">("layout");

  const pendingCount = tasks.filter((t) => !t.done).length;

  const todayFocusMin = focusLog
    .filter((s) => s.date === new Date().toISOString().split("T")[0])
    .reduce((a, s) => a + s.minutes, 0);
  const remainingFocusHours = Math.max(0, 8 * 60 - todayFocusMin);
  const focusText = remainingFocusHours >= 60
    ? `${Math.floor(remainingFocusHours / 60)}h ${remainingFocusHours % 60}m`
    : `${remainingFocusHours}m`;

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border-muted/60 bg-surface/80 px-8 backdrop-blur-xl">
      {/* Left: title + subtitle */}
      <div className="flex flex-col">
        <h1 className="text-lg font-bold tracking-tight text-text-primary">Workspace</h1>
        <p className="text-xs text-text-muted">
          {formatDate()} &middot; {pendingCount} tasks · {focusText} focus remaining
        </p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Gamification */}
        <GamificationBar />

        {/* Layout / Templates / Settings tabs */}
        <div className="flex items-center gap-0.5 rounded-xl bg-base p-1">
          {[
            { key: "layout",    icon: LayoutGrid,  label: "Layout" },
            { key: "templates", icon: Copy,         label: "Templates" },
            { key: "settings",  icon: Settings,     label: "Settings" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key as typeof activeTab);
                if (key === "layout") resetLayout();
                if (key === "settings") openDailyReview();
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === key
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Icon buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={openThemePicker}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-base hover:text-accent"
            title="Themes"
          >
            <Paintbrush className="h-4 w-4" />
          </button>
          <button
            onClick={openCommandPalette}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-base hover:text-accent"
            title="Search (⌘K)"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={openDailyReview}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-base hover:text-accent"
            title="Review (R)"
          >
            <Bell className="h-4 w-4" />
            {pendingCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            )}
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors hover:bg-accent/15"
            title="Profile"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
