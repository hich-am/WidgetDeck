"use client";

import { useState, useRef, useEffect } from "react";
import {
  RotateCcw,
  Command,
  LayoutGrid,
  Check,
  ChevronDown,
  Paintbrush,
  Grid2X2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/store/dashboardStore";
import { useThemeStore } from "@/store/themeStore";
import { DEFAULT_WIDGETS } from "@/config/widgets";
import type { WidgetId } from "@/types/widget";

export default function Toolbar() {
  const { resetLayout, openCommandPalette, enabledWidgets, toggleWidget } = useDashboardStore();
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
    <header className="relative z-30 flex h-[72px] items-center justify-between border-b border-border-muted/60 bg-surface/80 px-8 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/8">
          <LayoutGrid className="h-5 w-5 text-accent" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-text-primary">
          WidgetDeck
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Command Palette */}
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2.5 rounded-2xl border border-border-muted/60 px-4 py-2.5 text-sm text-text-muted transition-all hover:border-accent/30 hover:text-text-primary hover:shadow-sm"
        >
          <Command className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="ml-2 rounded-lg bg-base px-1.5 py-0.5 text-[10px] text-text-muted">
            ⌘K
          </kbd>
        </button>

        {/* Widget Manager */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowWidgetMenu((prev) => !prev)}
            className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-base hover:text-text-primary"
          >
            <Grid2X2 className="h-4 w-4" />
            Widgets
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <AnimatePresence>
            {showWidgetMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-border-muted/60 bg-widget shadow-lg"
                style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.06)" }}
              >
                <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                  Toggle Widgets
                </div>
                {DEFAULT_WIDGETS.map((w) => {
                  const isEnabled = enabledWidgets.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => toggleWidget(w.id as WidgetId)}
                      className="flex w-full items-center justify-between px-4 py-3 text-sm text-text-primary transition-colors hover:bg-base"
                    >
                      <span>{w.title}</span>
                      {isEnabled && <Check className="h-4 w-4 text-accent" />}
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
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-base hover:text-accent"
        >
          <Paintbrush className="h-4 w-4" />
          Theme
        </button>

        {/* Reset */}
        <button
          onClick={resetLayout}
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-base hover:text-coral"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </header>
  );
}
