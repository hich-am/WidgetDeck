"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Circle, CheckCircle2, CalendarDays, Zap, Brain, Battery,
  ChevronRight, ChevronDown, X, SlidersHorizontal, FileText, AlignLeft,
  Check, ListTodo, Tag, Sparkles, CheckSquare,
} from "lucide-react";
import { useContentStore } from "@/store/contentStore";
import { useWhatNext } from "@/hooks/useWhatNext";
import type { Task, EnergyLevel, TaskDensity, Subtask } from "@/types/widget";

// ─── Configs ───────────────────────────────────────────────────────────────

const priorityConfig: Record<Task["priority"], { label: string; bg: string; text: string; ring: string }> = {
  low:    { label: "Low",  bg: "rgba(142,142,160,0.1)",  text: "#8E8EA0",  ring: "#8E8EA040" },
  medium: { label: "Med",  bg: "rgba(232,149,106,0.12)", text: "#D4804A",  ring: "#D4804A40" },
  high:   { label: "High", bg: "rgba(232,126,126,0.12)", text: "#D45B5B",  ring: "#D45B5B40" },
};

const energyConfig: Record<NonNullable<Task["energyLevel"]>, { label: string; icon: React.ElementType; color: string }> = {
  low:    { label: "Easy",      icon: Battery, color: "#5CB99A" },
  medium: { label: "Normal",    icon: Zap,     color: "#E8956A" },
  deep:   { label: "Deep Work", icon: Brain,   color: "#9B8FC4" },
};

const DENSITY_CONFIG: Record<TaskDensity, { py: string; text: string; gap: string }> = {
  comfortable: { py: "py-3",   text: "text-sm",  gap: "gap-3" },
  compact:     { py: "py-2",   text: "text-sm",  gap: "gap-2.5" },
  ultra:       { py: "py-1.5", text: "text-xs",  gap: "gap-2" },
};

// ─── Natural Language Parser ───────────────────────────────────────────────

interface ParsedTask {
  title: string;
  priority: Task["priority"];
  dueDate?: string;
  tags: string[];
  projectName?: string;
}

function todayStr() { return new Date().toISOString().split("T")[0]; }
function formatDue(dueDate?: string): { text: string; overdue: boolean } | null {
  if (!dueDate) return null;
  const t = todayStr();
  if (dueDate === t) return { text: "Today", overdue: false };
  const d = new Date(dueDate + "T00:00:00");
  const diff = Math.round((d.getTime() - new Date().setHours(0,0,0,0)) / 86400000);
  if (diff === 1) return { text: "Tomorrow", overdue: false };
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, overdue: true };
  return { text: d.toLocaleDateString("en", { month: "short", day: "numeric" }), overdue: false };
}

function getDateFromNL(token: string): string | undefined {
  const lower = token.toLowerCase();
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

  if (lower === "today") return fmt(today);
  if (lower === "tomorrow") { const d = new Date(today); d.setDate(d.getDate()+1); return fmt(d); }
  if (lower === "nextweek") { const d = new Date(today); d.setDate(d.getDate()+7); return fmt(d); }

  const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const dayIdx = days.indexOf(lower);
  if (dayIdx >= 0) {
    const d = new Date(today);
    const diff = (dayIdx - today.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return fmt(d);
  }
  return undefined;
}

function parseNL(input: string): ParsedTask {
  const tokens = input.split(/\s+/);
  const titleParts: string[] = [];
  let priority: Task["priority"] = "medium";
  let dueDate: string | undefined;
  const tags: string[] = [];
  let projectName: string | undefined;

  for (const token of tokens) {
    if (token.startsWith("!")) {
      const p = token.slice(1).toLowerCase();
      if (p === "high" || p === "h") { priority = "high"; continue; }
      if (p === "low" || p === "l") { priority = "low"; continue; }
      if (p === "med" || p === "medium" || p === "m") { priority = "medium"; continue; }
    }
    if (token.startsWith("#")) { tags.push(token.slice(1)); continue; }
    if (token.startsWith("@")) { projectName = token.slice(1); continue; }
    const maybeDate = getDateFromNL(token);
    if (maybeDate) { dueDate = maybeDate; continue; }
    titleParts.push(token);
  }

  return { title: titleParts.join(" "), priority, dueDate, tags, projectName };
}

// ─── Aging ─────────────────────────────────────────────────────────────────
type AgingState = "fresh" | "aging" | "neglected";
function taskAgingState(task: Task): AgingState {
  if (task.done) return "fresh";
  const diff = Math.floor((Date.now() - new Date(task.createdAt).getTime()) / 86400000);
  if (diff >= 14) return "neglected";
  if (diff >= 7) return "aging";
  return "fresh";
}
const agingBorder: Record<AgingState, string> = {
  fresh: "", aging: "border-l-2 border-amber", neglected: "border-l-2 border-red-400",
};

const CONFETTI_DOTS = Array.from({ length: 12 }, (_, i) => {
  const radius = 40 + (i % 3) * 10;
  return {
    i,
    x: Math.cos((i / 12) * Math.PI * 2) * radius,
    y: Math.sin((i / 12) * Math.PI * 2) * radius,
    color: ["#5B8DEF", "#5CB99A", "#E8956A", "#9B8FC4", "#E87E7E", "#F59E0B"][i % 6],
  };
});

// ─── Confetti ──────────────────────────────────────────────────────────────
function MiniConfetti({ active }: { active: boolean }) {
  const dots = CONFETTI_DOTS;
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
      {dots.map(({ i, x, y, color }) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x, y, opacity: 0, scale: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ─── All Caught Up Screen ──────────────────────────────────────────────────
function AllCaughtUp({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center gap-4 py-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-amber"
      >
        <CheckCircle2 className="h-12 w-12" />
      </motion.div>
      <div className="text-center">
        <p className="text-base font-semibold text-text-primary">You&apos;re all caught up!</p>
        <p className="mt-1 text-xs text-text-muted">Nothing left to do. Enjoy the moment.</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onAdd}
        className="flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/15"
      >
        <Plus className="h-4 w-4" /> Add a task
      </motion.button>
    </motion.div>
  );
}

// ─── Subtask row ───────────────────────────────────────────────────────────
function SubtaskRow({ st, taskId }: { st: Subtask; taskId: string }) {
  const { toggleSubtask, deleteSubtask } = useContentStore();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="group flex items-center gap-2 pl-2"
    >
      <button onClick={() => toggleSubtask(taskId, st.id)} className="shrink-0">
        {st.done
          ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
          : <Circle className="h-3.5 w-3.5 text-text-muted/40" />}
      </button>
      <span className={`flex-1 text-xs ${st.done ? "line-through text-text-muted" : "text-text-primary"}`}>{st.title}</span>
      <button onClick={() => deleteSubtask(taskId, st.id)} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400">
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

// ─── Task Peek Panel ───────────────────────────────────────────────────────
function TaskPeekPanel({ task, onClose }: { task: Task; onClose: () => void }) {
  const { updateTask, addSubtask, toggleSubtask, deleteSubtask } = useContentStore();
  const [desc, setDesc] = useState(task.description ?? "");
  const [newSub, setNewSub] = useState("");
  const [showSubInput, setShowSubInput] = useState(false);

  const progress = useMemo(() => {
    const subs = task.subtasks ?? [];
    if (!subs.length) return null;
    return { done: subs.filter((s) => s.done).length, total: subs.length };
  }, [task.subtasks]);

  return (
    <motion.div
      className="flex h-full flex-col border-l border-border-muted/40 bg-surface/70 backdrop-blur-sm"
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border-muted/30 px-4 py-3">
        <span className="flex-1 text-sm font-semibold text-text-primary truncate">{task.title}</span>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto px-4 py-3 space-y-4">
        {/* Description */}
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            <AlignLeft className="h-3 w-3" /> Description
          </div>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onBlur={() => updateTask(task.id, { description: desc })}
            placeholder="Add a description..."
            rows={3}
            className="w-full resize-none rounded-xl border border-border-muted/50 bg-base/60 px-3 py-2 text-xs text-text-primary placeholder-text-muted outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10"
          />
        </div>

        {/* Subtasks */}
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            <ListTodo className="h-3 w-3" /> Subtasks
            {progress && <span className="ml-auto text-[10px] text-text-muted">{progress.done}/{progress.total}</span>}
          </div>

          {/* Progress ring */}
          {progress && (
            <div className="mb-2 flex items-center gap-2">
              <svg width="28" height="28" className="-rotate-90">
                <circle cx="14" cy="14" r="10" fill="none" stroke="var(--color-border-muted)" strokeWidth="3" opacity="0.3" />
                <motion.circle
                  cx="14" cy="14" r="10"
                  fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 10}
                  strokeDashoffset={2 * Math.PI * 10 * (1 - progress.done / progress.total)}
                  transition={{ duration: 0.4 }}
                />
              </svg>
              <span className="text-xs text-text-muted">{Math.round((progress.done / progress.total) * 100)}% complete</span>
            </div>
          )}

          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {(task.subtasks ?? []).map((st) => (
                <SubtaskRow key={st.id} st={st} taskId={task.id} />
              ))}
            </AnimatePresence>
          </div>

          {showSubInput ? (
            <div className="mt-2 flex gap-1.5">
              <input
                autoFocus
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSub.trim()) { addSubtask(task.id, newSub.trim()); setNewSub(""); }
                  if (e.key === "Escape") { setShowSubInput(false); setNewSub(""); }
                }}
                placeholder="Subtask name..."
                className="flex-1 rounded-lg border border-border-muted/50 bg-base px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent/40"
              />
              <button
                onClick={() => { if (newSub.trim()) { addSubtask(task.id, newSub.trim()); setNewSub(""); } }}
                className="rounded-lg bg-accent/10 px-2 text-xs text-accent"
              >Add</button>
            </div>
          ) : (
            <button
              onClick={() => setShowSubInput(true)}
              className="mt-1.5 flex items-center gap-1 text-[11px] text-text-muted hover:text-accent"
            >
              <Plus className="h-3 w-3" /> Add subtask
            </button>
          )}
        </div>

        {/* Tags */}
        {(task.tags ?? []).length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              <Tag className="h-3 w-3" /> Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(task.tags ?? []).map((tag) => (
                <span key={tag} className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">#{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">History</div>
          <p className="text-[10px] text-text-muted/60">
            Created {new Date(task.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
          </p>
          {task.completedAt && (
            <p className="text-[10px] text-text-muted/60">
              Completed {new Date(task.completedAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Task Row ──────────────────────────────────────────────────────────────
function TaskRow({
  task, onToggle, onDelete, onPeek, density, selected, onSelect,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPeek: (task: Task) => void;
  density: TaskDensity;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const [completionFlash, setCompletionFlash] = useState(false);
  const config = priorityConfig[task.priority];
  const due = formatDue(task.dueDate);
  const energy = task.energyLevel ? energyConfig[task.energyLevel] : null;
  const EnergyIcon = energy?.icon;
  const aging = taskAgingState(task);
  const dc = DENSITY_CONFIG[density];
  const subtasks = task.subtasks ?? [];
  const subProgress = subtasks.length > 0
    ? { done: subtasks.filter((s) => s.done).length, total: subtasks.length }
    : null;

  const handleToggle = () => {
    if (!task.done) {
      setCompletionFlash(true);
      setTimeout(() => setCompletionFlash(false), 700);
    }
    onToggle(task.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`group relative flex items-center ${dc.gap} rounded-xl bg-base/60 px-3 ${dc.py} transition-all ${agingBorder[aging]} ${
        selected ? "ring-1 ring-accent/40 bg-accent/5" : ""
      }`}
    >
      {/* Confetti burst */}
      <MiniConfetti active={completionFlash} />

      {/* Multi-select checkbox */}
      <div
        className="shrink-0 cursor-pointer"
        onClick={() => onSelect(task.id)}
      >
        <div className={`h-4 w-4 rounded border transition-all ${
          selected
            ? "bg-accent border-accent flex items-center justify-center"
            : "border-border-muted/40 opacity-0 group-hover:opacity-100"
        }`}>
          {selected && <Check className="h-2.5 w-2.5 text-white" />}
        </div>
      </div>

      {/* Complete toggle */}
      <button onClick={handleToggle} className="shrink-0 transition-transform active:scale-90">
        {task.done
          ? <CheckCircle2 className={`text-accent ${density === "ultra" ? "h-4 w-4" : "h-5 w-5"}`} />
          : <Circle className={`text-text-muted/40 ${density === "ultra" ? "h-4 w-4" : "h-5 w-5"}`} />}
      </button>

      {/* Task info */}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <button
          onClick={() => onPeek(task)}
          className={`text-left ${dc.text} ${task.done ? "text-text-muted line-through" : "text-text-primary"} hover:text-accent transition-colors`}
        >
          {task.title}
        </button>
        {density !== "ultra" && (
          <div className="flex items-center gap-2 flex-wrap">
            {due && (
              <span className={`text-[10px] font-medium ${due.overdue ? "text-coral" : "text-text-muted"}`}>{due.text}</span>
            )}
            {task.estimatedMinutes && !task.done && (
              <span className="text-[10px] text-text-muted">{task.estimatedMinutes}m</span>
            )}
            {EnergyIcon && !task.done && (
              <EnergyIcon className="h-3 w-3 shrink-0" style={{ color: energy!.color }} />
            )}
            {(task.tags ?? []).map((tag) => (
              <span key={tag} className="text-[9px] font-medium text-accent/70">#{tag}</span>
            ))}
            {aging === "aging" && !task.done && <span className="text-[10px] text-amber font-medium">Aging</span>}
            {aging === "neglected" && !task.done && <span className="text-[10px] text-red-400 font-medium">Neglected</span>}
            {subProgress && !task.done && (
              <span className="text-[10px] text-text-muted">{subProgress.done}/{subProgress.total} subtasks</span>
            )}
          </div>
        )}
      </div>

      {!task.done && (
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: config.bg, color: config.text }}
        >
          {config.label}
        </span>
      )}

      <button onClick={() => onDelete(task.id)} className="shrink-0 text-text-muted opacity-0 hover:text-red-400 group-hover:opacity-100">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Bulk Action Bar ───────────────────────────────────────────────────────
function BulkActionBar({
  count,
  onComplete,
  onDelete,
  onClear,
}: {
  count: number;
  onComplete: () => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="flex items-center gap-2 rounded-2xl border border-accent/20 bg-accent/8 px-4 py-2.5"
    >
      <span className="text-xs font-semibold text-accent">{count} selected</span>
      <div className="flex-1" />
      <button
        onClick={onComplete}
        className="flex items-center gap-1.5 rounded-xl bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20"
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> Complete
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 rounded-xl bg-red-400/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-400/20"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
      <button onClick={onClear} className="text-text-muted hover:text-text-primary">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// ─── Parsing Chips ─────────────────────────────────────────────────────────
function ParsedChips({ parsed }: { parsed: ParsedTask }) {
  const chips = [];
  if (parsed.dueDate) chips.push({ icon: "📅", label: formatDue(parsed.dueDate)?.text ?? parsed.dueDate, color: "text-blue-400" });
  if (parsed.priority !== "medium") chips.push({ icon: parsed.priority === "high" ? "🔴" : "🟢", label: parsed.priority, color: parsed.priority === "high" ? "text-red-400" : "text-green-400" });
  if (parsed.tags.length > 0) parsed.tags.forEach((t) => chips.push({ icon: "🏷️", label: `#${t}`, color: "text-accent" }));
  if (parsed.projectName) chips.push({ icon: "📁", label: `@${parsed.projectName}`, color: "text-purple-400" });
  if (chips.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex flex-wrap gap-1.5 overflow-hidden"
    >
      {chips.map((c, i) => (
        <span key={i} className={`flex items-center gap-1 rounded-full bg-base px-2.5 py-1 text-[10px] font-medium ${c.color}`}>
          <span>{c.icon}</span> {c.label}
        </span>
      ))}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

type EnergyFilter = "all" | EnergyLevel;
const ENERGY_FILTERS: { key: EnergyFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "low", label: "Easy" },
  { key: "medium", label: "Normal" },
  { key: "deep", label: "Deep" },
];
const DENSITY_LABELS: { key: TaskDensity; label: string }[] = [
  { key: "comfortable", label: "Comfortable" },
  { key: "compact", label: "Compact" },
  { key: "ultra", label: "Ultra-compact" },
];

export default function TasksWidget() {
  const { tasks, addTask, toggleTask, deleteTask, taskDensity, setTaskDensity } = useContentStore();
  const suggestions = useWhatNext(1);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [energy, setEnergy] = useState<Task["energyLevel"]>("medium");
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [showMeta, setShowMeta] = useState(false);
  const [showWhatNext, setShowWhatNext] = useState(false);
  const [energyFilter, setEnergyFilter] = useState<EnergyFilter>("all");
  const [peekTaskId, setPeekTaskId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDensity, setShowDensity] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseNL(input), [input]);
  const hasNLParsed = useMemo(() => !!(parsed.dueDate || parsed.priority !== "medium" || parsed.tags.length > 0 || parsed.projectName) && !!parsed.title, [parsed]);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (hasNLParsed && parsed.title) {
      addTask(parsed.title, parsed.priority, parsed.dueDate, {
        energyLevel: energy,
        estimatedMinutes: duration,
        tags: parsed.tags,
      });
    } else {
      addTask(trimmed, priority, dueDate || undefined, {
        energyLevel: energy,
        estimatedMinutes: duration,
      });
    }
    setInput("");
    setDueDate("");
    setShowMeta(false);
  };

  const sorted = useMemo(() => {
    const filtered = energyFilter === "all" ? tasks : tasks.filter((t) => t.energyLevel === energyFilter);
    return [...filtered].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const p: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    });
  }, [tasks, energyFilter]);

  const pending = sorted.filter((t) => !t.done);
  const done = sorted.filter((t) => t.done);
  const suggestion = suggestions[0];
  const peekTask = useMemo(
    () => tasks.find((t) => t.id === peekTaskId) ?? null,
    [tasks, peekTaskId]
  );

  // Bulk actions
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());
  const bulkComplete = () => {
    selectedIds.forEach((id) => { const t = tasks.find((tk) => tk.id === id); if (t && !t.done) toggleTask(id); });
    clearSelection();
  };
  const bulkDelete = () => {
    selectedIds.forEach((id) => deleteTask(id));
    clearSelection();
  };

  const density = taskDensity;

  return (
    <div className="flex h-full gap-0">
      {/* Main panel */}
      <div className={`flex flex-col gap-3 ${peekTask ? "w-1/2" : "w-full"} transition-all duration-200`}>
        {/* What Next */}
        {pending.length > 0 && (
          <button
            onClick={() => setShowWhatNext((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-accent/8 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/12"
          >
            <Zap className="h-3.5 w-3.5" />
            What should I do next?
          </button>
        )}
        <AnimatePresence>
          {showWhatNext && suggestion && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 space-y-1">
                <p className="text-xs font-semibold text-accent uppercase tracking-wide">Suggested next</p>
                <p className="text-sm font-medium text-text-primary">{suggestion.task.title}</p>
                <p className="text-[11px] text-text-muted capitalize">{suggestion.reason}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar: filters + density */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {ENERGY_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setEnergyFilter(key)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                energyFilter === key ? "bg-accent text-white" : "bg-base text-text-muted hover:bg-accent/10 hover:text-accent"
              }`}
            >
              {label}
            </button>
          ))}
          <div className="ml-auto relative">
            <button
              onClick={() => setShowDensity((v) => !v)}
              className="flex items-center gap-1 rounded-full bg-base px-2.5 py-1 text-[10px] font-medium text-text-muted hover:text-accent transition-colors"
            >
              <SlidersHorizontal className="h-3 w-3" />
              {density === "comfortable" ? "Comfort" : density === "compact" ? "Compact" : "Ultra"}
            </button>
            <AnimatePresence>
              {showDensity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-full mt-1 z-10 rounded-2xl border border-border-muted/60 bg-widget shadow-lg overflow-hidden"
                >
                  {DENSITY_LABELS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => { setTaskDensity(key); setShowDensity(false); }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-xs transition-colors ${
                        density === key ? "bg-accent/10 text-accent" : "text-text-primary hover:bg-base"
                      }`}
                    >
                      {density === key && <Check className="h-3 w-3" />}
                      {density !== key && <div className="h-3 w-3" />}
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Add input */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder='What needs to be done? (try "!high #work tomorrow")'
              onFocus={() => setShowMeta(true)}
              className="flex-1 rounded-xl border border-border-muted/60 bg-surface px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
            />
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent/10 px-3.5 py-2.5 text-sm font-medium text-accent hover:bg-accent/15"
            >
              <Plus className="h-4 w-4" /> Add
            </motion.button>
          </div>

          {/* NLP chips */}
          <AnimatePresence>
            {hasNLParsed && input && <ParsedChips parsed={parsed} />}
          </AnimatePresence>

          {/* Manual meta */}
          <AnimatePresence>
            {showMeta && !hasNLParsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 overflow-hidden"
              >
                <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}
                  className="rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-xs text-text-muted outline-none">
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>
                <div className="flex items-center gap-1.5 rounded-xl border border-border-muted/60 bg-surface px-3 py-2">
                  <CalendarDays className="h-3.5 w-3.5 text-text-muted" />
                  <input type="date" value={dueDate} min={todayStr()} onChange={(e) => setDueDate(e.target.value)}
                    className="bg-transparent text-xs text-text-muted outline-none" />
                </div>
                <select value={energy} onChange={(e) => setEnergy(e.target.value as Task["energyLevel"])}
                  className="rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-xs text-text-muted outline-none">
                  <option value="low">Easy</option>
                  <option value="medium">Normal</option>
                  <option value="deep">Deep Work</option>
                </select>
                <select value={duration ?? ""} onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : undefined)}
                  className="rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-xs text-text-muted outline-none">
                  <option value="">Duration</option>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">1 hour</option>
                  <option value="90">90 min</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk actions */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <BulkActionBar
              count={selectedIds.size}
              onComplete={bulkComplete}
              onDelete={bulkDelete}
              onClear={clearSelection}
            />
          )}
        </AnimatePresence>

        {/* Task list */}
        <div className="flex-1 space-y-1.5 overflow-auto">
          {tasks.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-8">
              <CheckSquare className="h-10 w-10 text-text-muted/20" />
              <div className="text-center">
                <p className="text-sm font-medium text-text-muted">Ready to get things done?</p>
                <p className="mt-1 text-xs text-text-muted/60">Add your first task above and start tracking progress.</p>
              </div>
            </div>
          )}
          {tasks.length > 0 && pending.length === 0 && done.length > 0 && (
            <AllCaughtUp onAdd={() => inputRef.current?.focus()} />
          )}
          <AnimatePresence initial={false}>
            {pending.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onPeek={(t) => setPeekTaskId(t.id)}
                density={density}
                selected={selectedIds.has(task.id)}
                onSelect={toggleSelect}
              />
            ))}
          </AnimatePresence>
          {done.length > 0 && (
            <div className="pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Completed · {done.length}
            </div>
          )}
          <AnimatePresence initial={false}>
            {done.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onPeek={(t) => setPeekTaskId(t.id)}
                density={density}
                selected={selectedIds.has(task.id)}
                onSelect={toggleSelect}
              />
            ))}
          </AnimatePresence>
        </div>

        {pending.length > 0 && (
          <div className="text-xs text-text-muted">{pending.length} remaining · {done.length} done</div>
        )}
      </div>

      {/* Peek Panel */}
      <AnimatePresence>
        {peekTask && (
          <div className="w-1/2 min-w-0 overflow-hidden">
            <TaskPeekPanel task={peekTask} onClose={() => setPeekTaskId(null)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
