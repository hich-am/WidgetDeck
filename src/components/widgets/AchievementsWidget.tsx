"use client";

import { motion } from "framer-motion";
import { Trophy, Award, Medal, Zap } from "lucide-react";

const achievements = [
  {
    icon: Trophy,
    title: "Hackathon Winner",
    description: "1st place at DevHacks 2024",
    date: "Mar 2024",
    color: "#F59E0B",
  },
  {
    icon: Award,
    title: "Open Source Award",
    description: "Best Developer Tool — OSS Awards",
    date: "Jan 2024",
    color: "#6C63FF",
  },
  {
    icon: Medal,
    title: "Top Contributor",
    description: "React ecosystem — GitHub",
    date: "2023",
    color: "#22D3EE",
  },
  {
    icon: Zap,
    title: "Speaker",
    description: "React Conf 2023 — Performance talk",
    date: "Oct 2023",
    color: "#10B981",
  },
  {
    icon: Award,
    title: "Design Excellence",
    description: "Awwwards — Site of the Day",
    date: "Jul 2023",
    color: "#F472B6",
  },
];

export default function AchievementsWidget() {
  return (
    <div className="flex h-full flex-col gap-2">
      {achievements.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.title}
            className="flex items-start gap-3 rounded-xl bg-surface p-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${item.color}15` }}
            >
              <Icon className="h-4 w-4" style={{ color: item.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-text-primary">
                  {item.title}
                </h4>
                <span className="text-[10px] text-text-muted">{item.date}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-text-muted">
                {item.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
