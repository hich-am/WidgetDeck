"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Zap } from "lucide-react";
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
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      {/* Timer circle */}
      <div className="relative">
        <svg width="170" height="170" className="-rotate-90">
          <circle
            cx="85"
            cy="85"
            r={radius}
            fill="none"
            stroke="var(--color-border-muted)"
            strokeWidth="6"
          />
          <motion.circle
            cx="85"
            cy="85"
            r={radius}
            fill="none"
            stroke={isBreak ? "var(--color-cyan)" : "var(--color-accent)"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1">
            {isBreak ? (
              <Coffee className="h-4 w-4 text-cyan" />
            ) : (
              <Zap className="h-4 w-4 text-accent" />
            )}
            <span className="text-[10px] uppercase tracking-widest text-text-muted">
              {isBreak ? "Break" : "Focus"}
            </span>
          </div>
          <span className="text-3xl font-semibold tabular-nums text-text-primary font-mono">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsRunning((r) => !r)}
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isRunning
              ? "bg-amber/10 text-amber"
              : "bg-accent/10 text-accent"
          }`}
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={reset}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-text-muted hover:text-text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </motion.button>
      </div>

      {/* Session count */}
      <div className="flex items-center gap-2 text-[10px] text-text-muted">
        <span>Sessions: {pomodoroSessions}</span>
        {pomodoroSessions > 0 && (
          <button onClick={resetPomodoro} className="text-text-muted hover:text-amber underline">
            reset
          </button>
        )}
      </div>
    </div>
  );
}
