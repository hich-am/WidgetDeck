"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Flame } from "lucide-react";
import { useContentStore } from "@/store/contentStore";

const COLORS = ["#6C63FF", "#22D3EE", "#F59E0B", "#10B981", "#F472B6", "#A78BFA", "#FB923C"];

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
    <div className="flex h-full flex-col gap-3">
      {/* Day headers */}
      <div className="grid gap-1" style={{ gridTemplateColumns: "1fr repeat(7, 28px) 40px" }}>
        <div />
        {last7.map((d) => (
          <div key={d} className="text-center text-[9px] font-medium text-text-muted">
            {getDayLabel(d)}
          </div>
        ))}
        <div className="text-center text-[9px] font-medium text-text-muted">🔥</div>
      </div>

      {/* Habit rows */}
      <div className="flex-1 space-y-1 overflow-auto">
        {habits.length === 0 && (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">
            Add a habit to start tracking
          </div>
        )}
        {habits.map((habit) => {
          const streak = getStreak(habit.completedDates);
          return (
            <div
              key={habit.id}
              className="group grid items-center gap-1"
              style={{ gridTemplateColumns: "1fr repeat(7, 28px) 40px" }}
            >
              <div className="flex items-center gap-1 min-w-0">
                <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} />
                <span className="truncate text-[11px] text-text-primary">{habit.name}</span>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="shrink-0 text-text-muted opacity-0 hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>

              {last7.map((date) => {
                const done = habit.completedDates.includes(date);
                return (
                  <motion.button
                    key={date}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleHabitDate(habit.id, date)}
                    className={`mx-auto flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                      done
                        ? "bg-opacity-100"
                        : "bg-base hover:bg-border-muted"
                    }`}
                    style={done ? { backgroundColor: habit.color + "30" } : {}}
                  >
                    {done && (
                      <div
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: habit.color }}
                      />
                    )}
                  </motion.button>
                );
              })}

              <div className="flex items-center justify-center gap-0.5 text-[10px]">
                {streak > 0 && <Flame className="h-3 w-3 text-amber" />}
                <span className="text-text-muted">{streak}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add habit */}
      <div className="flex gap-1">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New habit..."
          className="flex-1 rounded-lg border border-border-muted bg-surface px-2 py-1 text-[11px] text-text-primary placeholder-text-muted outline-none focus:border-accent/50"
        />
        <button
          onClick={handleAdd}
          className="rounded-lg bg-accent/10 px-2 text-accent hover:bg-accent/20"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
