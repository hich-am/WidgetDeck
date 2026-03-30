"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Target, ChevronDown, Maximize2, Zap } from "lucide-react";
import { useContentStore, getTodayFocusMinutes } from "@/store/contentStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { FOCUS_MODE_PRESETS } from "@/types/widget";
import type { FocusModeConfig } from "@/types/widget";
import dynamic from "next/dynamic";

const FocusMode = dynamic(() => import("@/components/FocusMode"), { ssr: false });

const FOCUS_MODES: FocusModeConfig[] = [
  FOCUS_MODE_PRESETS.light,
  FOCUS_MODE_PRESETS.deep,
  {
    name: "custom",
    label: "Custom",
    workMinutes: 45,
    breakMinutes: 10,
    longBreakMinutes: 20,
    sessionsBeforeLongBreak: 3,
  },
];

export default function PomodoroWidget() {
  const {
    pomodoroSessions, incrementPomodoro, resetPomodoro,
    activeTaskId, setActiveTask, autoStartPomodoro, toggleAutoStart,
    focusLog, tasks,
    activeFocusMode, setFocusMode,
    currentSessionId,
  } = useContentStore();
  const { openFocusMode, closeFocusMode } = useDashboardStore();

  const [secondsLeft, setSecondsLeft] = useState(activeFocusMode.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionDistractions, setSessionDistractions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const workSeconds = activeFocusMode.workMinutes * 60;
  const breakSeconds = activeFocusMode.breakMinutes * 60;
  const totalSeconds = isBreak ? breakSeconds : workSeconds;
  const progress = 1 - secondsLeft / totalSeconds;
  const pendingTasks = tasks.filter((t) => !t.done);
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const todayFocus = getTodayFocusMinutes(focusLog);
  const todayFocusStr = todayFocus >= 60 ? `${Math.floor(todayFocus / 60)}h ${todayFocus % 60}m` : `${todayFocus}m`;

  // Reset timer when focus mode changes
  const handleModeSelect = (mode: FocusModeConfig) => {
    setFocusMode(mode);
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(mode.workMinutes * 60);
  };

  const clearTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => {
    if (!isRunning) { clearTimer(); return; }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((p) => {
        if (p <= 1) {
          setIsRunning(false);
          if (!isBreak) {
            incrementPomodoro(activeTaskId ?? undefined, activeTask?.title);
            setIsBreak(true);
            if (autoStartPomodoro) setIsRunning(true);
            return breakSeconds;
          } else {
            setIsBreak(false);
            if (autoStartPomodoro) setIsRunning(true);
            return workSeconds;
          }
        }
        return p - 1;
      });
    }, 1000);
    return clearTimer;
  }, [isRunning, isBreak, incrementPomodoro, activeTaskId, activeTask, autoStartPomodoro, clearTimer, breakSeconds, workSeconds]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(workSeconds);
    setSessionDistractions(0);
  };

  return (
    <div className="flex h-full flex-col items-center gap-3">
      {/* Focus mode tabs */}
      <div className="flex gap-1 rounded-xl bg-base p-0.5 w-full">
        {FOCUS_MODES.map((mode) => (
          <button
            key={mode.name}
            onClick={() => handleModeSelect(mode)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
              activeFocusMode.name === mode.name
                ? "bg-surface text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {mode.label}
            <span className="block text-[9px] opacity-60">{mode.workMinutes}m</span>
          </button>
        ))}
      </div>

      {/* Task selector */}
      <div className="w-full">
        <label className="mb-1.5 block text-xs font-medium text-text-muted">Working on</label>
        <div className="relative">
          <select
            value={activeTaskId ?? ""}
            onChange={(e) => setActiveTask(e.target.value || null)}
            className="w-full appearance-none rounded-xl border border-border-muted/60 bg-surface py-2.5 pl-3 pr-8 text-sm text-text-primary outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
          >
            <option value="">— No task selected —</option>
            {pendingTasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Timer ring */}
      <div className="relative">
        <svg width="176" height="176" className="-rotate-90">
          <circle cx="88" cy="88" r={radius} fill="none" stroke="var(--color-border-muted)" strokeWidth="5" opacity="0.4" />
          <motion.circle cx="88" cy="88" r={radius} fill="none"
            stroke={isBreak ? "var(--color-cyan)" : "var(--color-accent)"}
            strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5">
            {isBreak ? <Coffee className="h-4 w-4 text-cyan" /> : <Target className="h-4 w-4 text-accent" />}
            <span className="text-xs font-medium text-text-muted">{isBreak ? "Break" : "Focus"}</span>
          </div>
          <span className="text-4xl font-semibold tabular-nums text-text-primary">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          {/* Distraction counter under time */}
          {sessionDistractions > 0 && (
            <span className="text-[10px] text-text-muted mt-0.5">
              {sessionDistractions} distraction{sessionDistractions !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsRunning((r) => !r)}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium ${isRunning ? "bg-amber/10 text-amber-500" : "bg-accent/10 text-accent"}`}
        >
          {isRunning ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Start</>}
        </motion.button>
        <button onClick={reset} className="flex items-center gap-1.5 rounded-2xl bg-base px-4 py-2.5 text-sm text-text-muted hover:text-text-primary">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <button
          onClick={openFocusMode}
          title="Enter Focus Mode (F)"
          className="flex items-center gap-1.5 rounded-2xl bg-base px-3 py-2.5 text-sm text-text-muted hover:bg-accent/8 hover:text-accent"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex w-full items-center justify-between rounded-xl bg-base/60 px-4 py-2.5 text-xs text-text-muted">
        <span>Sessions: <strong className="text-text-primary">{pomodoroSessions}</strong></span>
        <span>Today: <strong className="text-text-primary">{todayFocusStr}</strong></span>
        <label className="flex cursor-pointer items-center gap-1.5">
          <input type="checkbox" checked={autoStartPomodoro} onChange={toggleAutoStart} className="h-3.5 w-3.5 rounded accent-accent" />
          Auto-start
        </label>
      </div>

      {/* Focus Mode overlay */}
      <FocusMode
        secondsLeft={secondsLeft}
        isRunning={isRunning}
        isBreak={isBreak}
        progress={progress}
        onToggle={() => setIsRunning((r) => !r)}
        onReset={reset}
        onDistraction={() => setSessionDistractions((n) => n + 1)}
      />
    </div>
  );
}
