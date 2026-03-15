"use client";

import { motion } from "framer-motion";

const skills = [
  { name: "TypeScript", level: 95, color: "#6C63FF" },
  { name: "React / Next.js", level: 92, color: "#22D3EE" },
  { name: "Node.js", level: 88, color: "#10B981" },
  { name: "Python", level: 78, color: "#F59E0B" },
  { name: "PostgreSQL", level: 82, color: "#6366F1" },
  { name: "Docker / K8s", level: 70, color: "#F472B6" },
  { name: "Figma / Design", level: 85, color: "#A78BFA" },
  { name: "CI/CD", level: 75, color: "#FB923C" },
];

export default function SkillsWidget() {
  return (
    <div className="flex h-full flex-col gap-3">
      {skills.map((skill, i) => (
        <div key={skill.name} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-primary">
              {skill.name}
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              {skill.level}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: skill.color }}
              initial={{ width: 0 }}
              animate={{ width: `${skill.level}%` }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
