"use client";

import { useState, useRef, useEffect } from "react";
import {
  RotateCcw,
  Command,
  LayoutGrid,
  Check,
  ChevronDown,
  Paintbrush,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/store/dashboardStore";
import { useThemeStore } from "@/store/themeStore";
import { DEFAULT_WIDGETS } from "@/config/widgets";
import type { WidgetId } from "@/types/widget";

export default function Toolbar() {
  const {
    resetLayout,
    openCommandPalette,
    enabledWidgets,
    toggleWidget,
  } = useDashboardStore();
  const { openThemePicker } = useThemeStore();
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <header className="relative z-30 flex h-16 items-center justify-between border-b border-border-muted bg-surface/80 px-8 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/8">
          <LayoutGrid className="h-4.5 w-4.5 text-accent" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-text-primary">
            WidgetDeck
          </h1>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Command Palette */}
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2 rounded-2xl border border-border-muted px-4 py-2 text-xs text-text-muted transition-all hover:border-accent/30 hover:text-text-primary hover:shadow-sm"
        >
          <Command className="h-3 w-3" />
          <span>Search...</span>
          <kbd className="ml-2 rounded-lg bg-base px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
            ⌘K
          </kbd>
        </button>

        {/* Widget Manager */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowWidgetMenu((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-base hover:text-text-primary"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Modules
            <ChevronDown className="h-3 w-3" />
          </button>

          <AnimatePresence>
            {showWidgetMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-border-muted bg-widget shadow-lg"
                style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
              >
                <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  Toggle Modules
                </div>
                {DEFAULT_WIDGETS.map((w) => {
                  const isEnabled = enabledWidgets.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => toggleWidget(w.id as WidgetId)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-xs text-text-primary transition-colors hover:bg-base"
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

        {/* Theme Picker */}
        <button
          onClick={openThemePicker}
          className="flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-base hover:text-accent"
        >
          <Paintbrush className="h-3.5 w-3.5" />
          Theme
        </button>

        {/* Reset Layout */}
        <button
          onClick={resetLayout}
          className="flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-base hover:text-coral"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
    </header>
  );
}
