"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Flame, Check, LayoutGrid, Calendar,
  ChevronDown, Shield, TrendingUp, Sparkles, RotateCcw,
} from "lucide-react";
import { useContentStore, computeForgivingStreak } from "@/store/contentStore";
import { useHabitInsights } from "@/hooks/useHabitInsights";
import type { Habit } from "@/types/widget";

// ── Burst animation on habit completion ──
function CompletionBurst({ color, active }: { color: string; active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * 24,
              y: Math.sin(angle) * 24,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

const COLORS = ["#5B8DEF", "#5CB99A", "#E8956A", "#9B8FC4", "#E87E7E", "#6BC5D2", "#D4804A"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function getDayLabel(dateStr: string): string {
  return DAYS[new Date(dateStr + "T00:00:00").getDay()];
}

function getLast16WeekDates(): string[][] {
  const today = new Date();
  const startDow = today.getDay();
  const weeks: string[][] = [];
  for (let w = 15; w >= 0; w--) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - startDow - w * 7 + d);
      week.push(date.toISOString().split("T")[0]);
    }
    weeks.push(week);
  }
  return weeks;
}

// ── HabitRow sub-component ──
function HabitRow({
  habit,
  last7,
  todayStr,
  onToggle,
  onDelete,
}: {
  habit: Habit;
  last7: string[];
  todayStr: string;
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
}) {
  const streak = computeForgivingStreak(habit.completedDates);
  const prevStreak = habit.completedDates.length;
  const weekDone = last7.filter((d) => habit.completedDates.includes(d)).length;
  const insights = useHabitInsights(habit);
  const [showInsights, setShowInsights] = useState(false);
  const [burstIdx, setBurstIdx] = useState<number | null>(null);
  const [streakBounce, setStreakBounce] = useState(false);

  const handleToggle = (id: string, date: string) => {
    const wasDone = habit.completedDates.includes(date);
    onToggle(id, date);
    if (!wasDone && date === todayStr) {
      setBurstIdx(last7.indexOf(date));
      setTimeout(() => setBurstIdx(null), 600);
      // Animate streak if incrementing
      const newStreak = computeForgivingStreak([...habit.completedDates, date]);
      if (newStreak > streak) {
        setStreakBounce(true);
        setTimeout(() => setStreakBounce(false), 600);
      }
    }
  };

  return (
    <div className="space-y-0.5">
      <div className="group grid items-center gap-1.5" style={{ gridTemplateColumns: "1fr repeat(7, 28px) 54px" }}>
        {/* Name + controls */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} />
          <span className="truncate text-sm text-text-primary">{habit.name}</span>
          <span title="1 skip won't break your streak" className="shrink-0 text-text-muted/50 hover:text-accent cursor-default">
            <Shield className="h-3 w-3" />
          </span>
          <button onClick={() => setShowInsights((v) => !v)} className="shrink-0 text-text-muted/40 hover:text-accent transition-opacity opacity-0 group-hover:opacity-100">
            <TrendingUp className="h-3 w-3" />
          </button>
          <button onClick={() => onDelete(habit.id)} className="shrink-0 text-text-muted opacity-0 hover:text-red-400 group-hover:opacity-100 transition-opacity">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        {/* 7-day toggle dots */}
        {last7.map((date, idx) => {
          const done = habit.completedDates.includes(date);
          return (
            <div key={date} className="relative mx-auto flex h-7 w-7 items-center justify-center">
              <CompletionBurst color={habit.color} active={burstIdx === idx} />
              <motion.button
                whileHover={{ scale: 1.18 }}
                whileTap={{ scale: 0.88 }}
                animate={done && burstIdx === idx ? { scale: [1, 1.3, 1] } : {}}
                onClick={() => handleToggle(habit.id, date)}
                className="h-full w-full flex items-center justify-center rounded-full transition-all"
                style={done ? { backgroundColor: habit.color + "20" } : { backgroundColor: "var(--color-base)" }}
              >
                {done && <Check className="h-3.5 w-3.5" style={{ color: habit.color }} strokeWidth={3} />}
              </motion.button>
            </div>
          );
        })}

        {/* Streak */}
        <div className="flex items-center justify-center gap-0.5">
          {streak > 0 && <Flame className="h-3.5 w-3.5 text-amber" />}
          <motion.span
            animate={streakBounce ? { scale: [1, 1.5, 1], color: ["inherit", habit.color, "inherit"] } : {}}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold text-text-primary"
          >
            {streak}
          </motion.span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="grid gap-1.5 pl-5" style={{ gridTemplateColumns: "1fr repeat(7, 28px) 54px" }}>
        <div className="col-span-9 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-1.5">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-base">
              <motion.div className="h-full rounded-full" style={{ backgroundColor: habit.color }}
                initial={{ width: 0 }} animate={{ width: `${(weekDone / 7) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="text-[10px] text-text-muted shrink-0">{weekDone}/7</span>
          </div>
          {insights.bestDay && (
            <span className="shrink-0 text-[10px] text-text-muted">Best: {insights.bestDay}</span>
          )}
        </div>
      </div>

      {/* Expandable insights panel */}
      <AnimatePresence initial={false}>
        {showInsights && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="ml-5 mt-1.5 rounded-xl p-3 grid grid-cols-3 gap-2"
              style={{ backgroundColor: habit.color + "10", border: `1px solid ${habit.color}20` }}
            >
              <div className="text-center">
                <p className="text-xs font-bold text-text-primary">{insights.currentStreak}</p>
                <p className="text-[10px] text-text-muted">Current</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-text-primary">{insights.longestStreak}</p>
                <p className="text-[10px] text-text-muted">Longest</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-text-primary">{insights.completionRate30d}%</p>
                <p className="text-[10px] text-text-muted">30-day</p>
              </div>
              {insights.worstDay && (
                <div className="col-span-3 text-center">
                  <p className="text-[10px] text-text-muted">
                    Hardest day: <span className="font-medium text-text-primary">{insights.worstDay}</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Heatmap view (extracted) ──
function HeatmapView({ habit, heatmapWeeks, todayStr }: { habit: Habit; heatmapWeeks: string[][]; todayStr: string }) {
  const streak = computeForgivingStreak(habit.completedDates);
  const { toggleHabitDate } = useContentStore();
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
        <span className="text-sm font-medium text-text-primary">{habit.name}</span>
        <span className="ml-auto text-[11px] text-text-muted flex items-center gap-1">
          <Flame className="h-3 w-3 text-amber" /> {streak}
        </span>
      </div>
      <div className="flex gap-0.5 overflow-x-auto pb-1">
        {heatmapWeeks.map((week, wi) => (
          <div key={wi} className="flex shrink-0 flex-col gap-0.5">
            {week.map((date) => {
              const done = habit.completedDates.includes(date);
              const isToday = date === todayStr;
              const isFuture = date > todayStr;
              return (
                <motion.button
                  key={date}
                  whileHover={!isFuture ? { scale: 1.2 } : {}}
                  whileTap={!isFuture ? { scale: 0.9 } : {}}
                  onClick={() => !isFuture && toggleHabitDate(habit.id, date)}
                  disabled={isFuture}
                  title={date}
                  className="h-3.5 w-3.5 rounded-sm transition-all"
                  style={{
                    backgroundColor: isFuture
                      ? "transparent"
                      : done
                        ? habit.color
                        : isToday
                          ? "color-mix(in srgb, var(--color-border-muted) 60%, transparent)"
                          : "color-mix(in srgb, var(--color-border-muted) 30%, transparent)",
                    outline: isToday ? `1.5px solid ${habit.color}60` : "none",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-text-muted">
        <span>Less</span>
        {[0.15, 0.35, 0.6, 0.8, 1].map((o, i) => (
          <div key={i} className="h-3 w-3 rounded-sm" style={{ backgroundColor: habit.color, opacity: o }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

// ── Main component ──
export default function HabitsWidget() {
  const { habits, addHabit, deleteHabit, toggleHabitDate } = useContentStore();
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState("");
  const [showTrigger, setShowTrigger] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"week" | "heatmap">("week");

  const last7 = useMemo(getLast7Days, []);
  const heatmapWeeks = useMemo(getLast16WeekDates, []);
  const todayStr = new Date().toISOString().split("T")[0];

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addHabit(trimmed, COLORS[colorIdx % COLORS.length], newTrigger.trim() || undefined);
    setNewName("");
    setNewTrigger("");
    setShowTrigger(false);
    setColorIdx((i) => i + 1);
  };

  // Group habits by stackTrigger
  const { stacks, ungrouped } = useMemo(() => {
    const stackMap = new Map<string, Habit[]>();
    const ungrouped: Habit[] = [];
    for (const h of habits) {
      if (h.stackTrigger) {
        const arr = stackMap.get(h.stackTrigger) ?? [];
        arr.push(h);
        stackMap.set(h.stackTrigger, arr);
      } else {
        ungrouped.push(h);
      }
    }
    return { stacks: stackMap, ungrouped };
  }, [habits]);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-xl bg-base p-0.5">
          <button
            onClick={() => setViewMode("week")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "week" ? "bg-surface text-text-primary shadow-sm" : "text-text-muted"
            }`}
          >
            <LayoutGrid className="h-3 w-3" /> 7 Days
          </button>
          <button
            onClick={() => setViewMode("heatmap")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "heatmap" ? "bg-surface text-text-primary shadow-sm" : "text-text-muted"
            }`}
          >
            <Calendar className="h-3 w-3" /> Heatmap
          </button>
        </div>
      </div>

      {/* ── 7-day view ── */}
      {viewMode === "week" && (
        <>
          {/* Day headers */}
          <div className="grid items-end gap-1.5" style={{ gridTemplateColumns: "1fr repeat(7, 28px) 54px" }}>
            <div />
            {last7.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-text-muted">{getDayLabel(d)}</div>
            ))}
            <div className="text-center text-[10px] font-medium text-text-muted">🔥</div>
          </div>

          <div className="flex-1 space-y-3 overflow-auto">
            {habits.length === 0 && (
              <div className="flex h-full items-center justify-center text-sm text-text-muted">Add a habit to start tracking</div>
            )}

            {/* Habit stack groups */}
            {Array.from(stacks.entries()).map(([trigger, stackHabits]) => (
              <div key={trigger} className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wide">
                  <span>⚡</span>
                  <span>{trigger}</span>
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-border-muted/40">
                  {stackHabits.map((habit) => (
                    <HabitRow
                      key={habit.id}
                      habit={habit}
                      last7={last7}
                      todayStr={todayStr}
                      onToggle={toggleHabitDate}
                      onDelete={deleteHabit}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Ungrouped habits */}
            {ungrouped.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                last7={last7}
                todayStr={todayStr}
                onToggle={toggleHabitDate}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Heatmap view ── */}
      {viewMode === "heatmap" && (
        <div className="flex-1 overflow-auto">
          {habits.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">Add a habit to see the heatmap</div>
          )}
          {habits.map((habit) => (
            <HeatmapView key={habit.id} habit={habit} heatmapWeeks={heatmapWeeks} todayStr={todayStr} />
          ))}
        </div>
      )}

      {/* Add habit form */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            onFocus={() => setShowTrigger(true)}
            placeholder="New habit..."
            className="flex-1 rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
          />
          <button onClick={handleAdd} className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 text-sm font-medium text-accent hover:bg-accent/15">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <AnimatePresence>
          {showTrigger && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <input
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                placeholder="⚡ Stack trigger (optional): e.g. After morning coffee"
                className="w-full rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-xs text-text-primary placeholder-text-muted/70 outline-none focus:border-accent/40"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
