"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github, Star } from "lucide-react";

const projects = [
  {
    name: "CloudSync",
    description: "Real-time cloud collaboration platform",
    tags: ["React", "Node.js", "WebSocket"],
    stars: 234,
    color: "#6C63FF",
  },
  {
    name: "DevMetrics",
    description: "Developer analytics dashboard",
    tags: ["Next.js", "D3.js", "PostgreSQL"],
    stars: 189,
    color: "#22D3EE",
  },
  {
    name: "PixelForge",
    description: "AI-powered image editor",
    tags: ["Python", "TensorFlow", "React"],
    stars: 412,
    color: "#F59E0B",
  },
  {
    name: "TaskFlow",
    description: "Minimalist project management tool",
    tags: ["TypeScript", "Prisma", "tRPC"],
    stars: 156,
    color: "#10B981",
  },
];

export default function ProjectsWidget() {
  return (
    <div className="flex h-full flex-col gap-3">
      {projects.map((project, i) => (
        <motion.div
          key={project.name}
          className="group cursor-pointer rounded-xl border border-border-muted bg-surface p-3 transition-colors hover:border-accent/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ x: 4 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <h4 className="text-sm font-medium text-text-primary">
                {project.name}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <Star className="h-3 w-3" />
                {project.stars}
              </div>
              <ExternalLink className="h-3 w-3 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>

          <p className="mt-1 text-xs text-text-muted">{project.description}</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-base px-1.5 py-0.5 text-[10px] font-medium text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      ))}

      <motion.a
        href="#"
        className="mt-auto flex items-center justify-center gap-1 rounded-xl border border-dashed border-border-muted py-2 text-xs text-text-muted transition-colors hover:border-accent/30 hover:text-accent"
        whileHover={{ scale: 1.02 }}
      >
        <Github className="h-3.5 w-3.5" />
        View all on GitHub
      </motion.a>
    </div>
  );
}
