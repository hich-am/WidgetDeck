"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Flame, Check } from "lucide-react";
import { useContentStore } from "@/store/contentStore";

const COLORS = ["#5B8DEF", "#5CB99A", "#E8956A", "#9B8FC4", "#E87E7E", "#6BC5D2", "#D4804A"];

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2);
}

function getStreak(completedDates: string[]): number {
  const sorted = [...completedDates].sort().reverse();
  if (sorted.length === 0) return 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const curr = new Date(sorted[i] + "T00:00:00");
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
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
      {/* Day headers */}
      <div className="grid items-end gap-1.5" style={{ gridTemplateColumns: "1fr repeat(7, 32px) 44px" }}>
        <div />
        {last7.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-text-muted">
            {getDayLabel(d)}
          </div>
        ))}
        <div className="text-center text-[10px] font-medium text-text-muted">Streak</div>
      </div>

      {/* Habit rows */}
      <div className="flex-1 space-y-1.5 overflow-auto">
        {habits.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            Add a habit to start tracking
          </div>
        )}
        {habits.map((habit) => {
          const streak = getStreak(habit.completedDates);
          const completedCount = last7.filter((d) => habit.completedDates.includes(d)).length;
          return (
            <div
              key={habit.id}
              className="group grid items-center gap-1.5"
              style={{ gridTemplateColumns: "1fr repeat(7, 32px) 44px" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} />
                <span className="truncate text-sm text-text-primary">{habit.name}</span>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="shrink-0 text-text-muted opacity-0 hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              {last7.map((date) => {
                const done = habit.completedDates.includes(date);
                return (
                  <motion.button
                    key={date}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleHabitDate(habit.id, date)}
                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                      done
                        ? ""
                        : "bg-base hover:bg-border-muted/40"
                    }`}
                    style={done ? { backgroundColor: habit.color + "18" } : {}}
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

              <div className="flex items-center justify-center gap-0.5">
                {streak > 0 && <Flame className="h-3.5 w-3.5 text-amber" />}
                <span className="text-xs font-medium text-text-muted">{streak}</span>
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
