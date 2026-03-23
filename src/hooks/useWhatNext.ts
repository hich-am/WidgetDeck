"use client";

import { useMemo } from "react";
import { useContentStore, todayStr } from "@/store/contentStore";
import type { Task } from "@/types/widget";

interface Suggestion {
  task: Task;
  reason: string;
  score: number;
}

function scoreTask(task: Task): { score: number; reason: string } {
  if (task.done) return { score: -Infinity, reason: "" };
  let score = 0;
  const reasons: string[] = [];

  // Priority weight
  if (task.priority === "high") { score += 30; reasons.push("high priority"); }
  else if (task.priority === "medium") { score += 20; reasons.push("medium priority"); }
  else { score += 10; }

  // Deadline proximity
  if (task.dueDate) {
    const today = todayStr();
    if (task.dueDate < today) { score += 40; reasons.push("overdue"); }
    else if (task.dueDate === today) { score += 30; reasons.push("due today"); }
    else {
      const daysUntil = Math.round(
        (new Date(task.dueDate + "T00:00:00").getTime() - Date.now()) / 86400000
      );
      if (daysUntil <= 2) { score += 15; reasons.push("due soon"); }
    }
  }

  // Energy level — favour manageable tasks
  const hour = new Date().getHours();
  if (task.energyLevel === "deep" && hour >= 8 && hour <= 12) {
    score += 10; reasons.push("great time for deep work");
  } else if (task.energyLevel === "low" && hour >= 15) {
    score += 8; reasons.push("easy win for this time of day");
  }

  // Short tasks — "2-minute rule" equivalent
  if (task.estimatedMinutes && task.estimatedMinutes <= 15) {
    score += 12; reasons.push("quick win");
  }

  const reason = reasons.length
    ? reasons.slice(0, 2).join(", ")
    : "next on your list";

  return { score, reason };
}

export function useWhatNext(limit = 3): Suggestion[] {
  const { tasks } = useContentStore();

  return useMemo(() => {
    const pending = tasks.filter((t) => !t.done);
    return pending
      .map((task) => {
        const { score, reason } = scoreTask(task);
        return { task, score, reason };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }, [tasks, limit]);
}
