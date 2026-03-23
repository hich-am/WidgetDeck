"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sun, Sunset, Moon } from "lucide-react";
import { useContentStore, getTodayFocusMinutes } from "@/store/contentStore";
import type { Task } from "@/types/widget";

function getGreeting(): { text: string; Icon: typeof Sun } {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", Icon: Sun };
  if (h < 17) return { text: "Good afternoon", Icon: Sunset };
  return { text: "Good evening", Icon: Moon };
}

function formatDate(): string {
  return new Date().toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface Props {
  tasks: Task[];
}

export default function TodayHeader({ tasks }: Props) {
  const { focusLog } = useContentStore();
  const { text, Icon } = getGreeting();
  const dateStr = formatDate();

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const focusMinutes = useMemo(() => getTodayFocusMinutes(focusLog), [focusLog]);
  const focusText =
    focusMinutes >= 60
      ? `${Math.floor(focusMinutes / 60)}h ${focusMinutes % 60}m`
      : focusMinutes > 0
      ? `${focusMinutes}m`
      : null;

  // SVG ring
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <div className="flex items-center justify-between">
      {/* Left: greeting + date */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2 text-text-muted">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{text}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {dateStr}
        </h1>
        {focusText && (
          <p className="text-xs text-text-muted mt-0.5">
            🎯 {focusText} focused today
          </p>
        )}
      </div>

      {/* Right: progress ring */}
      {total > 0 && (
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" className="-rotate-90">
            <circle
              cx="44" cy="44" r={r}
              fill="none"
              stroke="var(--color-border-muted)"
              strokeWidth="5"
              opacity="0.4"
            />
            <motion.circle
              cx="44" cy="44" r={r}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-text-primary">{done}/{total}</span>
            <span className="text-[10px] text-text-muted">tasks</span>
          </div>
        </div>
      )}
    </div>
  );
}
