"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  CheckSquare,
  FileText,
  CalendarDays,
  List,
  Timer,
  Flame,
  Bookmark,
} from "lucide-react";
import type { WidgetId } from "@/types/widget";
import { useDashboardStore } from "@/store/dashboardStore";

const iconMap: Record<string, React.ElementType> = {
  CheckSquare,
  FileText,
  CalendarDays,
  List,
  Timer,
  Flame,
  Bookmark,
};

interface WidgetContainerProps {
  id: WidgetId;
  title: string;
  icon: string;
  children: React.ReactNode;
}

export default function WidgetContainer({
  id,
  title,
  icon,
  children,
}: WidgetContainerProps) {
  const { expandWidget, expandedWidget } = useDashboardStore();
  const IconComponent = iconMap[icon] || CheckSquare;
  const isExpanded = expandedWidget === id;

  return (
    <motion.div
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border-muted bg-widget"
      style={{
        boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
      }}
      whileHover={
        !isExpanded
          ? {
              y: -3,
              scale: 1.01,
              boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
            }
          : {}
      }
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Header / Drag Handle */}
      <div className="widget-drag-handle flex h-10 shrink-0 cursor-grab items-center justify-between border-b border-border-muted px-4 active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <IconComponent className="h-4 w-4 text-accent" />
          <span className="text-xs font-medium tracking-wide text-text-muted">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              expandWidget(id);
            }}
            className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface hover:text-accent"
            aria-label={isExpanded ? "Minimize widget" : "Expand widget"}
          >
            {isExpanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </motion.div>
  );
}
