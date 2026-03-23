import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout";

export type WidgetId =
  | "tasks"
  | "notes"
  | "calendar"
  | "lists"
  | "pomodoro"
  | "habits"
  | "bookmarks"
  | "analytics";

export interface WidgetConfig {
  id: WidgetId;
  title: string;
  icon: string;
  defaultLayout: {
    lg: LayoutItem;
    md: LayoutItem;
    sm: LayoutItem;
  };
  minW?: number;
  minH?: number;
}

// ── Content Types ──

export type TaskPriority = "low" | "medium" | "high";
export type EnergyLevel = "low" | "medium" | "deep";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: TaskPriority;
  estimatedMinutes?: number;   // 15 | 30 | 60 | 90
  energyLevel?: EnergyLevel;   // low=easy, medium=normal, deep=focus required
  dueDate?: string;            // YYYY-MM-DD
  createdAt: string;           // ISO
  completedAt?: string;        // ISO
  linkedNoteId?: string;
  pomodoroCount?: number;      // sessions spent on this task
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags: string[];
  isJournal?: boolean;
  linkedTaskIds?: string[];
}

export interface CalEvent {
  id: string;
  title: string;
  date: string;
  color: string;
  taskId?: string;
}

export interface UserList {
  id: string;
  name: string;
  items: ListItem[];
}

export interface ListItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  completedDates: string[];
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

export interface FocusSession {
  date: string;
  taskId?: string;
  taskTitle?: string;
  minutes: number;
}

// ── Gamification ──

export type BadgeId =
  | "first_task"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "pomodoro_10"
  | "pomodoro_50"
  | "xp_100"
  | "xp_500"
  | "habit_master";

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
}

export const BADGE_CATALOG: Record<BadgeId, Badge> = {
  first_task:   { id: "first_task",   name: "First Step",      description: "Completed your first task",     icon: "🎯" },
  streak_3:     { id: "streak_3",     name: "On a Roll",       description: "3-day active streak",           icon: "🔥" },
  streak_7:     { id: "streak_7",     name: "Week Warrior",    description: "7-day active streak",           icon: "⚡" },
  streak_30:    { id: "streak_30",    name: "Unstoppable",     description: "30-day active streak",          icon: "🏆" },
  pomodoro_10:  { id: "pomodoro_10",  name: "Focus Starter",   description: "Completed 10 Pomodoro sessions",icon: "🍅" },
  pomodoro_50:  { id: "pomodoro_50",  name: "Deep Worker",     description: "Completed 50 Pomodoro sessions",icon: "🧠" },
  xp_100:       { id: "xp_100",       name: "Getting Started", description: "Reached 100 XP",               icon: "⭐" },
  xp_500:       { id: "xp_500",       name: "Power User",      description: "Reached 500 XP",               icon: "💎" },
  habit_master: { id: "habit_master", name: "Habit Master",    description: "7 days of full habit completion",icon: "🌱" },
};
