"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { widgetComponents } from "@/components/widgets/widgetRegistry";
import { DEFAULT_WIDGETS } from "@/config/widgets";

export default function ExpandedWidget() {
  const { expandedWidget, collapseWidget } = useDashboardStore();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") collapseWidget();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [collapseWidget]);

  const config = expandedWidget
    ? DEFAULT_WIDGETS.find((w) => w.id === expandedWidget)
    : null;
  const WidgetContent = expandedWidget
    ? widgetComponents[expandedWidget]
    : null;

  return (
    <AnimatePresence>
      {expandedWidget && config && WidgetContent && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-text-primary/20 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={collapseWidget}
          />

          <motion.div
            className="fixed inset-6 z-50 flex flex-col overflow-hidden rounded-3xl border border-border-muted bg-widget"
            style={{
              boxShadow: "0 32px 80px rgba(0,0,0,0.12)",
            }}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border-muted px-6">
              <h2 className="text-base font-semibold text-text-primary">
                {config.title}
              </h2>
              <button
                onClick={collapseWidget}
                className="rounded-xl p-2 text-text-muted transition-colors hover:bg-base hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
              <WidgetContent />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
