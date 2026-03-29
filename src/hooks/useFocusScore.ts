"use client";

import { useMemo } from "react";
import { useContentStore, todayStr, getTodayFocusMinutes } from "@/store/contentStore";

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function sumMinutesLastNDays(
  focusLog: { date: string; minutes: number }[],
  n: number
): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - n);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return focusLog
    .filter((s) => s.date >= cutoffStr)
    .reduce((acc, s) => acc + s.minutes, 0);
}

export type BurnoutLevel = "low" | "medium" | "high";

export function useFocusScore(): {
  score: number;
  burnout: BurnoutLevel;
  todayFocusMin: number;
  weekFocusMin: number;
} {
  const { tasks, focusLog, habits } = useContentStore();

  return useMemo(() => {
    const today = todayStr();
    const last7 = getLast7Days();

    const todayFocusMin = getTodayFocusMinutes(focusLog);
    const weekFocusMin = sumMinutesLastNDays(focusLog, 7);

    // Tasks: how many due today are done?
    const dueTodayTasks = tasks.filter(
      (t) => t.dueDate === today || (!t.dueDate && !t.done === false)
    );
    const doneTodayCount = tasks.filter(
      (t) => t.done && t.completedAt?.startsWith(today)
    ).length;
    const taskRate =
      dueTodayTasks.length > 0
        ? Math.min(doneTodayCount / dueTodayTasks.length, 1)
        : doneTodayCount > 0
        ? 1
        : 0;

    // Habits: what fraction completed today?
    const habitRate =
      habits.length > 0
        ? habits.filter((h) => h.completedDates.includes(today)).length /
          habits.length
        : 0;

    // Focus score: 0–100
    const focusPts = Math.min((todayFocusMin / 120) * 50, 50); // 2h = 50pts
    const taskPts = taskRate * 30;
    const habitPts = habitRate * 20;
    const score = Math.round(focusPts + taskPts + habitPts);

    // Burnout: based on weekly averages + overdue tasks
    const avgDailyMin = weekFocusMin / 7;
    const overdueCount = tasks.filter(
      (t) => !t.done && t.dueDate && t.dueDate < today
    ).length;

    let burnout: BurnoutLevel = "low";
    if (avgDailyMin > 300 || overdueCount > 10) burnout = "high";
    else if (avgDailyMin > 200 || overdueCount > 5) burnout = "medium";

    return { score, burnout, todayFocusMin, weekFocusMin };
  }, [tasks, focusLog, habits]);
}
