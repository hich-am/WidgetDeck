"use client";

import { motion } from "framer-motion";

const events = [
  {
    year: "2024",
    title: "Lead Engineer",
    company: "Acme Corp",
    description: "Leading a team of 8 building the next-gen platform.",
    active: true,
  },
  {
    year: "2022",
    title: "Senior Developer",
    company: "Acme Corp",
    description: "Architected the new micro-frontend system.",
    active: false,
  },
  {
    year: "2021",
    title: "Full-Stack Developer",
    company: "StartupXYZ",
    description: "Built the MVP that scaled to 100K users.",
    active: false,
  },
  {
    year: "2020",
    title: "Frontend Developer",
    company: "DigitalAgency",
    description: "Delivered 20+ client projects using React.",
    active: false,
  },
  {
    year: "2019",
    title: "Junior Developer",
    company: "TechStartup",
    description: "First professional role. Learned React & Node.js.",
    active: false,
  },
];

export default function TimelineWidget() {
  return (
    <div className="relative flex h-full flex-col gap-0 pl-4">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-0 h-full w-px bg-border-muted" />

      {events.map((event, i) => (
        <motion.div
          key={event.year + event.title}
          className="relative flex gap-4 pb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12 }}
        >
          {/* Dot */}
          <div
            className={`absolute -left-4 top-1 h-3 w-3 rounded-full border-2 ${
              event.active
                ? "border-accent bg-accent shadow-[0_0_8px_rgba(108,99,255,0.4)]"
                : "border-border-muted bg-surface"
            }`}
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-accent">
                {event.year}
              </span>
              <span className="text-[10px] text-text-muted">
                {event.company}
              </span>
            </div>
            <h4 className="mt-0.5 text-xs font-medium text-text-primary">
              {event.title}
            </h4>
            <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted">
              {event.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
