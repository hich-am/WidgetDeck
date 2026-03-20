"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Circle, CheckCircle2 } from "lucide-react";
import { useContentStore } from "@/store/contentStore";
import type { Task } from "@/types/widget";

const priorityConfig: Record<Task["priority"], { label: string; bg: string; text: string }> = {
  low: { label: "Low", bg: "rgba(142,142,160,0.1)", text: "#8E8EA0" },
  medium: { label: "Med", bg: "rgba(232,149,106,0.12)", text: "#D4804A" },
  high: { label: "High", bg: "rgba(232,126,126,0.12)", text: "#D45B5B" },
};

const priorityLabels: Task["priority"][] = ["low", "medium", "high"];

export default function TasksWidget() {
  const { tasks, addTask, toggleTask, deleteTask } = useContentStore();
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    addTask(trimmed, priority);
    setInput("");
  };

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Add input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="What needs to be done?"
          className="flex-1 rounded-xl border border-border-muted/60 bg-surface px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task["priority"])}
          className="rounded-xl border border-border-muted/60 bg-surface px-3 py-2.5 text-xs text-text-muted outline-none"
        >
          {priorityLabels.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent/10 px-3.5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/15"
        >
          <Plus className="h-4 w-4" />
          Add
        </motion.button>
      </div>

      {/* Task list */}
      <div className="flex-1 space-y-2 overflow-auto">
        {tasks.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            No tasks yet — add one above!
          </div>
        )}
        <AnimatePresence initial={false}>
          {pending.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
          ))}
          {done.length > 0 && pending.length > 0 && (
            <div className="pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-text-muted">
              Completed
            </div>
          )}
          {done.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
          ))}
        </AnimatePresence>
      </div>

      {/* Counter */}
      {tasks.length > 0 && (
        <div className="text-xs text-text-muted">
          {pending.length} pending · {done.length} done
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = priorityConfig[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-center gap-3 rounded-xl bg-base/60 px-4 py-3"
    >
      <button onClick={() => onToggle(task.id)} className="shrink-0">
        {task.done ? (
          <CheckCircle2 className="h-5 w-5 text-accent" />
        ) : (
          <Circle className="h-5 w-5 text-text-muted/50" />
        )}
      </button>
      <span
        className={`flex-1 text-sm ${
          task.done ? "text-text-muted line-through" : "text-text-primary"
        }`}
      >
        {task.title}
      </span>
      {!task.done && (
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: config.bg, color: config.text }}
        >
          {config.label}
        </span>
      )}
      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 text-text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
