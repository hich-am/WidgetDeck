"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Flame } from "lucide-react";
import { useContentStore } from "@/store/contentStore";
import { BADGE_CATALOG } from "@/types/widget";

export default function GamificationBar() {
  const { xp, dailyStreak, badges, recentBadge, clearRecentBadge } = useContentStore();

  // Auto-dismiss badge toast after 4 seconds
  useEffect(() => {
    if (!recentBadge) return;
    const t = setTimeout(clearRecentBadge, 4000);
    return () => clearTimeout(t);
  }, [recentBadge, clearRecentBadge]);

  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const badge = recentBadge ? BADGE_CATALOG[recentBadge] : null;

  return (
    <>
      {/* Inline bar in toolbar */}
      <div className="flex items-center gap-3 rounded-2xl bg-base px-3 py-1.5">
        {dailyStreak > 0 && (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber">
            <Flame className="h-3.5 w-3.5" />
            {dailyStreak}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-text-muted">Lv {level}</span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border-muted/40">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${xpInLevel}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-[10px] text-text-muted">{xpInLevel}/100</span>
        </div>
        {badges.length > 0 && (
          <span
            className="flex items-center gap-1 text-xs text-text-muted"
            title={`${badges.length} badge${badges.length > 1 ? "s" : ""} earned`}
          >
            <Award className="h-3.5 w-3.5 text-accent" />
            <span>{BADGE_CATALOG[badges[badges.length - 1]]?.name ?? "Badge"}</span>
          </span>
        )}
      </div>

      {/* Badge earned toast */}
      <AnimatePresence>
        {badge && (
          <motion.div
            className="fixed bottom-6 right-6 z-[80] flex items-center gap-3 rounded-2xl border border-border-muted/50 bg-widget px-5 py-3.5 shadow-lg"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Award className="h-8 w-8 text-accent" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Badge unlocked!</p>
              <p className="text-xs text-text-muted">{badge.name} — {badge.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
