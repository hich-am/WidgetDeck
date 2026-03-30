import type { LayoutItem, ResponsiveLayouts } from "react-grid-layout";

export type WidgetId =
  | "tasks"
  | "notes"
  | "calendar"
  | "lists"
  | "pomodoro"
  | "habits"
  | "bookmarks"
  | "analytics"
  | "goals";

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
export type TaskDensity = "comfortable" | "compact" | "ultra";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: TaskPriority;
  estimatedMinutes?: number;   // 15 | 30 | 60 | 90
  actualMinutes?: number;      // accumulated from FocusSessions
  energyLevel?: EnergyLevel;   // low=easy, medium=normal, deep=focus required
  dueDate?: string;            // YYYY-MM-DD
  dueTime?: string;            // HH:MM
  createdAt: string;           // ISO
  completedAt?: string;        // ISO
  linkedNoteId?: string;
  pomodoroCount?: number;      // sessions spent on this task
  blockedBy?: string[];        // task IDs that must be done first
  projectId?: string;          // links task to a Project in goalStore
  description?: string;        // rich text description
  tags?: string[];             // custom tags
  subtasks?: Subtask[];        // inline sub-items
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
  stackTrigger?: string;
  stackOrder?: number;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  date: string;
  taskId?: string;
  taskTitle?: string;
  minutes: number;
  notes?: string;
  distractionCount?: number;
}

export interface DistractionEntry {
  id: string;
  sessionId: string;
  timestamp: string;
  note?: string;
}

// ── Mood & Energy ──

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodLevel;
  note?: string;
}

export interface EnergyCheckIn {
  id: string;
  timestamp: string;
  level: "low" | "medium" | "high";
}

// ── Focus Modes ──

export type FocusModeName = "deep" | "light" | "custom";

export interface FocusModeConfig {
  name: FocusModeName;
  label: string;
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export const FOCUS_MODE_PRESETS: Record<Exclude<FocusModeName, "custom">, FocusModeConfig> = {
  light: {
    name: "light",
    label: "Light",
    workMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
  },
  deep: {
    name: "deep",
    label: "Deep",
    workMinutes: 90,
    breakMinutes: 15,
    longBreakMinutes: 30,
    sessionsBeforeLongBreak: 2,
  },
};

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
  | "habit_master"
  | "goal_set"
  | "deep_focus"
  | "weekly_review"
  | "mood_week"
  | "stack_master";

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
}

export const BADGE_CATALOG: Record<BadgeId, Badge> = {
  first_task:    { id: "first_task",    name: "First Step",      description: "Completed your first task",            icon: "FT" },
  streak_3:      { id: "streak_3",      name: "On a Roll",       description: "3-day active streak",                  icon: "S3" },
  streak_7:      { id: "streak_7",      name: "Week Warrior",    description: "7-day active streak",                  icon: "S7" },
  streak_30:     { id: "streak_30",     name: "Unstoppable",     description: "30-day active streak",                 icon: "S30" },
  pomodoro_10:   { id: "pomodoro_10",   name: "Focus Starter",   description: "Completed 10 Pomodoro sessions",       icon: "P10" },
  pomodoro_50:   { id: "pomodoro_50",   name: "Deep Worker",     description: "Completed 50 Pomodoro sessions",       icon: "P50" },
  xp_100:        { id: "xp_100",        name: "Getting Started", description: "Reached 100 XP",                      icon: "X1" },
  xp_500:        { id: "xp_500",        name: "Power User",      description: "Reached 500 XP",                      icon: "X5" },
  habit_master:  { id: "habit_master",  name: "Habit Master",    description: "7 days of full habit completion",      icon: "HM" },
  goal_set:      { id: "goal_set",      name: "Visionary",       description: "Created your first goal",              icon: "GS" },
  deep_focus:    { id: "deep_focus",    name: "Flow State",      description: "Completed a 90-min deep work session", icon: "DF" },
  weekly_review: { id: "weekly_review", name: "Reflective",      description: "Completed a weekly review",            icon: "WR" },
  mood_week:     { id: "mood_week",     name: "In Tune",         description: "Logged mood for 7 days",               icon: "MW" },
  stack_master:  { id: "stack_master",  name: "Stacker",         description: "Completed a habit stack 5 days",       icon: "SM" },
};
