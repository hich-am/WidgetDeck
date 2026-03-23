"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Clock, ArrowRight, Sparkles } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useContentStore, todayStr } from "@/store/contentStore";

export default function DailyReview() {
  const { dailyReviewOpen, closeDailyReview } = useDashboardStore();
  const { tasks, updateTask, addTask } = useContentStore();
  const [reflection, setReflection] = useState("");
  const [top3, setTop3] = useState(["", "", ""]);
  const today = todayStr();

  const doneTasks = tasks.filter((t) => t.done && t.completedAt?.startsWith(today));
  const missedTasks = tasks.filter((t) => !t.done && (t.dueDate === today || (!t.dueDate && t.createdAt.startsWith(today))));

  const pushToTomorrow = (id: string) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    updateTask(id, { dueDate: d.toISOString().split("T")[0] });
  };

  const handleFinish = () => {
    top3.forEach((title) => {
      const t = title.trim();
      if (t) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        addTask(t, "high", d.toISOString().split("T")[0]);
      }
    });
    closeDailyReview();
  };

  return (
    <AnimatePresence>
      {dailyReviewOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-text-primary/15 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDailyReview}
          />
          <motion.div
            className="fixed inset-x-4 bottom-0 top-[5%] z-[70] mx-auto max-w-lg overflow-hidden rounded-3xl border border-border-muted/50 bg-widget"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.08)" }}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-border-muted/40 px-6">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-accent" />
                <h2 className="text-base font-bold text-text-primary">Daily Review</h2>
              </div>
              <button onClick={closeDailyReview}
                className="rounded-xl p-2 text-text-muted hover:bg-base hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex h-[calc(100%-4rem)] flex-col overflow-auto px-6 py-5 gap-6">
              {/* Done */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  Completed today · {doneTasks.length}
                </h3>
                {doneTasks.length === 0 ? (
                  <p className="text-sm text-text-muted">Nothing marked done yet.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {doneTasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-2.5 rounded-xl bg-accent/5 px-3 py-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                        <span className="text-sm text-text-primary">{t.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Missed */}
              {missedTasks.length > 0 && (
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <Clock className="h-4 w-4 text-amber" />
                    Unfinished · {missedTasks.length}
                  </h3>
                  <ul className="space-y-1.5">
                    {missedTasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-2.5 rounded-xl bg-base px-3 py-2">
                        <span className="flex-1 text-sm text-text-muted">{t.title}</span>
                        <button
                          onClick={() => pushToTomorrow(t.id)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-accent bg-accent/8 hover:bg-accent/15 transition-colors"
                        >
                          Tomorrow <ArrowRight className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Tomorrow's top 3 */}
              <section>
                <h3 className="mb-3 text-sm font-semibold text-text-primary">
                  Tomorrow's top 3 priorities
                </h3>
                <div className="space-y-2">
                  {top3.map((val, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent">
                        {i + 1}
                      </span>
                      <input
                        value={val}
                        onChange={(e) => setTop3((prev) => prev.map((v, idx) => idx === i ? e.target.value : v))}
                        placeholder={`Priority ${i + 1}...`}
                        className="flex-1 rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Reflection */}
              <section>
                <h3 className="mb-2 text-sm font-semibold text-text-primary">Quick reflection</h3>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="How did today feel? Any wins or lessons?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border-muted/60 bg-surface px-3 py-2.5 text-sm text-text-primary outline-none placeholder-text-muted focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
                  style={{ lineHeight: "1.7" }}
                />
              </section>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleFinish}
                className="w-full rounded-2xl bg-accent py-3.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Wrap up the day ✨
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
