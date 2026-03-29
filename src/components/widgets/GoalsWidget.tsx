"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, FolderOpen, Plus, Trash2, ChevronDown, ChevronRight,
  CheckCircle2, Circle, Flag, TrendingUp,
} from "lucide-react";
import { useGoalStore, goalTaskProgress, goalMilestoneProgress } from "@/store/goalStore";
import { useContentStore } from "@/store/contentStore";

const GOAL_COLORS = [
  "#5B8DEF", "#5CB99A", "#E8956A", "#9B8FC4",
  "#E87E7E", "#6BC5D2", "#4ADE80", "#F59E0B",
];
let colorCursor = 0;

function ProgressRing({ value, color, size = 48 }: { value: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const center = size / 2;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={r} fill="none" stroke="var(--color-border-muted)" strokeWidth="4" opacity="0.3" />
        <motion.circle
          cx={center} cy={center} r={r}
          fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - value / 100) }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{value}%</span>
      </div>
    </div>
  );
}

export default function GoalsWidget() {
  const {
    goals, projects, milestones,
    addGoal, deleteGoal, archiveGoal,
    addProject, deleteProject,
    addMilestone, toggleMilestone, deleteMilestone,
  } = useGoalStore();
  const { tasks } = useContentStore();

  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [addingProjectFor, setAddingProjectFor] = useState<string | null>(null);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [addingMilestoneFor, setAddingMilestoneFor] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  const activeGoals = useMemo(() => goals.filter((g) => !g.archived), [goals]);

  const toggleGoal = (id: string) =>
    setExpandedGoals((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleProject = (id: string) =>
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleAddGoal = () => {
    const t = newGoalTitle.trim();
    if (!t) return;
    const color = GOAL_COLORS[colorCursor++ % GOAL_COLORS.length];
    addGoal(t, color);
    setNewGoalTitle("");
  };

  const handleAddProject = (goalId: string) => {
    const t = newProjectTitle.trim();
    if (!t) return;
    const id = addProject(goalId, t);
    setNewProjectTitle("");
    setAddingProjectFor(null);
    setExpandedGoals((prev) => new Set([...prev, goalId]));
    setExpandedProjects((prev) => new Set([...prev, id]));
  };

  const handleAddMilestone = (projectId: string) => {
    const t = newMilestoneTitle.trim();
    if (!t) return;
    addMilestone(projectId, t);
    setNewMilestoneTitle("");
    setAddingMilestoneFor(null);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {activeGoals.length} active goal{activeGoals.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Goals list */}
      <div className="flex-1 space-y-2 overflow-auto">
        {activeGoals.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            Add a goal to get started
          </div>
        )}
        {activeGoals.map((goal) => {
          const isExpanded = expandedGoals.has(goal.id);
          const goalProjects = projects.filter((p) => p.goalId === goal.id && p.status !== "completed");
          const taskPct = goalTaskProgress(goal.id, projects, tasks);
          const milestonePct = goalMilestoneProgress(goal.id, projects, milestones);
          const overallPct = Math.round((taskPct + milestonePct) / 2);

          return (
            <div key={goal.id} className="rounded-2xl border border-border-muted/40 bg-base/60 overflow-hidden">
              {/* Goal row */}
              <div className="flex items-center gap-2.5 p-3">
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className="shrink-0 text-text-muted hover:text-text-primary"
                >
                  {isExpanded
                    ? <ChevronDown className="h-4 w-4" />
                    : <ChevronRight className="h-4 w-4" />}
                </button>
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: goal.color }}
                />
                <span className="flex-1 text-sm font-medium text-text-primary truncate">
                  {goal.title}
                </span>
                <span className="text-xs font-semibold shrink-0" style={{ color: goal.color }}>
                  {overallPct}%
                </span>
                <button
                  onClick={() => archiveGoal(goal.id)}
                  className="shrink-0 text-text-muted/40 opacity-0 hover:text-amber group-hover:opacity-100 transition-opacity"
                  title="Archive"
                >
                  <Flag className="h-3 w-3" />
                </button>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="shrink-0 text-text-muted/40 hover:text-red-400 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              {/* Progress bar under goal */}
              <div className="px-3 pb-2">
                <ProgressBar value={overallPct} color={goal.color} />
              </div>

              {/* Expanded: projects */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border-muted/30 px-3 py-2 space-y-2">
                      {goalProjects.map((project) => {
                        const isProjExpanded = expandedProjects.has(project.id);
                        const projMilestones = milestones.filter((m) => m.projectId === project.id);
                        const projTasks = tasks.filter((t) => t.projectId === project.id);
                        const projPct = projTasks.length
                          ? Math.round((projTasks.filter((t) => t.done).length / projTasks.length) * 100)
                          : 0;

                        return (
                          <div key={project.id} className="rounded-xl bg-surface/60 overflow-hidden">
                            {/* Project row */}
                            <div className="flex items-center gap-2 px-3 py-2">
                              <button
                                onClick={() => toggleProject(project.id)}
                                className="shrink-0 text-text-muted hover:text-text-primary"
                              >
                                {isProjExpanded
                                  ? <ChevronDown className="h-3.5 w-3.5" />
                                  : <ChevronRight className="h-3.5 w-3.5" />}
                              </button>
                              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                              <span className="flex-1 text-xs font-medium text-text-primary truncate">
                                {project.title}
                              </span>
                              <span className="text-[10px] text-text-muted shrink-0">{projPct}%</span>
                              <button
                                onClick={() => { setAddingMilestoneFor(project.id); setAddingProjectFor(null); }}
                                className="shrink-0 text-text-muted hover:text-accent"
                                title="Add milestone"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteProject(project.id)}
                                className="shrink-0 text-text-muted/40 hover:text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="px-3 pb-2">
                              <ProgressBar value={projPct} color={goal.color} />
                            </div>

                            {/* Milestones */}
                            <AnimatePresence initial={false}>
                              {isProjExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="border-t border-border-muted/20 px-4 py-1.5 space-y-1">
                                    {projMilestones.length === 0 && (
                                      <p className="text-[10px] text-text-muted/60 py-1">No milestones yet</p>
                                    )}
                                    {projMilestones.map((m) => (
                                      <div key={m.id} className="flex items-center gap-2">
                                        <button
                                          onClick={() => toggleMilestone(m.id)}
                                          className="shrink-0 transition-transform active:scale-90"
                                        >
                                          {m.done
                                            ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                                            : <Circle className="h-3.5 w-3.5 text-text-muted/40" />}
                                        </button>
                                        <span className={`flex-1 text-[11px] ${m.done ? "line-through text-text-muted" : "text-text-primary"}`}>
                                          {m.title}
                                        </span>
                                        <button
                                          onClick={() => deleteMilestone(m.id)}
                                          className="shrink-0 text-text-muted/30 hover:text-red-400"
                                        >
                                          <Trash2 className="h-2.5 w-2.5" />
                                        </button>
                                      </div>
                                    ))}

                                    {/* Add milestone input */}
                                    {addingMilestoneFor === project.id ? (
                                      <div className="flex gap-1.5 pt-1">
                                        <input
                                          autoFocus
                                          value={newMilestoneTitle}
                                          onChange={(e) => setNewMilestoneTitle(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") handleAddMilestone(project.id);
                                            if (e.key === "Escape") { setAddingMilestoneFor(null); setNewMilestoneTitle(""); }
                                          }}
                                          placeholder="Milestone name…"
                                          className="flex-1 rounded-lg border border-border-muted/50 bg-base px-2 py-1 text-[11px] text-text-primary outline-none focus:border-accent/50"
                                        />
                                        <button
                                          onClick={() => handleAddMilestone(project.id)}
                                          className="rounded-lg bg-accent/10 px-2 text-[11px] text-accent"
                                        >Add</button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setAddingMilestoneFor(project.id)}
                                        className="flex items-center gap-1 py-0.5 text-[10px] text-text-muted hover:text-accent"
                                      >
                                        <Plus className="h-3 w-3" /> Add milestone
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}

                      {/* Add project input */}
                      {addingProjectFor === goal.id ? (
                        <div className="flex gap-2">
                          <input
                            autoFocus
                            value={newProjectTitle}
                            onChange={(e) => setNewProjectTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddProject(goal.id);
                              if (e.key === "Escape") { setAddingProjectFor(null); setNewProjectTitle(""); }
                            }}
                            placeholder="Project name…"
                            className="flex-1 rounded-xl border border-border-muted/50 bg-surface px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent/50"
                          />
                          <button
                            onClick={() => handleAddProject(goal.id)}
                            className="rounded-xl bg-accent/10 px-3 text-xs text-accent"
                          >Add</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingProjectFor(goal.id)}
                          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add project
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Add Goal */}
      <div className="flex gap-2">
        <input
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
          placeholder="New goal…"
          className="flex-1 rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
        />
        <button
          onClick={handleAddGoal}
          className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 text-sm font-medium text-accent hover:bg-accent/15"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </div>
  );
}
