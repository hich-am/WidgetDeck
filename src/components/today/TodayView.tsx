"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Trash2,
  ChevronRight,
  CheckSquare,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Target,
  BookOpen,
  Flame,
} from "lucide-react";
import { useContentStore, computeForgivingStreak } from "@/store/contentStore";
import { useDashboardStore } from "@/store/dashboardStore";
import TodayHeader from "./TodayHeader";
import QuickCapture from "./QuickCapture";
import MotivationalMessage from "./MotivationalMessage";

// ── Inline compact Pomodoro hook ──
const WORK_S = 25 * 60;
const BREAK_S = 5 * 60;

function usePomodoroTimer() {
  const { incrementPomodoro, activeTaskId, autoStartPomodoro, tasks } = useContentStore();
  const [secondsLeft, setSecondsLeft] = useState(WORK_S);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const total = isBreak ? BREAK_S : WORK_S;
  const progress = 1 - secondsLeft / total;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((p) => {
        if (p <= 1) {
          setRunning(false);
          if (!isBreak) {
            const t = tasks.find((x) => x.id === activeTaskId);
            incrementPomodoro(activeTaskId ?? undefined, t?.title);
            setIsBreak(true);
            if (autoStartPomodoro) setRunning(true);
            return BREAK_S;
          } else {
            setIsBreak(false);
            if (autoStartPomodoro) setRunning(true);
            return WORK_S;
          }
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, isBreak, incrementPomodoro, activeTaskId, tasks, autoStartPomodoro]);

  const reset = () => { setRunning(false); setIsBreak(false); setSecondsLeft(WORK_S); };

  return { secondsLeft, running, setRunning, isBreak, progress, total, reset };
}

// ── Helpers ──
function today(): string { return new Date().toISOString().split("T")[0]; }
function yesterday(): string {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export default function TodayView() {
  const {
    tasks, toggleTask, deleteTask,
    habits, toggleHabitDate,
    notes, ensureDailyJournal, setActiveNote,
    carryOverTasks,
    activeTaskId, setActiveTask,
  } = useContentStore();
  const { expandWidget } = useDashboardStore();
  const pomodoro = usePomodoroTimer();
  const todayStr = today();

  // Run carry-over on mount
  useEffect(() => { carryOverTasks(); }, [carryOverTasks]);

  // Today's tasks: no due date OR due today/yesterday (carried over)
  const todayTasks = useMemo(() =>
    tasks.filter((t) => !t.dueDate || t.dueDate === todayStr || t.dueDate === yesterday())
      .sort((a, b) => {
        // Pending first, then by priority
        if (a.done !== b.done) return a.done ? 1 : -1;
        const p = { high: 0, medium: 1, low: 2 };
        return p[a.priority] - p[b.priority];
      }),
  [tasks, todayStr]);

  const pendingTasks = todayTasks.filter((t) => !t.done);
  const doneTasks = todayTasks.filter((t) => t.done);
  const todayHabits = habits;

  // Pomodoro ring
  const r = 32;
  const circ = 2 * Math.PI * r;
  const pOffset = circ * (1 - pomodoro.progress);
  const pMin = Math.floor(pomodoro.secondsLeft / 60);
  const pSec = pomodoro.secondsLeft % 60;

  const priorityDot: Record<string, string> = {
    high: "#E87E7E", medium: "#E8956A", low: "#8E8EA0",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">

      {/* ── Header & progress ── */}
      <TodayHeader tasks={todayTasks} />

      {/* ── Motivational line ── */}
      <MotivationalMessage total={todayTasks.length} done={doneTasks.length} />

      {/* ── Quick Capture ── */}
      <section>
        <QuickCapture />
      </section>

      {/* ── Today's Tasks ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Today&apos;s Tasks</h2>
          <button
            onClick={() => expandWidget("tasks")}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
          >
            All tasks <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-1.5">
          {pendingTasks.length === 0 && doneTasks.length === 0 && (
            <p className="text-sm text-text-muted py-2">No tasks for today yet. Add one above!</p>
          )}
          <AnimatePresence initial={false}>
            {pendingTasks.slice(0, 6).map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="group flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-sm"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="shrink-0 transition-transform active:scale-90"
                >
                  <Circle className="h-5 w-5 text-text-muted/40" />
                </button>
                <span className="flex-1 text-sm text-text-primary">{task.title}</span>
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: priorityDot[task.priority] }}
                />
                <button
                  onClick={() => setActiveTask(task.id === activeTaskId ? null : task.id)}
                  className={`shrink-0 rounded-lg p-1 text-[10px] font-medium transition-colors ${
                    activeTaskId === task.id
                      ? "bg-accent/10 text-accent"
                      : "text-text-muted opacity-0 group-hover:opacity-100 hover:bg-base"
                  }`}
                  title="Focus on this task"
                >
                  <Target className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="shrink-0 text-text-muted opacity-0 hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Completed tasks (collapsed) */}
          {doneTasks.length > 0 && (
            <AnimatePresence initial={false}>
              {doneTasks.slice(0, 3).map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-2xl bg-surface/60 px-4 py-2.5"
                >
                  <button onClick={() => toggleTask(task.id)} className="shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  </button>
                  <span className="flex-1 text-sm text-text-muted line-through">{task.title}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* ── Habit Check-ins ── */}
      {todayHabits.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Habits</h2>
            <button
              onClick={() => expandWidget("habits")}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
            >
              Manage <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {todayHabits.map((habit) => {
              const done = habit.completedDates.includes(todayStr);
              const streak = computeForgivingStreak(habit.completedDates);
              return (
                <motion.button
                  key={habit.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => toggleHabitDate(habit.id, todayStr)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl px-4 py-3 transition-all ${
                    done ? "shadow-sm" : "bg-surface"
                  }`}
                  style={done ? { backgroundColor: habit.color + "15", border: `1.5px solid ${habit.color}30` } : {}}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                      done ? "" : "bg-base"
                    }`}
                    style={done ? { backgroundColor: habit.color + "25" } : {}}
                  >
                    {done ? (
                      <CheckCircle2 className="h-6 w-6" style={{ color: habit.color }} />
                    ) : (
                      <Circle className="h-6 w-6 text-text-muted/30" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-text-primary max-w-[64px] truncate">
                    {habit.name}
                  </span>
                  {streak > 0 && (
                    <span className="text-[10px] text-text-muted inline-flex items-center gap-1">
                      <Flame className="h-3 w-3 text-amber-500" />
                      {streak}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Compact Pomodoro ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Focus Timer</h2>
        <div className="flex items-center gap-6 rounded-2xl bg-surface px-6 py-5 shadow-sm">
          {/* Ring */}
          <div className="relative shrink-0">
            <svg width="80" height="80" className="-rotate-90">
              <circle cx="40" cy="40" r={r} fill="none"
                stroke="var(--color-border-muted)" strokeWidth="4" opacity="0.4" />
              <motion.circle cx="40" cy="40" r={r} fill="none"
                stroke={pomodoro.isBreak ? "var(--color-cyan)" : "var(--color-accent)"}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={pOffset}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {pomodoro.isBreak
                ? <Coffee className="h-4 w-4 text-cyan" />
                : <Target className="h-4 w-4 text-accent" />}
            </div>
          </div>

          {/* Time + controls */}
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-text-primary">
                {String(pMin).padStart(2, "0")}:{String(pSec).padStart(2, "0")}
              </span>
              <span className="text-xs text-text-muted">
                {pomodoro.isBreak ? "Break" : "Focus"}
              </span>
            </div>
            {activeTaskId && (
              <p className="text-xs text-text-muted truncate">
                Working on: {tasks.find((t) => t.id === activeTaskId)?.title ?? "—"}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => pomodoro.setRunning((r) => !r)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  pomodoro.running ? "bg-amber/10 text-amber-500" : "bg-accent/10 text-accent"
                }`}
              >
                {pomodoro.running ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Start</>}
              </button>
              <button
                onClick={pomodoro.reset}
                className="rounded-xl p-1.5 text-text-muted hover:bg-base hover:text-text-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Daily Journal shortcut ── */}
      <section>
        <button
          onClick={() => { ensureDailyJournal(); expandWidget("notes"); }}
          className="flex w-full items-center gap-3 rounded-2xl bg-surface px-6 py-4 shadow-sm transition-colors hover:bg-base/50 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/8">
            <BookOpen className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-text-primary">Open Today&apos;s Journal</p>
            <p className="text-xs text-text-muted">Capture your thoughts for the day</p>
          </div>
          <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-accent transition-colors" />
        </button>
      </section>


    </div>
  );
}
