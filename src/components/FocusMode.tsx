"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Target, Coffee, Play, Pause, RotateCcw, CheckCircle2,
  Zap, Volume2, VolumeX,
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useContentStore } from "@/store/contentStore";
import { useThemeStore } from "@/store/themeStore";

interface Props {
  secondsLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  progress: number;
  onToggle: () => void;
  onReset: () => void;
  onDistraction?: () => void;
}

const AMBIENT_SOUNDS = [
  { id: "rain",       label: "🌧️", title: "Rain" },
  { id: "whitenoise", label: "〰️", title: "White Noise" },
  { id: "forest",     label: "🌲", title: "Forest" },
  { id: "cafe",       label: "☕", title: "Café" },
  { id: "lofi",       label: "🎵", title: "Lo-fi" },
];

export default function FocusMode({
  secondsLeft, isRunning, isBreak, progress,
  onToggle, onReset, onDistraction,
}: Props) {
  const { focusModeOpen, closeFocusMode } = useDashboardStore();
  const { tasks, activeTaskId, toggleTask, logDistraction } = useContentStore();
  const { ambientSound, ambientVolume, setAmbientSound, setAmbientVolume } = useThemeStore();
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Distraction flash animation
  const [distractFlash, setDistractFlash] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ambient audio management
  useEffect(() => {
    if (!ambientSound) {
      audioRef.current?.pause();
      return;
    }
    if (!audioRef.current || audioRef.current.dataset.sound !== ambientSound) {
      audioRef.current?.pause();
      // In production: replace with actual audio files in /public/sounds/
      // audioRef.current = new Audio(`/sounds/${ambientSound}.mp3`);
      // For now: no-op audio object to avoid errors
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.dataset.sound = ambientSound;
    }
    audioRef.current.volume = ambientVolume;
    if (focusModeOpen) {
      audioRef.current.play().catch(() => {/* autoplay blocked */});
    } else {
      audioRef.current.pause();
    }
  }, [ambientSound, ambientVolume, focusModeOpen]);

  // Cleanup on unmount
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeFocusMode(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeFocusMode]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const r = 100;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  const handleDistraction = () => {
    logDistraction();
    onDistraction?.();
    setDistractFlash(true);
    setTimeout(() => setDistractFlash(false), 600);
  };

  const toggleSound = (soundId: string) => {
    setAmbientSound(ambientSound === soundId ? null : soundId);
  };

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
          {/* Radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${
                distractFlash
                  ? "color-mix(in srgb, var(--color-amber) 12%, transparent)"
                  : isBreak
                    ? "color-mix(in srgb, var(--color-cyan) 8%, transparent)"
                    : "color-mix(in srgb, var(--color-accent) 6%, transparent)"
              } 0%, transparent 70%)`,
              transition: "background 0.3s",
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
          <div className="mb-10 text-center">
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
          <div className="relative mb-10">
            <svg width="260" height="260" className="-rotate-90">
              <circle cx="130" cy="130" r={r} fill="none" stroke="var(--color-border-muted)" strokeWidth="6" opacity="0.3" />
              <motion.circle
                cx="130" cy="130" r={r}
                fill="none"
                stroke={isBreak ? "var(--color-cyan)" : "var(--color-accent)"}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isBreak ? <Coffee className="mb-2 h-7 w-7 text-cyan" /> : <Target className="mb-2 h-7 w-7 text-accent" />}
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

            {/* Distraction log button */}
            {isRunning && !isBreak && (
              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={handleDistraction}
                animate={distractFlash ? { scale: [1, 1.2, 1] } : {}}
                className="flex items-center gap-2 rounded-2xl bg-amber/10 px-4 py-3.5 text-amber transition-colors hover:bg-amber/15"
                title="Log distraction"
              >
                <Zap className="h-5 w-5" />
              </motion.button>
            )}

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

          {/* Ambient sound strip */}
          <div className="mt-8 flex items-center gap-3">
            <span className="text-xs text-text-muted">Ambient:</span>
            {AMBIENT_SOUNDS.map((s) => (
              <motion.button
                key={s.id}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleSound(s.id)}
                title={s.title}
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-base transition-all ${
                  ambientSound === s.id
                    ? "bg-accent/20 ring-1 ring-accent/40"
                    : "bg-surface/60 opacity-50 hover:opacity-100"
                }`}
              >
                {s.label}
              </motion.button>
            ))}
            {/* Volume */}
            <div className="ml-2 flex items-center gap-2">
              <VolumeX className="h-3.5 w-3.5 text-text-muted" />
              <input
                type="range" min={0} max={1} step={0.05}
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(Number(e.target.value))}
                className="w-20 accent-accent"
              />
              <Volume2 className="h-3.5 w-3.5 text-text-muted" />
            </div>
          </div>

          <p className="mt-8 text-xs text-text-muted">Press Escape to exit · ⚡ to log a distraction</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
