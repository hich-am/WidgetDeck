"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Timer, Flame, Zap, TrendingUp } from "lucide-react";
import { useContentStore, getTodayFocusMinutes, computeForgivingStreak, todayStr } from "@/store/contentStore";
import { useFocusScore } from "@/hooks/useFocusScore";

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
  return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
}

// Mood indicator colors move from red (very low) through orange, gray, green, to blue (great).
const MOOD_COLORS: Record<number, string> = {
  1: "#E87E7E",
  2: "#E8956A",
  3: "#8E8EA0",
  4: "#5CB99A",
  5: "#5B8DEF",
};
const MOOD_LABELS: Record<number, string> = {
  1: "Very low mood",
  2: "Low mood",
  3: "Neutral mood",
  4: "Positive mood",
  5: "Great mood",
};

const burnoutConfig = {
  low:    { label: "Balanced",  bg: "bg-cyan/10",   text: "text-cyan-500",    dot: "bg-cyan-500"   },
  medium: { label: "Watch out", bg: "bg-amber/10",  text: "text-amber-500",   dot: "bg-amber-500"  },
  high:   { label: "Burnout risk", bg: "bg-red-400/10", text: "text-red-400", dot: "bg-red-400" },
};

export default function AnalyticsWidget() {
  const { tasks, focusLog, habits, pomodoroSessions, xp, dailyStreak, moodLog } = useContentStore();
  const last7 = useMemo(() => getLast7Days(), []);
  const { start, end } = useMemo(() => getWeekRange(), []);
  const { score, burnout } = useFocusScore();

  const tasksByDay = useMemo(() =>
    last7.map((date) =>
      tasks.filter((t) => t.done && t.completedAt?.startsWith(date)).length
    ),
  [tasks, last7]);

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
    { label: "Tasks done",  value: weekTasks,          icon: CheckCircle2, color: "text-accent",   bg: "bg-accent/8" },
    { label: "Focus time",  value: focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`, icon: Timer, color: "text-cyan", bg: "bg-cyan/8" },
    { label: "Habit rate",  value: `${habitConsistency}%`, icon: Flame, color: "text-amber-500", bg: "bg-amber/8" },
    { label: "Total XP",    value: xp,                 icon: Zap,         color: "text-lavender", bg: "bg-lavender/8" },
  ];

  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const bCfg = burnoutConfig[burnout];

  // Mood row: last 7 days
  const moodRow = useMemo(() =>
    last7.map((d) => moodLog.find((m) => m.date === d)?.mood ?? null),
  [moodLog, last7]);
  const hasMood = moodRow.some((m) => m !== null);

  // Focus score gauge SVG params
  const gaugeR = 36;
  const gaugeCirc = 2 * Math.PI * gaugeR;
  const gaugeFill = (score / 100) * gaugeCirc * 0.75; // 270° arc
  const scoreColor =
    score >= 70 ? "var(--color-cyan)"
    : score >= 40 ? "var(--color-amber)"
    : "var(--color-accent)";

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top row: Focus Score gauge + Burnout badge */}
      <div className="flex items-center gap-3">
        {/* Circular gauge */}
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" style={{ transform: "rotate(135deg)" }}>
            <circle
              cx="44" cy="44" r={gaugeR}
              fill="none" stroke="var(--color-border-muted)"
              strokeWidth="6" opacity="0.4"
              strokeDasharray={`${gaugeCirc * 0.75} ${gaugeCirc * 0.25}`}
              strokeLinecap="round"
            />
            <motion.circle
              cx="44" cy="44" r={gaugeR}
              fill="none" stroke={scoreColor}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${gaugeFill} ${gaugeCirc - gaugeFill}`}
              initial={{ strokeDasharray: `0 ${gaugeCirc}` }}
              animate={{ strokeDasharray: `${gaugeFill} ${gaugeCirc - gaugeFill}` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold leading-none text-text-primary">{score}</span>
            <span className="text-[9px] text-text-muted uppercase tracking-wide">Focus</span>
          </div>
        </div>

        {/* Burnout + streak pills */}
        <div className="flex flex-col gap-2">
          <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 ${bCfg.bg}`}>
            <span className={`h-2 w-2 rounded-full ${bCfg.dot}`} />
            <span className={`text-xs font-semibold ${bCfg.text}`}>{bCfg.label}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-base/60 px-3 py-1.5">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-text-muted"><strong className="text-text-primary">{dailyStreak}</strong>-day streak</span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid flex-1 grid-cols-2 gap-2">
          {stats.slice(0, 2).map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="flex items-center gap-2 rounded-xl bg-base/60 p-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight text-text-primary">{value}</p>
                <p className="text-[10px] text-text-muted">{label}</p>
              </div>
            </div>
          ))}
          {stats.slice(2).map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="flex items-center gap-2 rounded-xl bg-base/60 p-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight text-text-primary">{value}</p>
                <p className="text-[10px] text-text-muted">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day task bar chart */}
      <div>
        <p className="mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Tasks — last 7 days</p>
        <div className="flex items-end gap-1.5 h-16">
          {tasksByDay.map((count, i) => {
            const heightPct = maxDay === 0 ? 0 : (count / maxDay) * 100;
            const isToday = last7[i] === todayStr();
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
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

      {/* Mood trend row */}
      {hasMood && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Mood — last 7 days</p>
          <div className="flex items-center gap-1.5">
            {moodRow.map((mood, i) => (
              <div
                key={i}
                className="flex flex-1 items-center justify-center rounded-xl bg-base/60 py-1.5"
                title={last7[i]}
              >
                {mood ? (
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: MOOD_COLORS[mood] }}
                    title={MOOD_LABELS[mood]}
                    aria-label={MOOD_LABELS[mood]}
                  />
                ) : (
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-border-muted/40"
                    title="No mood logged"
                    aria-label="No mood logged"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer: sessions */}
      <div className="mt-auto flex items-center justify-between rounded-xl bg-base/60 px-4 py-2.5">
        <span className="text-xs text-text-muted">
          <Timer className="inline h-3 w-3 mr-1 text-text-muted" />
          <strong className="text-text-primary">{pomodoroSessions}</strong> total sessions
        </span>
        <span className="text-xs text-text-muted">
          <TrendingUp className="inline h-3 w-3 mr-1 text-accent" />
          <strong className="text-text-primary">{xp}</strong> XP
        </span>
      </div>
    </div>
  );
}
