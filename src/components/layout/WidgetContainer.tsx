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
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-border-muted/50 bg-widget"
      style={{
        boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)",
      }}
      whileHover={
        !isExpanded
          ? {
              y: -2,
              scale: 1.01,
              boxShadow: "0 12px 36px rgba(0,0,0,0.07)",
            }
          : {}
      }
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
    >
      {/* Header / Drag Handle */}
      <div className="widget-drag-handle flex h-14 shrink-0 cursor-grab items-center justify-between px-6 active:cursor-grabbing">
        <div className="flex items-center gap-2.5">
          <IconComponent className="h-4 w-4 text-accent" />
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              expandWidget(id);
            }}
            className="rounded-xl p-2 text-text-muted transition-colors hover:bg-base hover:text-accent"
            aria-label={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 pb-6">{children}</div>
    </motion.div>
  );
}
