"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useContentStore } from "@/store/contentStore";

const messages = {
  start: [
    "What's one thing you want to get done today?",
    "Start small — even one task is a win.",
    "You've got this. Let's make today count.",
  ],
  progress: [
    "You're on a roll! Keep going 🔥",
    "Great momentum — what's next?",
    "Nice work! Halfway there.",
  ],
  almostDone: [
    "So close! Just a few more to go.",
    "Almost there — finish strong!",
    "You're crushing it today 💪",
  ],
  done: [
    "You did it! Everything's done for today 🎉",
    "All tasks complete — amazing work! ✨",
    "Today was a great day. Well done! 🌟",
  ],
  noTasks: [
    "Ready when you are. Add your first task!",
    "A fresh start. What would you like to accomplish?",
    "Your day is a blank canvas. Let's fill it.",
  ],
};

function pickMessage(arr: string[]): string {
  return arr[Math.floor(Date.now() / 60000) % arr.length];
}

interface MotivationalMessageProps {
  total: number;
  done: number;
}

export default function MotivationalMessage({ total, done }: MotivationalMessageProps) {
  const message = useMemo(() => {
    if (total === 0) return pickMessage(messages.noTasks);
    const ratio = done / total;
    if (ratio === 0) return pickMessage(messages.start);
    if (ratio === 1) return pickMessage(messages.done);
    if (ratio >= 0.7) return pickMessage(messages.almostDone);
    return pickMessage(messages.progress);
  }, [total, done]);

  return (
    <motion.p
      key={message}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-sm text-text-muted"
    >
      {message}
    </motion.p>
  );
}
