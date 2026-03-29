"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Goal, Project, Milestone } from "@/types/goals";

function uid(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

interface GoalStore {
  goals: Goal[];
  projects: Project[];
  milestones: Milestone[];

  // Goals
  addGoal: (title: string, color?: string, opts?: Partial<Goal>) => string;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  archiveGoal: (id: string) => void;

  // Projects
  addProject: (goalId: string, title: string, opts?: Partial<Project>) => string;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Milestones
  addMilestone: (projectId: string, title: string, dueDate?: string) => void;
  toggleMilestone: (id: string) => void;
  deleteMilestone: (id: string) => void;
}

const GOAL_COLORS = [
  "#5B8DEF", "#5CB99A", "#E8956A", "#9B8FC4",
  "#E87E7E", "#6BC5D2", "#D4804A", "#4ADE80",
];
let colorIdx = 0;

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      goals: [],
      projects: [],
      milestones: [],

      // ── Goals ──
      addGoal: (title, color, opts = {}) => {
        const id = uid();
        const goalColor = color ?? GOAL_COLORS[colorIdx++ % GOAL_COLORS.length];
        const goal: Goal = {
          id,
          title,
          color: goalColor,
          archived: false,
          createdAt: new Date().toISOString(),
          ...opts,
        };
        set((s) => ({ goals: [...s.goals, goal] }));
        return id;
      },

      updateGoal: (id, data) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...data } : g)) })),

      deleteGoal: (id) =>
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== id),
          projects: s.projects.filter((p) => p.goalId !== id),
          milestones: s.milestones.filter(
            (m) => !s.projects.find((p) => p.goalId === id && p.id === m.projectId)
          ),
        })),

      archiveGoal: (id) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, archived: true } : g)) })),

      // ── Projects ──
      addProject: (goalId, title, opts = {}) => {
        const id = uid();
        const project: Project = {
          id,
          goalId,
          title,
          status: "active",
          createdAt: new Date().toISOString(),
          ...opts,
        };
        set((s) => ({ projects: [...s.projects, project] }));
        return id;
      },

      updateProject: (id, data) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          milestones: s.milestones.filter((m) => m.projectId !== id),
        })),

      // ── Milestones ──
      addMilestone: (projectId, title, dueDate) =>
        set((s) => ({
          milestones: [
            ...s.milestones,
            { id: uid(), projectId, title, dueDate, done: false },
          ],
        })),

      toggleMilestone: (id) =>
        set((s) => ({
          milestones: s.milestones.map((m) =>
            m.id === id ? { ...m, done: !m.done } : m
          ),
        })),

      deleteMilestone: (id) =>
        set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) })),
    }),
    { name: "widgetdeck-goals" }
  )
);

// ── Derived selectors ──

/** Percentage of tasks in all projects under a goal that are done */
export function goalTaskProgress(
  goalId: string,
  projects: Project[],
  tasks: { done: boolean; projectId?: string }[]
): number {
  const projectIds = projects.filter((p) => p.goalId === goalId).map((p) => p.id);
  const linked = tasks.filter((t) => t.projectId && projectIds.includes(t.projectId));
  if (!linked.length) return 0;
  return Math.round((linked.filter((t) => t.done).length / linked.length) * 100);
}

/** Percentage of milestones in all projects under a goal that are done */
export function goalMilestoneProgress(
  goalId: string,
  projects: Project[],
  milestones: Milestone[]
): number {
  const projectIds = projects.filter((p) => p.goalId === goalId).map((p) => p.id);
  const linked = milestones.filter((m) => projectIds.includes(m.projectId));
  if (!linked.length) return 0;
  return Math.round((linked.filter((m) => m.done).length / linked.length) * 100);
}
