import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout";

export type WidgetId =
  | "tasks"
  | "notes"
  | "calendar"
  | "lists"
  | "pomodoro"
  | "habits"
  | "bookmarks";

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

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;     // YYYY-MM-DD
  createdAt: string;    // ISO string
  completedAt?: string; // ISO string
  linkedNoteId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags: string[];       // e.g. ["work", "ideas"]
  isJournal?: boolean;  // auto-created daily journal
  linkedTaskIds?: string[];
}

export interface CalEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  color: string;
  taskId?: string; // linked task
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
  completedDates: string[]; // YYYY-MM-DD
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

export interface FocusSession {
  date: string;       // YYYY-MM-DD
  taskId?: string;
  taskTitle?: string;
  minutes: number;
}
