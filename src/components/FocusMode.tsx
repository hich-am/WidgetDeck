"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Coffee, Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useContentStore } from "@/store/contentStore";

interface Props {
  secondsLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  progress: number;
  onToggle: () => void;
  onReset: () => void;
}

export default function FocusMode({
  secondsLeft,
  isRunning,
  isBreak,
  progress,
  onToggle,
  onReset,
}: Props) {
  const { focusModeOpen, closeFocusMode } = useDashboardStore();
  const { tasks, activeTaskId, toggleTask } = useContentStore();
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFocusMode();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeFocusMode]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const r = 100;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <AnimatePresence>
      {focusModeOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center"
          style={{ background: "var(--color-base)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Subtle radial glow behind ring */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${isBreak ? "color-mix(in srgb, var(--color-cyan) 8%, transparent)" : "color-mix(in srgb, var(--color-accent) 6%, transparent)"} 0%, transparent 70%)`,
            }}
          />

          {/* Close */}
          <button
            onClick={closeFocusMode}
            className="absolute right-8 top-8 rounded-2xl p-2.5 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Task name */}
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-text-muted">
              {isBreak ? "Take a break" : "Focusing on"}
            </p>
            {activeTask && !isBreak ? (
              <h1 className="max-w-lg text-3xl font-bold tracking-tight text-text-primary">
                {activeTask.title}
              </h1>
            ) : isBreak ? (
              <h1 className="text-2xl font-semibold text-text-muted">You've earned it 🎉</h1>
            ) : (
              <p className="text-text-muted">No task selected</p>
            )}
          </div>

          {/* Giant ring */}
          <div className="relative mb-12">
            <svg width="260" height="260" className="-rotate-90">
              <circle
                cx="130" cy="130" r={r}
                fill="none"
                stroke="var(--color-border-muted)"
                strokeWidth="6"
                opacity="0.3"
              />
              <motion.circle
                cx="130" cy="130" r={r}
                fill="none"
                stroke={isBreak ? "var(--color-cyan)" : "var(--color-accent)"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isBreak
                ? <Coffee className="mb-2 h-7 w-7 text-cyan" />
                : <Target className="mb-2 h-7 w-7 text-accent" />}
              <span className="text-6xl font-bold tabular-nums text-text-primary">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={onToggle}
              className={`flex items-center gap-2.5 rounded-2xl px-8 py-3.5 text-base font-semibold transition-colors ${
                isRunning ? "bg-amber/10 text-amber" : "bg-accent/10 text-accent"
              }`}
            >
              {isRunning ? <><Pause className="h-5 w-5" /> Pause</> : <><Play className="h-5 w-5" /> Start</>}
            </motion.button>

            <button onClick={onReset}
              className="flex items-center gap-2 rounded-2xl p-3.5 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            {activeTask && !isBreak && (
              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={() => { toggleTask(activeTask.id); closeFocusMode(); }}
                className="flex items-center gap-2.5 rounded-2xl bg-cyan/10 px-6 py-3.5 text-base font-semibold text-cyan transition-colors"
              >
                <CheckCircle2 className="h-5 w-5" />
                Done
              </motion.button>
            )}
          </div>

          <p className="mt-10 text-xs text-text-muted">Press Escape to exit focus mode</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
