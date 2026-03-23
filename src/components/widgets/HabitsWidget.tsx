"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Flame, Check } from "lucide-react";
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
  const d = new Date(dateStr + "T00:00:00");
  return DAYS[d.getDay()];
}

/** Return e.g. "Most consistent: Mon" or null if not enough data */
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

export default function HabitsWidget() {
  const { habits, addHabit, deleteHabit, toggleHabitDate } = useContentStore();
  const [newName, setNewName] = useState("");
  const [colorIdx, setColorIdx] = useState(0);

  const last7 = useMemo(getLast7Days, []);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addHabit(trimmed, COLORS[colorIdx % COLORS.length]);
    setNewName("");
    setColorIdx((i) => i + 1);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Day-of-week headers */}
      <div
        className="grid items-end gap-1.5"
        style={{ gridTemplateColumns: "1fr repeat(7, 32px) 52px" }}
      >
        <div />
        {last7.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-text-muted">
            {getDayLabel(d)}
          </div>
        ))}
        <div className="text-center text-[10px] font-medium text-text-muted">Streak</div>
      </div>

      {/* Habit rows */}
      <div className="flex-1 space-y-2 overflow-auto">
        {habits.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            Add a habit to start tracking
          </div>
        )}

        {habits.map((habit) => {
          const streak = computeForgivingStreak(habit.completedDates);
          const weekDone = last7.filter((d) => habit.completedDates.includes(d)).length;
          const bestDay = getBestDay(habit.completedDates);

          return (
            <div key={habit.id} className="space-y-0.5">
              <div
                className="group grid items-center gap-1.5"
                style={{ gridTemplateColumns: "1fr repeat(7, 32px) 52px" }}
              >
                {/* Name + delete */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className="truncate text-sm text-text-primary">{habit.name}</span>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="shrink-0 text-text-muted opacity-0 hover:text-red-400 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {/* 7-day circles */}
                {last7.map((date) => {
                  const done = habit.completedDates.includes(date);
                  return (
                    <motion.button
                      key={date}
                      whileHover={{ scale: 1.18 }}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => toggleHabitDate(habit.id, date)}
                      className="mx-auto flex h-7 w-7 items-center justify-center rounded-full transition-all"
                      style={
                        done
                          ? { backgroundColor: habit.color + "20" }
                          : { backgroundColor: "var(--color-base)" }
                      }
                      title={date}
                    >
                      {done && (
                        <Check
                          className="h-3.5 w-3.5"
                          style={{ color: habit.color }}
                          strokeWidth={3}
                        />
                      )}
                    </motion.button>
                  );
                })}

                {/* Streak */}
                <div className="flex items-center justify-center gap-0.5">
                  {streak > 0 && <Flame className="h-3.5 w-3.5 text-amber" />}
                  <span className="text-xs font-semibold text-text-primary">{streak}</span>
                </div>
              </div>

              {/* Weekly insight */}
              <div
                className="grid items-center gap-1.5 pl-5"
                style={{ gridTemplateColumns: "1fr repeat(7, 32px) 52px" }}
              >
                <div className="col-span-9 flex items-center gap-3">
                  {/* Mini progress bar */}
                  <div className="flex flex-1 items-center gap-1.5">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-base">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: habit.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(weekDone / 7) * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted shrink-0">
                      {weekDone}/7 this week
                    </span>
                  </div>
                  {bestDay && (
                    <span className="shrink-0 text-[10px] text-text-muted">
                      Best: {bestDay}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add habit */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New habit..."
          className="flex-1 rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 text-sm font-medium text-accent hover:bg-accent/15"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}
