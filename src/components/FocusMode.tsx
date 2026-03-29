"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Target, Coffee, Play, Pause, RotateCcw, CheckCircle2,
  Zap, Volume2, VolumeX, ChevronRight, Star, Sparkles,
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

const INTENTIONS = [
  "Stay fully focused on this task",
  "No distractions for this session",
  "Make meaningful progress",
  "Complete this without interruption",
];

export default function FocusMode({
  secondsLeft, isRunning, isBreak, progress,
  onToggle, onReset, onDistraction,
}: Props) {
  const { focusModeOpen, closeFocusMode, focusPhase, setFocusPhase } = useDashboardStore();
  const { tasks, activeTaskId, setActiveTask, toggleTask, logDistraction, addSessionNote, currentSessionId, focusLog } = useContentStore();
  const { ambientSound, ambientVolume, setAmbientSound, setAmbientVolume } = useThemeStore();

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const [distractFlash, setDistractFlash] = useState(false);
  const [intention, setIntention] = useState("");
  const [focusRating, setFocusRating] = useState(0);
  const [markComplete, setMarkComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Detect session end to move to reflection
  const prevIsRunning = useRef(isRunning);
  useEffect(() => {
    if (prevIsRunning.current && !isRunning && !isBreak && secondsLeft === 0 && focusPhase === "focus") {
      setFocusPhase("reflection");
    }
    prevIsRunning.current = isRunning;
  }, [isRunning, isBreak, secondsLeft, focusPhase, setFocusPhase]);

  // Move to focus phase when timer starts
  useEffect(() => {
    if (isRunning && focusPhase === "ritual") {
      setFocusPhase("focus");
    }
  }, [isRunning, focusPhase, setFocusPhase]);

  // Ambient audio
  useEffect(() => {
    if (!ambientSound) { audioRef.current?.pause(); return; }
    if (!audioRef.current || audioRef.current.dataset.sound !== ambientSound) {
      audioRef.current?.pause();
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.dataset.sound = ambientSound;
    }
    audioRef.current.volume = ambientVolume;
    if (focusModeOpen && focusPhase === "focus") {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [ambientSound, ambientVolume, focusModeOpen, focusPhase]);

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

  const toggleSound = (soundId: string) => setAmbientSound(ambientSound === soundId ? null : soundId);

  const handleStartFocus = () => {
    setFocusPhase("focus");
    onToggle(); // start the timer
  };

  const handleReflectionSave = () => {
    if (markComplete && activeTask) toggleTask(activeTask.id);
    if (currentSessionId && focusRating > 0) {
      addSessionNote(currentSessionId, `Rating: ${focusRating}/5. ${intention ? `Goal: ${intention}` : ""}`);
    }
    closeFocusMode();
  };

  const currentSession = focusLog.find((f) => f.id === currentSessionId);
  const distractionCount = currentSession?.distractionCount ?? 0;

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
          {/* Background glow */}
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

          {/* ── RITUAL SCREEN ── */}
          <AnimatePresence mode="wait">
            {focusPhase === "ritual" && (
              <motion.div
                key="ritual"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex w-full max-w-md flex-col gap-6 px-8"
              >
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">Pre-Focus Ritual</p>
                  <h1 className="text-2xl font-bold tracking-tight text-text-primary">Set your intention</h1>
                </div>

                {/* Task selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-muted">What will you work on?</label>
                  <select
                    value={activeTaskId ?? ""}
                    onChange={(e) => setActiveTask(e.target.value || null)}
                    className="w-full rounded-2xl border border-border-muted/60 bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
                  >
                    <option value="">No specific task</option>
                    {tasks.filter((t) => !t.done).map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                {/* Intention */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-muted">Set an intention</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {INTENTIONS.map((i) => (
                      <button
                        key={i}
                        onClick={() => setIntention(i)}
                        className={`rounded-xl px-3 py-1.5 text-xs transition-all ${
                          intention === i ? "bg-accent/15 text-accent ring-1 ring-accent/30" : "bg-base text-text-muted hover:text-text-primary"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                  <input
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="Or write your own..."
                    className="w-full rounded-2xl border border-border-muted/60 bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
                  />
                </div>

                {/* Sound picker */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-muted">Ambient sound</label>
                  <div className="flex items-center gap-2">
                    {AMBIENT_SOUNDS.map((s) => (
                      <motion.button
                        key={s.id}
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSound(s.id)}
                        title={s.title}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${
                          ambientSound === s.id ? "bg-accent/20 ring-1 ring-accent/40" : "bg-surface/60 opacity-60 hover:opacity-100"
                        }`}
                      >
                        {s.label}
                      </motion.button>
                    ))}
                    <div className="ml-auto flex items-center gap-2">
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
                </div>

                {/* Start button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartFocus}
                  className="flex items-center justify-center gap-3 rounded-2xl bg-accent/15 px-8 py-4 text-base font-semibold text-accent transition-colors hover:bg-accent/20"
                >
                  <Play className="h-5 w-5" /> Start Focus Session
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}

            {/* ── FOCUS SCREEN ── */}
            {(focusPhase === "focus" || focusPhase === "break") && (
              <motion.div
                key="focus"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="flex flex-col items-center"
              >
                {/* Task name */}
                <div className="mb-10 text-center">
                  <p className="mb-2 text-sm font-medium uppercase tracking-widest text-text-muted">
                    {isBreak ? "Take a break" : "Focusing on"}
                  </p>
                  {activeTask && !isBreak ? (
                    <h1 className="max-w-lg text-3xl font-bold tracking-tight text-text-primary">{activeTask.title}</h1>
                  ) : isBreak ? (
                    <h1 className="text-2xl font-semibold text-text-muted">You&apos;ve earned it 🎉</h1>
                  ) : (
                    intention ? (
                      <p className="max-w-md text-lg font-medium text-text-muted/80 italic">"{intention}"</p>
                    ) : (
                      <p className="text-text-muted">No task selected</p>
                    )
                  )}
                </div>

                {/* Ring timer */}
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
                    {isRunning ? <><Pause className="h-5 w-5" /> Pause</> : <><Play className="h-5 w-5" /> Resume</>}
                  </motion.button>
                  <button onClick={onReset} className="flex items-center gap-2 rounded-2xl p-3.5 text-text-muted transition-colors hover:bg-surface hover:text-text-primary">
                    <RotateCcw className="h-5 w-5" />
                  </button>
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
                      <CheckCircle2 className="h-5 w-5" /> Done
                    </motion.button>
                  )}
                </div>

                {/* Ambient sounds */}
                <div className="mt-8 flex items-center gap-3">
                  <span className="text-xs text-text-muted">Ambient:</span>
                  {AMBIENT_SOUNDS.map((s) => (
                    <motion.button
                      key={s.id} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSound(s.id)} title={s.title}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-base transition-all ${
                        ambientSound === s.id ? "bg-accent/20 ring-1 ring-accent/40" : "bg-surface/60 opacity-50 hover:opacity-100"
                      }`}
                    >
                      {s.label}
                    </motion.button>
                  ))}
                  <div className="ml-2 flex items-center gap-2">
                    <VolumeX className="h-3.5 w-3.5 text-text-muted" />
                    <input type="range" min={0} max={1} step={0.05} value={ambientVolume}
                      onChange={(e) => setAmbientVolume(Number(e.target.value))} className="w-20 accent-accent" />
                    <Volume2 className="h-3.5 w-3.5 text-text-muted" />
                  </div>
                </div>

                <p className="mt-6 text-xs text-text-muted">Press Escape to exit · ⚡ to log a distraction</p>
              </motion.div>
            )}

            {/* ── REFLECTION SCREEN ── */}
            {focusPhase === "reflection" && (
              <motion.div
                key="reflection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex w-full max-w-md flex-col gap-6 px-8"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="mb-3 text-5xl"
                  >
                    🎯
                  </motion.div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">Session Complete!</p>
                  <h1 className="text-2xl font-bold tracking-tight text-text-primary">How did it go?</h1>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-base/80 p-4 text-center">
                    <p className="text-2xl font-bold text-text-primary">{currentSession?.minutes ?? 0}</p>
                    <p className="text-xs text-text-muted">Minutes focused</p>
                  </div>
                  <div className="rounded-2xl bg-base/80 p-4 text-center">
                    <p className="text-2xl font-bold text-text-primary">{distractionCount}</p>
                    <p className="text-xs text-text-muted">Distractions logged</p>
                  </div>
                </div>

                {/* Did you complete it? */}
                {activeTask && (
                  <button
                    onClick={() => setMarkComplete((v) => !v)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                      markComplete
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : "border-border-muted/40 bg-base/50 text-text-muted hover:border-accent/20 hover:bg-accent/5 hover:text-text-primary"
                    }`}
                  >
                    {markComplete ? <CheckCircle2 className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                    Mark "{activeTask.title}" as complete
                  </button>
                )}

                {/* Rating */}
                <div>
                  <p className="mb-2 text-xs font-medium text-text-muted">Rate your focus (1–5)</p>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((n) => (
                      <motion.button
                        key={n}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFocusRating(n)}
                        className={`text-2xl transition-all ${n <= focusRating ? "opacity-100" : "opacity-30"}`}
                      >
                        ⭐
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReflectionSave}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-accent/15 px-8 py-4 text-base font-semibold text-accent hover:bg-accent/20"
                >
                  <Sparkles className="h-5 w-5" /> Save & Close
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
