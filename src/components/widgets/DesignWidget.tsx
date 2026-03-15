"use client";

import { motion } from "framer-motion";
import { Eye } from "lucide-react";

const designs = [
  {
    title: "Dashboard Redesign",
    category: "UI/UX",
    gradient: "from-accent/30 to-cyan/20",
  },
  {
    title: "Mobile Banking App",
    category: "Product Design",
    gradient: "from-cyan/30 to-emerald-500/20",
  },
  {
    title: "E-commerce Platform",
    category: "Web Design",
    gradient: "from-amber/30 to-rose-500/20",
  },
  {
    title: "SaaS Landing Page",
    category: "Marketing",
    gradient: "from-purple-500/30 to-accent/20",
  },
  {
    title: "Design System",
    category: "Components",
    gradient: "from-emerald-500/30 to-cyan/20",
  },
  {
    title: "Brand Identity",
    category: "Branding",
    gradient: "from-rose-500/30 to-amber/20",
  },
];

export default function DesignWidget() {
  return (
    <div className="grid h-full grid-cols-2 gap-2 auto-rows-min">
      {designs.map((design, i) => (
        <motion.div
          key={design.title}
          className="group relative cursor-pointer overflow-hidden rounded-xl border border-border-muted"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ scale: 1.03 }}
        >
          {/* Gradient placeholder for design thumbnail */}
          <div
            className={`aspect-[4/3] bg-gradient-to-br ${design.gradient}`}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-base/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <Eye className="h-4 w-4 text-accent" />
            <span className="text-[10px] font-medium text-text-primary">
              {design.title}
            </span>
            <span className="text-[10px] text-text-muted">
              {design.category}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
