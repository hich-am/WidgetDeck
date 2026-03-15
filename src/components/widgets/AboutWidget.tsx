"use client";

import { motion } from "framer-motion";
import { User, MapPin, Briefcase, Github, Linkedin, Twitter } from "lucide-react";

export default function AboutWidget() {
  return (
    <div className="flex h-full flex-col gap-4">
      {/* Profile Section */}
      <div className="flex items-start gap-4">
        <motion.div
          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent/10 ring-2 ring-accent/20"
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <User className="h-8 w-8 text-accent" />
          {/* Status indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-widget bg-emerald-500" />
        </motion.div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-text-primary">
            Alex Rivera
          </h3>
          <p className="text-sm text-accent">Full-Stack Developer & Designer</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-text-muted">
            <MapPin className="h-3 w-3" />
            San Francisco, CA
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm leading-relaxed text-text-muted">
        Passionate about crafting beautiful, performant web experiences. 
        5+ years building products with React, TypeScript, and Node.js. 
        Design systems enthusiast and open-source contributor.
      </p>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Years Exp", value: "5+" },
          { label: "Projects", value: "40+" },
          { label: "Clients", value: "25+" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-surface px-3 py-2 text-center"
          >
            <div className="text-sm font-semibold text-text-primary">
              {stat.value}
            </div>
            <div className="text-[10px] text-text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Current Role */}
      <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2">
        <Briefcase className="h-4 w-4 text-cyan" />
        <div>
          <div className="text-xs font-medium text-text-primary">
            Senior Engineer @ Acme Corp
          </div>
          <div className="text-[10px] text-text-muted">2022 — Present</div>
        </div>
      </div>

      {/* Social Links */}
      <div className="mt-auto flex gap-2">
        {[
          { Icon: Github, href: "#" },
          { Icon: Linkedin, href: "#" },
          { Icon: Twitter, href: "#" },
        ].map(({ Icon, href }, i) => (
          <motion.a
            key={i}
            href={href}
            whileHover={{ y: -2 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-text-muted transition-colors hover:text-accent"
          >
            <Icon className="h-4 w-4" />
          </motion.a>
        ))}
      </div>
    </div>
  );
}
