"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Timer, Flame, Zap } from "lucide-react";
import { useContentStore, getTodayFocusMinutes, computeForgivingStreak } from "@/store/contentStore";
import { todayStr } from "@/store/contentStore";

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export default function AnalyticsWidget() {
  const { tasks, focusLog, habits, pomodoroSessions, xp, dailyStreak } = useContentStore();
  const last7 = useMemo(getLast7Days, []);
  const { start, end } = useMemo(getWeekRange, []);

  // Tasks completed per day (last 7)
  const tasksByDay = useMemo(() =>
    last7.map((date) =>
      tasks.filter((t) => t.done && t.completedAt?.startsWith(date)).length
    ),
  [tasks, last7]);

  // This week stats
  const weekTasks = tasks.filter(
    (t) => t.done && t.completedAt && t.completedAt >= start && t.completedAt <= end + "T23:59:59"
  ).length;

  const weekFocusMin = useMemo(() =>
    focusLog.filter((s) => s.date >= start && s.date <= end).reduce((a, s) => a + s.minutes, 0),
  [focusLog, start, end]);

  const habitConsistency = useMemo(() => {
    if (!habits.length) return 0;
    const totalSlots = habits.length * 7;
    const filled = habits.reduce((acc, h) =>
      acc + last7.filter((d) => h.completedDates.includes(d)).length, 0
    );
    return Math.round((filled / totalSlots) * 100);
  }, [habits, last7]);

  const maxDay = Math.max(...tasksByDay, 1);
  const focusHours = Math.floor(weekFocusMin / 60);
  const focusMins = weekFocusMin % 60;

  const stats = [
    { label: "Tasks done",     value: weekTasks,          icon: CheckCircle2, color: "text-accent", bg: "bg-accent/8" },
    { label: "Focus time",     value: focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`, icon: Timer, color: "text-cyan", bg: "bg-cyan/8" },
    { label: "Habit rate",     value: `${habitConsistency}%`,   icon: Flame,       color: "text-amber", bg: "bg-amber/8" },
    { label: "Total XP",       value: xp,                 icon: Zap,         color: "text-lavender", bg: "bg-lavender/8" },
  ];

  const days = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="flex h-full flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl bg-base/60 p-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-base font-bold text-text-primary leading-tight">{value}</p>
              <p className="text-[11px] text-text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 7-day task bar chart */}
      <div>
        <p className="mb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Tasks completed — last 7 days</p>
        <div className="flex items-end gap-1.5 h-20">
          {tasksByDay.map((count, i) => {
            const heightPct = maxDay === 0 ? 0 : (count / maxDay) * 100;
            const isToday = last7[i] === todayStr();
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end justify-center">
                  <motion.div
                    className="w-full rounded-t-lg"
                    style={{
                      backgroundColor: isToday
                        ? "var(--color-accent)"
                        : "color-mix(in srgb, var(--color-accent) 25%, transparent)",
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPct, count > 0 ? 8 : 0)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    title={`${count} task${count !== 1 ? "s" : ""}`}
                  />
                </div>
                <span className={`text-[10px] font-medium ${isToday ? "text-accent" : "text-text-muted"}`}>
                  {days[new Date(last7[i] + "T12:00:00").getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak + sessions footer */}
      <div className="flex items-center justify-between rounded-xl bg-base/60 px-4 py-2.5">
        <span className="text-xs text-text-muted">
          🔥 <strong className="text-text-primary">{dailyStreak}-day</strong> streak
        </span>
        <span className="text-xs text-text-muted">
          🍅 <strong className="text-text-primary">{pomodoroSessions}</strong> total sessions
        </span>
      </div>
    </div>
  );
}
