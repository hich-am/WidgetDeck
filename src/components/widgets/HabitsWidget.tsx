"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Flame, Check, LayoutGrid, Calendar } from "lucide-react";
import { useContentStore, computeForgivingStreak } from "@/store/contentStore";

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

function getBestDay(completedDates: string[]): string | null {
  if (completedDates.length < 3) return null;
  const counts: Record<number, number> = {};
  for (const d of completedDates) {
    const dow = new Date(d + "T00:00:00").getDay();
    counts[dow] = (counts[dow] || 0) + 1;
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return DAYS[Number(best[0])];
}

/** Build a 16-week grid of dates, oldest first */
function getLast16WeekDates(): string[][] {
  const today = new Date();
  const startDow = today.getDay(); // day of week of today
  const weeks: string[][] = [];
  // Go back 16 weeks from start of current week
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

export default function HabitsWidget() {
  const { habits, addHabit, deleteHabit, toggleHabitDate } = useContentStore();
  const [newName, setNewName] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"week" | "heatmap">("week");

  const last7 = useMemo(getLast7Days, []);
  const heatmapWeeks = useMemo(getLast16WeekDates, []);
  const todayStr = new Date().toISOString().split("T")[0];

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addHabit(trimmed, COLORS[colorIdx % COLORS.length]);
    setNewName("");
    setColorIdx((i) => i + 1);
  };

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
          <div className="grid items-end gap-1.5" style={{ gridTemplateColumns: "1fr repeat(7, 28px) 44px" }}>
            <div />
            {last7.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-text-muted">{getDayLabel(d)}</div>
            ))}
            <div className="text-center text-[10px] font-medium text-text-muted">🔥</div>
          </div>

          <div className="flex-1 space-y-2 overflow-auto">
            {habits.length === 0 && (
              <div className="flex h-full items-center justify-center text-sm text-text-muted">Add a habit to start tracking</div>
            )}
            {habits.map((habit) => {
              const streak = computeForgivingStreak(habit.completedDates);
              const weekDone = last7.filter((d) => habit.completedDates.includes(d)).length;
              const bestDay = getBestDay(habit.completedDates);
              return (
                <div key={habit.id} className="space-y-0.5">
                  <div className="group grid items-center gap-1.5" style={{ gridTemplateColumns: "1fr repeat(7, 28px) 44px" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} />
                      <span className="truncate text-sm text-text-primary">{habit.name}</span>
                      <button onClick={() => deleteHabit(habit.id)} className="shrink-0 text-text-muted opacity-0 hover:text-red-400 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    {last7.map((date) => {
                      const done = habit.completedDates.includes(date);
                      return (
                        <motion.button
                          key={date}
                          whileHover={{ scale: 1.18 }}
                          whileTap={{ scale: 0.88 }}
                          onClick={() => toggleHabitDate(habit.id, date)}
                          className="mx-auto flex h-7 w-7 items-center justify-center rounded-full transition-all"
                          style={done ? { backgroundColor: habit.color + "20" } : { backgroundColor: "var(--color-base)" }}
                        >
                          {done && <Check className="h-3.5 w-3.5" style={{ color: habit.color }} strokeWidth={3} />}
                        </motion.button>
                      );
                    })}
                    <div className="flex items-center justify-center gap-0.5">
                      {streak > 0 && <Flame className="h-3.5 w-3.5 text-amber" />}
                      <span className="text-xs font-semibold text-text-primary">{streak}</span>
                    </div>
                  </div>
                  <div className="grid gap-1.5 pl-5" style={{ gridTemplateColumns: "1fr repeat(7, 28px) 44px" }}>
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
                      {bestDay && <span className="shrink-0 text-[10px] text-text-muted">Best: {bestDay}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Heatmap view ── */}
      {viewMode === "heatmap" && (
        <div className="flex-1 overflow-auto">
          {habits.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">Add a habit to see the heatmap</div>
          )}
          {habits.map((habit) => {
            const streak = computeForgivingStreak(habit.completedDates);
            return (
              <div key={habit.id} className="mb-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
                  <span className="text-sm font-medium text-text-primary">{habit.name}</span>
                  <span className="ml-auto text-[11px] text-text-muted flex items-center gap-1">
                    <Flame className="h-3 w-3 text-amber" /> {streak}
                  </span>
                </div>
                {/* Month labels */}
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
                {/* Legend */}
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-text-muted">
                  <span>Less</span>
                  {[0.15, 0.35, 0.6, 0.8, 1].map((o, i) => (
                    <div key={i} className="h-3 w-3 rounded-sm" style={{ backgroundColor: habit.color, opacity: o }} />
                  ))}
                  <span>More</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add habit */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New habit..."
          className="flex-1 rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
        />
        <button onClick={handleAdd} className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 text-sm font-medium text-accent hover:bg-accent/15">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </div>
  );
}
