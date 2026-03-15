"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { getWidgetConfig } from "@/config/widgets";
import { widgetComponents } from "@/components/widgets/widgetRegistry";

export default function ExpandedWidget() {
  const { expandedWidget, collapseWidget } = useDashboardStore();
  const config = expandedWidget ? getWidgetConfig(expandedWidget) : null;
  const WidgetComponent = expandedWidget
    ? widgetComponents[expandedWidget]
    : null;

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expandedWidget) {
        collapseWidget();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [expandedWidget, collapseWidget]);

  return (
    <AnimatePresence>
      {expandedWidget && config && WidgetComponent && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={collapseWidget}
          />

          {/* Expanded Content */}
          <motion.div
            className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-border-muted bg-widget md:inset-8 lg:inset-12"
            style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.6)" }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-muted px-6">
              <span className="text-sm font-medium text-text-primary">
                {config.title}
              </span>
              <button
                onClick={collapseWidget}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
                aria-label="Close expanded widget"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-6">
              <WidgetComponent />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
