"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckSquare, FileText } from "lucide-react";
import { useContentStore } from "@/store/contentStore";

export default function QuickCapture() {
  const { addTask, addNote, setActiveNote } = useContentStore();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"task" | "note">("task");

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    if (mode === "task") {
      addTask(text, "medium");
    } else {
      addNote({ title: text });
    }
    setInput("");
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Mode toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => setMode("task")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "task"
              ? "bg-accent text-white"
              : "bg-base text-text-muted hover:text-text-primary"
          }`}
        >
          <CheckSquare className="h-3 w-3" />
          Task
        </button>
        <button
          onClick={() => setMode("note")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "note"
              ? "bg-accent text-white"
              : "bg-base text-text-muted hover:text-text-primary"
          }`}
        >
          <FileText className="h-3 w-3" />
          Note
        </button>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={mode === "task" ? "Add a task for today..." : "Capture a thought..."}
          className="flex-1 rounded-2xl border border-border-muted/60 bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white shadow-sm transition-opacity disabled:opacity-40"
        >
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}
