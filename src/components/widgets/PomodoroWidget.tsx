"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Target } from "lucide-react";
import { useContentStore } from "@/store/contentStore";

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export default function PomodoroWidget() {
  const { pomodoroSessions, incrementPomodoro, resetPomodoro } = useContentStore();
  const [secondsLeft, setSecondsLeft] = useState(WORK_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = isBreak ? BREAK_SECONDS : WORK_SECONDS;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (!isBreak) {
            incrementPomodoro();
            setIsBreak(true);
            return BREAK_SECONDS;
          } else {
            setIsBreak(false);
            return WORK_SECONDS;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, isBreak, incrementPomodoro, clearTimer]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = 1 - secondsLeft / totalSeconds;

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(WORK_SECONDS);
  };

  // SVG circle params
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      {/* Timer circle */}
      <div className="relative">
        <svg width="176" height="176" className="-rotate-90">
          <circle
            cx="88"
            cy="88"
            r={radius}
            fill="none"
            stroke="var(--color-border-muted)"
            strokeWidth="5"
            opacity="0.4"
          />
          <motion.circle
            cx="88"
            cy="88"
            r={radius}
            fill="none"
            stroke={isBreak ? "var(--color-cyan)" : "var(--color-accent)"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5">
            {isBreak ? (
              <Coffee className="h-4 w-4 text-cyan" />
            ) : (
              <Target className="h-4 w-4 text-accent" />
            )}
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {isBreak ? "Break" : "Focus"}
            </span>
          </div>
          <span className="text-4xl font-semibold tabular-nums text-text-primary">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRunning((r) => !r)}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium transition-colors ${
            isRunning
              ? "bg-amber/10 text-amber"
              : "bg-accent/10 text-accent"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start
            </>
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="flex items-center gap-1.5 rounded-2xl bg-base px-4 py-2.5 text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </motion.button>
      </div>

      {/* Session count */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span>Sessions completed: {pomodoroSessions}</span>
        {pomodoroSessions > 0 && (
          <button onClick={resetPomodoro} className="text-text-muted underline transition-colors hover:text-accent">
            clear
          </button>
        )}
      </div>
    </div>
  );
}
