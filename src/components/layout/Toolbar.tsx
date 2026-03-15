"use client";

import { useState, useRef, useEffect } from "react";
import {
  RotateCcw,
  Command,
  LayoutGrid,
  Check,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/store/dashboardStore";
import { DEFAULT_WIDGETS } from "@/config/widgets";
import type { WidgetId } from "@/types/widget";

export default function Toolbar() {
  const {
    resetLayout,
    openCommandPalette,
    enabledWidgets,
    toggleWidget,
  } = useDashboardStore();
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowWidgetMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="relative z-30 flex h-14 items-center justify-between border-b border-border-muted bg-surface/80 px-6 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <LayoutGrid className="h-4 w-4 text-accent" />
        </div>
        <h1 className="text-sm font-semibold tracking-wide text-text-primary">
          WidgetDeck
        </h1>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
          v1.0
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Command Palette Hint */}
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2 rounded-lg border border-border-muted px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-accent/30 hover:text-text-primary"
        >
          <Command className="h-3 w-3" />
          <span>Search...</span>
          <kbd className="ml-2 rounded bg-base px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
            ⌘K
          </kbd>
        </button>

        {/* Widget Manager */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowWidgetMenu((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-widget hover:text-text-primary"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Widgets
            <ChevronDown className="h-3 w-3" />
          </button>

          <AnimatePresence>
            {showWidgetMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-border-muted bg-widget shadow-2xl"
              >
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  Toggle Widgets
                </div>
                {DEFAULT_WIDGETS.map((w) => {
                  const isEnabled = enabledWidgets.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => toggleWidget(w.id as WidgetId)}
                      className="flex w-full items-center justify-between px-3 py-2 text-xs text-text-primary transition-colors hover:bg-surface"
                    >
                      <span>{w.title}</span>
                      {isEnabled && (
                        <Check className="h-3.5 w-3.5 text-accent" />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Layout */}
        <button
          onClick={resetLayout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-widget hover:text-amber"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
    </header>
  );
}
