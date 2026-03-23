"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Circle, CheckCircle2, CalendarDays, Zap, Brain, Battery } from "lucide-react";
import { useContentStore } from "@/store/contentStore";
import { useWhatNext } from "@/hooks/useWhatNext";
import type { Task } from "@/types/widget";

const priorityConfig: Record<Task["priority"], { label: string; bg: string; text: string }> = {
  low:    { label: "Low",  bg: "rgba(142,142,160,0.1)",  text: "#8E8EA0" },
  medium: { label: "Med",  bg: "rgba(232,149,106,0.12)", text: "#D4804A" },
  high:   { label: "High", bg: "rgba(232,126,126,0.12)", text: "#D45B5B" },
};

const energyConfig: Record<NonNullable<Task["energyLevel"]>, { label: string; icon: React.ElementType; color: string }> = {
  low:    { label: "Easy",       icon: Battery, color: "#5CB99A" },
  medium: { label: "Normal",     icon: Zap,     color: "#E8956A" },
  deep:   { label: "Deep Work",  icon: Brain,   color: "#9B8FC4" },
};

const durationOptions = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "90 min", value: 90 },
];

function today() { return new Date().toISOString().split("T")[0]; }
function formatDue(dueDate?: string): { text: string; overdue: boolean } | null {
  if (!dueDate) return null;
  const t = today();
  if (dueDate === t) return { text: "Today", overdue: false };
  const d = new Date(dueDate + "T00:00:00");
  const diff = Math.round((d.getTime() - new Date().setHours(0,0,0,0)) / 86400000);
  if (diff === 1) return { text: "Tomorrow", overdue: false };
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, overdue: true };
  return { text: d.toLocaleDateString("en", { month: "short", day: "numeric" }), overdue: false };
}

export default function TasksWidget() {
  const { tasks, addTask, toggleTask, deleteTask } = useContentStore();
  const suggestions = useWhatNext(1);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [energy, setEnergy] = useState<Task["energyLevel"]>("medium");
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [showMeta, setShowMeta] = useState(false);
  const [showWhatNext, setShowWhatNext] = useState(false);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    addTask(trimmed, priority, dueDate || undefined, {
      energyLevel: energy,
      estimatedMinutes: duration,
    });
    setInput("");
    setDueDate("");
    setShowMeta(false);
  };

  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const p: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
  const pending = sorted.filter((t) => !t.done);
  const done = sorted.filter((t) => t.done);

  const suggestion = suggestions[0];

  return (
    <div className="flex h-full flex-col gap-3">
      {/* What Next? bar */}
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
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 space-y-1">
              <p className="text-xs font-semibold text-accent uppercase tracking-wide">Suggested next</p>
              <p className="text-sm font-medium text-text-primary">{suggestion.task.title}</p>
              <p className="text-[11px] text-text-muted capitalize">{suggestion.reason}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add input */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="What needs to be done?"
            onFocus={() => setShowMeta(true)}
            className="flex-1 rounded-xl border border-border-muted/60 bg-surface px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
          />
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent/10 px-3.5 py-2.5 text-sm font-medium text-accent hover:bg-accent/15"
          >
            <Plus className="h-4 w-4" /> Add
          </motion.button>
        </div>

        <AnimatePresence>
          {showMeta && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 overflow-hidden"
            >
              {/* Priority */}
              <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}
                className="rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-xs text-text-muted outline-none">
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              {/* Due date */}
              <div className="flex items-center gap-1.5 rounded-xl border border-border-muted/60 bg-surface px-3 py-2">
                <CalendarDays className="h-3.5 w-3.5 text-text-muted" />
                <input type="date" value={dueDate} min={today()} onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent text-xs text-text-muted outline-none" />
              </div>
              {/* Energy */}
              <select value={energy} onChange={(e) => setEnergy(e.target.value as Task["energyLevel"])}
                className="rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-xs text-text-muted outline-none">
                <option value="low">😌 Easy</option>
                <option value="medium">⚡ Normal</option>
                <option value="deep">🧠 Deep Work</option>
              </select>
              {/* Duration */}
              <select value={duration ?? ""} onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : undefined)}
                className="rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-xs text-text-muted outline-none">
                <option value="">Duration</option>
                {durationOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task list */}
      <div className="flex-1 space-y-1.5 overflow-auto">
        {tasks.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">No tasks yet — add one above!</div>
        )}
        <AnimatePresence initial={false}>
          {pending.map((task) => <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />)}
        </AnimatePresence>
        {done.length > 0 && (
          <div className="pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Completed · {done.length}
          </div>
        )}
        <AnimatePresence initial={false}>
          {done.map((task) => <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />)}
        </AnimatePresence>
      </div>

      {pending.length > 0 && (
        <div className="text-xs text-text-muted">{pending.length} remaining · {done.length} done</div>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }: { task: Task; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const config = priorityConfig[task.priority];
  const due = formatDue(task.dueDate);
  const energy = task.energyLevel ? energyConfig[task.energyLevel] : null;
  const EnergyIcon = energy?.icon;

  return (
    <motion.div layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      className="group flex items-center gap-3 rounded-xl bg-base/60 px-4 py-3"
    >
      <button onClick={() => onToggle(task.id)} className="shrink-0 transition-transform active:scale-90">
        {task.done ? <CheckCircle2 className="h-5 w-5 text-accent" /> : <Circle className="h-5 w-5 text-text-muted/40" />}
      </button>
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className={`text-sm ${task.done ? "text-text-muted line-through" : "text-text-primary"}`}>{task.title}</span>
        <div className="flex items-center gap-2">
          {due && (
            <span className={`text-[10px] font-medium ${due.overdue ? "text-coral" : "text-text-muted"}`}>{due.text}</span>
          )}
          {task.estimatedMinutes && !task.done && (
            <span className="text-[10px] text-text-muted">{task.estimatedMinutes}m</span>
          )}
          {EnergyIcon && !task.done && (
            <EnergyIcon className="h-3 w-3 shrink-0" style={{ color: energy!.color }} />
          )}
        </div>
      </div>
      {!task.done && (
        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: config.bg, color: config.text }}>{config.label}</span>
      )}
      <button onClick={() => onDelete(task.id)}
        className="shrink-0 text-text-muted opacity-0 hover:text-red-400 group-hover:opacity-100">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
