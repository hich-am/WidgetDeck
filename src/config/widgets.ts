import type { ResponsiveLayouts } from "react-grid-layout";
import type { WidgetConfig, WidgetId } from "@/types/widget";

export const HOME_WIDGET_IDS: WidgetId[] = [
  "tasks",
  "pomodoro",
  "notes",
  "calendar",
  "habits",
];

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: "tasks",
    title: "Tasks",
    icon: "CheckSquare",
    minW: 3,
    minH: 3,
    defaultLayout: {
      lg: { i: "tasks", x: 0, y: 0, w: 7, h: 6 },
      md: { i: "tasks", x: 0, y: 0, w: 6, h: 6 },
      sm: { i: "tasks", x: 0, y: 0, w: 6, h: 6 },
    },
  },
  {
    id: "notes",
    title: "Notes",
    icon: "FileText",
    minW: 3,
    minH: 3,
    defaultLayout: {
      lg: { i: "notes", x: 0, y: 6, w: 4, h: 4 },
      md: { i: "notes", x: 0, y: 6, w: 5, h: 4 },
      sm: { i: "notes", x: 0, y: 11, w: 6, h: 4 },
    },
  },
  {
    id: "calendar",
    title: "Calendar",
    icon: "CalendarDays",
    minW: 3,
    minH: 4,
    defaultLayout: {
      lg: { i: "calendar", x: 4, y: 6, w: 4, h: 4 },
      md: { i: "calendar", x: 5, y: 6, w: 5, h: 4 },
      sm: { i: "calendar", x: 0, y: 15, w: 6, h: 4 },
    },
  },
  {
    id: "lists",
    title: "Lists",
    icon: "List",
    minW: 2,
    minH: 3,
    defaultLayout: {
      lg: { i: "lists", x: 0, y: 10, w: 4, h: 4 },
      md: { i: "lists", x: 6, y: 10, w: 4, h: 4 },
      sm: { i: "lists", x: 0, y: 23, w: 6, h: 4 },
    },
  },
  {
    id: "pomodoro",
    title: "Pomodoro",
    icon: "Timer",
    minW: 2,
    minH: 3,
    defaultLayout: {
      lg: { i: "pomodoro", x: 7, y: 0, w: 5, h: 6 },
      md: { i: "pomodoro", x: 6, y: 0, w: 4, h: 6 },
      sm: { i: "pomodoro", x: 0, y: 6, w: 6, h: 5 },
    },
  },
  {
    id: "habits",
    title: "Habits",
    icon: "Flame",
    minW: 3,
    minH: 3,
    defaultLayout: {
      lg: { i: "habits", x: 8, y: 6, w: 4, h: 4 },
      md: { i: "habits", x: 0, y: 10, w: 6, h: 4 },
      sm: { i: "habits", x: 0, y: 19, w: 6, h: 4 },
    },
  },
  {
    id: "bookmarks",
    title: "Bookmarks",
    icon: "Bookmark",
    minW: 2,
    minH: 2,
    defaultLayout: {
      lg: { i: "bookmarks", x: 4, y: 10, w: 4, h: 3 },
      md: { i: "bookmarks", x: 0, y: 14, w: 5, h: 3 },
      sm: { i: "bookmarks", x: 0, y: 27, w: 6, h: 3 },
    },
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: "BarChart2",
    minW: 3,
    minH: 3,
    defaultLayout: {
      lg: { i: "analytics", x: 8, y: 10, w: 4, h: 4 },
      md: { i: "analytics", x: 5, y: 13, w: 5, h: 4 },
      sm: { i: "analytics", x: 0, y: 30, w: 6, h: 4 },
    },
  },
  {
    id: "goals",
    title: "Goals",
    icon: "Target",
    minW: 3,
    minH: 4,
    defaultLayout: {
      lg: { i: "goals", x: 0, y: 14, w: 4, h: 5 },
      md: { i: "goals", x: 0, y: 17, w: 10, h: 5 },
      sm: { i: "goals", x: 0, y: 34, w: 6, h: 5 },
    },
  },
];

export const ALL_WIDGET_IDS: WidgetId[] = DEFAULT_WIDGETS.map((w) => w.id);

export const DEFAULT_ENABLED_WIDGETS: WidgetId[] = [
  "tasks",
  "pomodoro",
  "notes",
  "calendar",
  "habits",
];

export function getDefaultLayouts(): ResponsiveLayouts {
  return {
    lg: DEFAULT_WIDGETS.map((w) => ({
      ...w.defaultLayout.lg,
      minW: w.minW,
      minH: w.minH,
    })),
    md: DEFAULT_WIDGETS.map((w) => ({
      ...w.defaultLayout.md,
      minW: w.minW,
      minH: w.minH,
    })),
    sm: DEFAULT_WIDGETS.map((w) => ({
      ...w.defaultLayout.sm,
      minW: w.minW,
      minH: w.minH,
    })),
  };
}

export function getWidgetConfig(id: WidgetId): WidgetConfig | undefined {
  return DEFAULT_WIDGETS.find((w) => w.id === id);
}
