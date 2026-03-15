"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FolderGit2,
  Palette,
  Mail,
  RotateCcw,
  BarChart3,
  User,
  Trophy,
  Clock,
  LayoutGrid,
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
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

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      {
        id: "open-about",
        label: "Open About",
        icon: User,
        action: () => expandWidget("about"),
        section: "Navigate",
      },
      {
        id: "open-projects",
        label: "Open Projects",
        icon: FolderGit2,
        action: () => expandWidget("projects"),
        section: "Navigate",
      },
      {
        id: "open-skills",
        label: "Open Skills",
        icon: BarChart3,
        action: () => expandWidget("skills"),
        section: "Navigate",
      },
      {
        id: "open-design",
        label: "Open Design",
        icon: Palette,
        action: () => expandWidget("design"),
        section: "Navigate",
      },
      {
        id: "open-achievements",
        label: "Open Achievements",
        icon: Trophy,
        action: () => expandWidget("achievements"),
        section: "Navigate",
      },
      {
        id: "open-timeline",
        label: "Open Timeline",
        icon: Clock,
        action: () => expandWidget("timeline"),
        section: "Navigate",
      },
      {
        id: "open-contact",
        label: "Open Contact",
        icon: Mail,
        action: () => expandWidget("contact"),
        section: "Navigate",
      },
      {
        id: "reset-layout",
        label: "Reset Layout",
        icon: RotateCcw,
        action: () => resetLayout(),
        section: "Actions",
      },
      ...(
        [
          "about",
          "projects",
          "skills",
          "design",
          "achievements",
          "timeline",
          "contact",
        ] as WidgetId[]
      ).map((id) => ({
        id: `toggle-${id}`,
        label: `${enabledWidgets.includes(id) ? "Hide" : "Show"} ${id.charAt(0).toUpperCase() + id.slice(1)} Widget`,
        icon: LayoutGrid,
        action: () => toggleWidget(id),
        section: "Widgets",
      })),
    ],
    [expandWidget, resetLayout, toggleWidget, enabledWidgets]
  );

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [query, commands]);

  // Reset state when opening
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Global keyboard shortcut
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

  // Keyboard navigation inside palette
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

  // Group by section
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
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommandPalette}
          />

          {/* Palette */}
          <motion.div
            className="fixed left-1/2 top-[20%] z-[60] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-border-muted bg-widget shadow-2xl"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-border-muted px-4 py-3">
              <Search className="h-4 w-4 text-text-muted" />
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
              <kbd className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-auto py-2">
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-text-muted">
                  No commands found
                </div>
              )}

              {Array.from(sections.entries()).map(([section, cmds]) => {
                let globalIdx = 0;
                // Calculate flattened index offset for this section
                for (const [s, c] of sections.entries()) {
                  if (s === section) break;
                  globalIdx += c.length;
                }

                return (
                  <div key={section}>
                    <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
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
                          className={`flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition-colors ${
                            flatIndex === selectedIndex
                              ? "bg-accent/10 text-accent"
                              : "text-text-primary hover:bg-surface"
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

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border-muted px-4 py-2">
              <div className="flex items-center gap-3 text-[10px] text-text-muted">
                <span>
                  <kbd className="rounded bg-surface px-1 py-0.5 font-mono">↑↓</kbd> Navigate
                </span>
                <span>
                  <kbd className="rounded bg-surface px-1 py-0.5 font-mono">↵</kbd> Select
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
