"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Circle, CheckCircle2 } from "lucide-react";
import { useContentStore } from "@/store/contentStore";
import type { Task } from "@/types/widget";

const priorityColors: Record<Task["priority"], string> = {
  low: "#9AA4B2",
  medium: "#F59E0B",
  high: "#EF4444",
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
    <div className="flex h-full flex-col gap-3">
      {/* Add input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a task..."
          className="flex-1 rounded-xl border border-border-muted bg-surface px-3 py-2 text-xs text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent/50"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task["priority"])}
          className="rounded-xl border border-border-muted bg-surface px-2 py-2 text-[10px] text-text-muted outline-none"
        >
          {priorityLabels.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors hover:bg-accent/20"
        >
          <Plus className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Task list */}
      <div className="flex-1 space-y-1.5 overflow-auto">
        {tasks.length === 0 && (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">
            No tasks yet. Add one above!
          </div>
        )}
        <AnimatePresence initial={false}>
          {pending.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
          ))}
          {done.length > 0 && pending.length > 0 && (
            <div className="py-1 text-[10px] uppercase tracking-widest text-text-muted">
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
        <div className="text-[10px] text-text-muted">
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
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-center gap-2 rounded-xl bg-surface px-3 py-2"
    >
      <button onClick={() => onToggle(task.id)} className="shrink-0">
        {task.done ? (
          <CheckCircle2 className="h-4 w-4 text-accent" />
        ) : (
          <Circle className="h-4 w-4 text-text-muted" />
        )}
      </button>
      <span
        className={`flex-1 text-xs ${
          task.done ? "text-text-muted line-through" : "text-text-primary"
        }`}
      >
        {task.title}
      </span>
      <div
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: priorityColors[task.priority] }}
        title={task.priority}
      />
      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 text-text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </motion.div>
  );
}
