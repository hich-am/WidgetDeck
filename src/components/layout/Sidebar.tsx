"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  FileText,
  CalendarDays,
  Flame,
  Timer,
  Bookmark,
  List,
  BarChart2,
  Plus,
  HelpCircle,
  Archive,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import type { WidgetId } from "@/types/widget";

const navItems: { id: WidgetId; label: string; icon: React.ElementType }[] = [
  { id: "tasks",     label: "Tasks",     icon: CheckSquare },
  { id: "notes",     label: "Notes",     icon: FileText },
  { id: "calendar",  label: "Calendar",  icon: CalendarDays },
  { id: "habits",    label: "Habits",    icon: Flame },
  { id: "pomodoro",  label: "Pomodoro",  icon: Timer },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "lists",     label: "Lists",     icon: List },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
];

export default function Sidebar() {
  const { expandWidget, enabledWidgets, toggleWidget, openCommandPalette } = useDashboardStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex h-screen shrink-0 flex-col border-r border-border-muted/60 bg-surface/80 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-3 border-b border-border-muted/40 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10">
          <LayoutGrid className="h-5 w-5 text-accent" />
        </div>
        {!collapsed && (
          <span className="text-base font-bold tracking-tight text-text-primary">WidgetDeck</span>
        )}
      </div>

      {/* Nav */}
      <div className="flex flex-1 flex-col gap-1 overflow-hidden px-2 py-4">
        {!collapsed && (
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Productivity
          </p>
        )}

        {navItems.map(({ id, label, icon: Icon }) => {
          const isEnabled = enabledWidgets.includes(id);
          return (
            <motion.button
              key={id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => expandWidget(id)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isEnabled
                  ? "text-text-primary hover:bg-base"
                  : "text-text-muted/50 hover:text-text-muted"
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isEnabled ? "text-accent" : "text-text-muted/40"}`} />
              {!collapsed && <span className="flex-1 text-left">{label}</span>}
              {!collapsed && isEnabled && (
                <ChevronRight className="h-3 w-3 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="border-t border-border-muted/40 px-2 py-3 space-y-1">
        <button
          onClick={openCommandPalette}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-base hover:text-accent"
          title={collapsed ? "Add widget" : undefined}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Add Widget</span>}
        </button>
        <button
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-base hover:text-text-primary"
          title={collapsed ? "Support" : undefined}
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Support</span>}
        </button>
        <button
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-base hover:text-text-primary"
          title={collapsed ? "Archive" : undefined}
        >
          <Archive className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Archive</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-[82px] flex h-6 w-6 items-center justify-center rounded-full border border-border-muted/60 bg-surface text-text-muted shadow-sm hover:text-accent"
      >
        <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
      </button>
    </aside>
  );
}
