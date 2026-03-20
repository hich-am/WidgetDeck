"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckSquare,
  FileText,
  CalendarDays,
  List,
  Timer,
  Flame,
  Bookmark,
  RotateCcw,
  LayoutGrid,
  Trash2,
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useContentStore } from "@/store/contentStore";
import type { WidgetId } from "@/types/widget";

interface Command {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  section: string;
}

export default function CommandPalette() {
  const {
    commandPaletteOpen,
    closeCommandPalette,
    expandWidget,
    resetLayout,
    toggleWidget,
    enabledWidgets,
  } = useDashboardStore();

  const { resetAll } = useContentStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      {
        id: "open-tasks",
        label: "Open Tasks",
        icon: CheckSquare,
        action: () => expandWidget("tasks"),
        section: "Navigate",
      },
      {
        id: "open-notes",
        label: "Open Notes",
        icon: FileText,
        action: () => expandWidget("notes"),
        section: "Navigate",
      },
      {
        id: "open-calendar",
        label: "Open Calendar",
        icon: CalendarDays,
        action: () => expandWidget("calendar"),
        section: "Navigate",
      },
      {
        id: "open-lists",
        label: "Open Lists",
        icon: List,
        action: () => expandWidget("lists"),
        section: "Navigate",
      },
      {
        id: "open-pomodoro",
        label: "Open Pomodoro",
        icon: Timer,
        action: () => expandWidget("pomodoro"),
        section: "Navigate",
      },
      {
        id: "open-habits",
        label: "Open Habits",
        icon: Flame,
        action: () => expandWidget("habits"),
        section: "Navigate",
      },
      {
        id: "open-bookmarks",
        label: "Open Bookmarks",
        icon: Bookmark,
        action: () => expandWidget("bookmarks"),
        section: "Navigate",
      },
      {
        id: "reset-layout",
        label: "Reset Layout",
        icon: RotateCcw,
        action: () => resetLayout(),
        section: "Actions",
      },
      {
        id: "reset-all-data",
        label: "Clear All Data",
        icon: Trash2,
        action: () => resetAll(),
        section: "Actions",
      },
      ...(
        [
          "tasks",
          "notes",
          "calendar",
          "lists",
          "pomodoro",
          "habits",
          "bookmarks",
        ] as WidgetId[]
      ).map((id) => ({
        id: `toggle-${id}`,
        label: `${enabledWidgets.includes(id) ? "Hide" : "Show"} ${id.charAt(0).toUpperCase() + id.slice(1)} Widget`,
        icon: LayoutGrid,
        action: () => toggleWidget(id),
        section: "Widgets",
      })),
    ],
    [expandWidget, resetLayout, resetAll, toggleWidget, enabledWidgets]
  );

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [query, commands]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const store = useDashboardStore.getState();
        if (store.commandPaletteOpen) {
          closeCommandPalette();
        } else {
          store.openCommandPalette();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closeCommandPalette]);

  const runCommand = useCallback(
    (cmd: Command) => {
      cmd.action();
      closeCommandPalette();
    },
    [closeCommandPalette]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        runCommand(filtered[selectedIndex]);
      } else if (e.key === "Escape") {
        closeCommandPalette();
      }
    },
    [filtered, selectedIndex, runCommand, closeCommandPalette]
  );

  const sections = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const cmd of filtered) {
      const arr = map.get(cmd.section) || [];
      arr.push(cmd);
      map.set(cmd.section, arr);
    }
    return map;
  }, [filtered]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-text-primary/10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommandPalette}
          />

          <motion.div
            className="fixed left-1/2 top-[20%] z-[60] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-3xl border border-border-muted/60 bg-widget"
            style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.08)" }}
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            <div className="flex items-center gap-3 border-b border-border-muted/40 px-6 py-4">
              <Search className="h-5 w-5 text-text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
              />
              <kbd className="rounded-lg border border-border-muted/60 px-2 py-0.5 text-[10px] text-text-muted">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-auto py-2">
              {filtered.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-text-muted">
                  No commands found
                </div>
              )}

              {Array.from(sections.entries()).map(([section, cmds]) => {
                let globalIdx = 0;
                for (const [s, c] of sections.entries()) {
                  if (s === section) break;
                  globalIdx += c.length;
                }

                return (
                  <div key={section}>
                    <div className="px-6 py-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
                      {section}
                    </div>
                    {cmds.map((cmd, i) => {
                      const flatIndex = globalIdx + i;
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => runCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          className={`flex w-full items-center gap-3 px-6 py-3 text-left text-sm transition-colors ${
                            flatIndex === selectedIndex
                              ? "bg-accent/8 text-accent"
                              : "text-text-primary hover:bg-base"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{cmd.label}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border-muted/40 px-6 py-3">
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span>
                  <kbd className="rounded-lg border border-border-muted/60 px-1.5 py-0.5">↑↓</kbd> Navigate
                </span>
                <span>
                  <kbd className="rounded-lg border border-border-muted/60 px-1.5 py-0.5">↵</kbd> Select
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
