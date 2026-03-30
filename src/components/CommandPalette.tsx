"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, CheckSquare, FileText, CalendarDays, List, Timer,
  Flame, Bookmark, RotateCcw, LayoutGrid, Trash2, BarChart2,
  Target, Zap, Clock, Star,
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
  shortcut?: string;
}

const SHORTCUTS_HINT = [
  { key: "T", label: "Tasks" },
  { key: "N", label: "Note" },
  { key: "F", label: "Focus" },
  { key: "G", label: "Goals" },
  { key: "/", label: "Search" },
];

function CommandPaletteContent({
  commands,
  recentCommands,
  run,
  closeCommandPalette,
}: {
  commands: Command[];
  recentCommands: string[];
  run: (id: string, action: () => void) => void;
  closeCommandPalette: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCommandsMap = useMemo(() => {
    const m = new Map<string, Command>();
    commands.forEach((c) => m.set(c.id, c));
    return m;
  }, [commands]);

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [query, commands]);

  // Recent commands (resolved as Command objects, shown when query is empty)
  const recentResolved = useMemo(() => {
    if (query) return [];
    return recentCommands
      .map((id) => allCommandsMap.get(id))
      .filter(Boolean) as Command[];
  }, [recentCommands, allCommandsMap, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, []);

  const runCommand = useCallback(
    (cmd: Command) => run(cmd.id, cmd.action),
    [run]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
      else if (e.key === "Enter" && filtered[selectedIndex]) { e.preventDefault(); runCommand(filtered[selectedIndex]); }
      else if (e.key === "Escape") { closeCommandPalette(); }
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

  let globalIdx = 0;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[60] bg-text-primary/10 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={closeCommandPalette}
      />
      <motion.div
        className="fixed left-1/2 top-[18%] z-[60] w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-3xl border border-border-muted/60 bg-widget"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)" }}
        initial={{ opacity: 0, y: -16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 border-b border-border-muted/40 px-5 py-4">
          <Search className="h-4.5 w-4.5 h-[18px] w-[18px] shrink-0 text-text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search or type a command..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
          />
          <kbd className="rounded-lg border border-border-muted/60 px-2 py-0.5 text-[10px] text-text-muted">ESC</kbd>
        </div>

        {/* Recent commands (when no query) */}
        {!query && recentResolved.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-5 pt-3 pb-1.5">
              <Clock className="h-3 w-3 text-text-muted/60" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted/60">Recent</span>
            </div>
            {recentResolved.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id + "-recent"}
                  onClick={() => runCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm text-text-muted hover:bg-base hover:text-text-primary transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{cmd.label}</span>
                </button>
              );
            })}
            <div className="mx-5 my-2 border-t border-border-muted/30" />
          </div>
        )}

        {/* Command list */}
        <div className="max-h-[360px] overflow-auto py-2">
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-text-muted">No commands found</div>
          )}
          {Array.from(sections.entries()).map(([section, cmds]) => {
            const sectionStart = globalIdx;
            globalIdx += cmds.length;
            return (
              <div key={section}>
                <div className="px-5 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted/60">{section}</div>
                {cmds.map((cmd, i) => {
                  const flatIndex = sectionStart + i;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => runCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(flatIndex)}
                      className={`flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors ${
                        flatIndex === selectedIndex
                          ? "bg-accent/8 text-accent"
                          : "text-text-primary hover:bg-base"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="ml-auto rounded border border-border-muted/50 px-1.5 py-0.5 text-[9px] text-text-muted">{cmd.shortcut}</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer: keyboard hints */}
        <div className="flex items-center justify-between border-t border-border-muted/30 px-5 py-3">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span><kbd className="rounded border border-border-muted/50 px-1.5 py-0.5 text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="rounded border border-border-muted/50 px-1.5 py-0.5 text-[10px]">↵</kbd> Select</span>
          </div>
          <div className="flex items-center gap-2">
            {SHORTCUTS_HINT.map(({ key, label }) => (
              <span key={key} className="flex items-center gap-1 text-[10px] text-text-muted/60">
                <kbd className="rounded border border-border-muted/40 px-1 py-0.5">{key}</kbd>
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function CommandPalette() {
  const {
    commandPaletteOpen,
    closeCommandPalette,
    openCommandPalette,
    expandWidget,
    resetLayout,
    toggleWidget,
    enabledWidgets,
    openFocusMode,
    openDailyReview,
    recentCommands,
    pushRecentCommand,
  } = useDashboardStore();

  const { resetAll, addNote, tasks } = useContentStore();

  const overdueCount = useMemo(
    () => {
      const t = new Date().toISOString().split("T")[0];
      return tasks.filter((tk) => !tk.done && tk.dueDate && tk.dueDate < t).length;
    },
    [tasks]
  );

  const run = useCallback(
    (id: string, action: () => void) => {
      action();
      pushRecentCommand(id);
      closeCommandPalette();
    },
    [closeCommandPalette, pushRecentCommand]
  );

  const commands: Command[] = useMemo(
    () => [
      // ── Create ──
      {
        id: "new-task",
        label: "New Task",
        icon: CheckSquare,
        action: () => { expandWidget("tasks"); },
        section: "Create",
        shortcut: "T",
      },
      {
        id: "new-note",
        label: "New Note",
        icon: FileText,
        action: () => { addNote(); expandWidget("notes"); },
        section: "Create",
        shortcut: "N",
      },
      {
        id: "new-event",
        label: "New Event",
        icon: CalendarDays,
        action: () => { expandWidget("calendar"); },
        section: "Create",
      },
      {
        id: "new-habit",
        label: "New Habit",
        icon: Flame,
        action: () => { expandWidget("habits"); },
        section: "Create",
      },

      // ── Focus ──
      {
        id: "focus-mode",
        label: "Start Focus Session",
        icon: Timer,
        action: openFocusMode,
        section: "Actions",
        shortcut: "F",
      },
      {
        id: "daily-review",
        label: "Daily Review",
        icon: Star,
        action: openDailyReview,
        section: "Actions",
        shortcut: "R",
      },
      ...(overdueCount > 0
        ? [
            {
              id: "complete-overdue",
              label: `Complete ${overdueCount} overdue task${overdueCount > 1 ? "s" : ""}`,
              icon: Zap,
              action: () => {
                const t = new Date().toISOString().split("T")[0];
                const overdue = useContentStore
                  .getState()
                  .tasks.filter((tk) => !tk.done && tk.dueDate && tk.dueDate < t);
                overdue.forEach((tk) => useContentStore.getState().toggleTask(tk.id));
              },
              section: "Actions",
            },
          ]
        : []),

      // ── Navigate ──
      { id: "open-tasks", label: "Go to Tasks", icon: CheckSquare, action: () => expandWidget("tasks"), section: "Navigate", shortcut: "T" },
      { id: "open-notes", label: "Go to Notes", icon: FileText, action: () => expandWidget("notes"), section: "Navigate" },
      { id: "open-calendar", label: "Go to Calendar", icon: CalendarDays, action: () => expandWidget("calendar"), section: "Navigate" },
      { id: "open-habits", label: "Go to Habits", icon: Flame, action: () => expandWidget("habits"), section: "Navigate" },
      { id: "open-goals", label: "Go to Goals", icon: Target, action: () => expandWidget("goals"), section: "Navigate" },
      { id: "open-analytics", label: "Go to Analytics", icon: BarChart2, action: () => expandWidget("analytics"), section: "Navigate" },
      { id: "open-lists", label: "Go to Lists", icon: List, action: () => expandWidget("lists"), section: "Navigate" },
      { id: "open-pomodoro", label: "Go to Pomodoro", icon: Timer, action: () => expandWidget("pomodoro"), section: "Navigate" },
      { id: "open-bookmarks", label: "Go to Bookmarks", icon: Bookmark, action: () => expandWidget("bookmarks"), section: "Navigate" },

      // ── Dashboard ──
      { id: "reset-layout", label: "Reset Layout", icon: RotateCcw, action: resetLayout, section: "Dashboard" },
      { id: "reset-all-data", label: "Clear All Data", icon: Trash2, action: resetAll, section: "Dashboard" },
      ...(["tasks", "notes", "calendar", "lists", "pomodoro", "habits", "bookmarks", "analytics", "goals"] as WidgetId[]).map((id) => ({
        id: `toggle-${id}`,
        label: `${enabledWidgets.includes(id) ? "Hide" : "Show"} ${id.charAt(0).toUpperCase() + id.slice(1)}`,
        icon: LayoutGrid,
        action: () => toggleWidget(id),
        section: "Dashboard",
      })),
    ],
    [expandWidget, resetLayout, resetAll, toggleWidget, enabledWidgets, openFocusMode, openDailyReview, addNote, overdueCount]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const store = useDashboardStore.getState();
        if (store.commandPaletteOpen) {
          closeCommandPalette();
        } else {
          openCommandPalette();
        }
        return;
      }
      if (e.key === "/" && !typing) { e.preventDefault(); openCommandPalette(); return; }
      if (typing) return;
      if (e.key === "t" || e.key === "T") { e.preventDefault(); useDashboardStore.getState().expandWidget("tasks"); return; }
      if (e.key === "n" || e.key === "N") { e.preventDefault(); useContentStore.getState().addNote(); useDashboardStore.getState().expandWidget("notes"); return; }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        const s = useDashboardStore.getState();
        if (s.focusModeOpen) { s.closeFocusMode(); } else { s.openFocusMode(); }
        return;
      }
      if (e.key === "r" || e.key === "R") { e.preventDefault(); useDashboardStore.getState().openDailyReview(); return; }
      if (e.key === "g" || e.key === "G") { e.preventDefault(); useDashboardStore.getState().expandWidget("goals"); return; }
      if (e.key === "h" || e.key === "H") { e.preventDefault(); useDashboardStore.getState().expandWidget("habits"); return; }
      if (e.key === "Escape") {
        const s = useDashboardStore.getState();
        s.closeFocusMode(); s.closeDailyReview(); s.collapseWidget(); closeCommandPalette();
        return;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closeCommandPalette, openCommandPalette]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <CommandPaletteContent
          commands={commands}
          recentCommands={recentCommands}
          run={run}
          closeCommandPalette={closeCommandPalette}
        />
      )}
    </AnimatePresence>
  );
}
