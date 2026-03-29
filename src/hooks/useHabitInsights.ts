"use client";

import { useMemo } from "react";
import type { Habit } from "@/types/widget";
import { computeForgivingStreak } from "@/store/contentStore";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });
}

/** Day-of-week (0=Sun) → count of completions */
function dayOfWeekCounts(dates: string[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const d of dates) {
    const dow = new Date(d + "T00:00:00").getDay();
    counts[dow] = (counts[dow] ?? 0) + 1;
  }
  return counts;
}

function computeLongestStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const curr = new Date(sorted[i] + "T00:00:00");
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return longest;
}

export interface HabitInsights {
  bestDay: string | null;       // e.g. "Mon"
  worstDay: string | null;
  currentStreak: number;
  longestStreak: number;
  completionRate30d: number;    // 0–100
}

export function useHabitInsights(habit: Habit): HabitInsights {
  return useMemo(() => {
    const dates = habit.completedDates;
    const last30 = getLast30Days();

    const currentStreak = computeForgivingStreak(dates);
    const longestStreak = computeLongestStreak(dates);

    const completedIn30 = dates.filter((d) => last30.includes(d)).length;
    const completionRate30d = Math.round((completedIn30 / 30) * 100);

    if (dates.length < 3) {
      return { bestDay: null, worstDay: null, currentStreak, longestStreak, completionRate30d };
    }

    const counts = dayOfWeekCounts(dates);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const bestDay = DAYS[Number(sorted[0][0])];
    const worstDay = DAYS[Number(sorted[sorted.length - 1][0])];

    return { bestDay, worstDay, currentStreak, longestStreak, completionRate30d };
  }, [habit]);
}
