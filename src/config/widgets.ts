import type { Layout, ResponsiveLayouts } from "react-grid-layout";
import type { WidgetConfig, WidgetId } from "@/types/widget";

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: "about",
    title: "About Me",
    icon: "User",
    minW: 2,
    minH: 2,
    defaultLayout: {
      lg: { i: "about", x: 0, y: 0, w: 4, h: 4 },
      md: { i: "about", x: 0, y: 0, w: 5, h: 4 },
      sm: { i: "about", x: 0, y: 0, w: 6, h: 4 },
    },
  },
  {
    id: "projects",
    title: "Projects",
    icon: "FolderGit2",
    minW: 3,
    minH: 3,
    defaultLayout: {
      lg: { i: "projects", x: 4, y: 0, w: 5, h: 4 },
      md: { i: "projects", x: 5, y: 0, w: 5, h: 4 },
      sm: { i: "projects", x: 0, y: 4, w: 6, h: 4 },
    },
  },
  {
    id: "skills",
    title: "Skills",
    icon: "BarChart3",
    minW: 2,
    minH: 2,
    defaultLayout: {
      lg: { i: "skills", x: 9, y: 0, w: 3, h: 4 },
      md: { i: "skills", x: 0, y: 4, w: 5, h: 4 },
      sm: { i: "skills", x: 0, y: 8, w: 6, h: 4 },
    },
  },
  {
    id: "design",
    title: "Design Work",
    icon: "Palette",
    minW: 3,
    minH: 3,
    defaultLayout: {
      lg: { i: "design", x: 0, y: 4, w: 4, h: 4 },
      md: { i: "design", x: 5, y: 4, w: 5, h: 4 },
      sm: { i: "design", x: 0, y: 12, w: 6, h: 4 },
    },
  },
  {
    id: "achievements",
    title: "Achievements",
    icon: "Trophy",
    minW: 2,
    minH: 2,
    defaultLayout: {
      lg: { i: "achievements", x: 4, y: 4, w: 4, h: 4 },
      md: { i: "achievements", x: 0, y: 8, w: 5, h: 4 },
      sm: { i: "achievements", x: 0, y: 16, w: 6, h: 4 },
    },
  },
  {
    id: "timeline",
    title: "Timeline",
    icon: "Clock",
    minW: 2,
    minH: 3,
    defaultLayout: {
      lg: { i: "timeline", x: 8, y: 4, w: 4, h: 4 },
      md: { i: "timeline", x: 5, y: 8, w: 5, h: 4 },
      sm: { i: "timeline", x: 0, y: 20, w: 6, h: 4 },
    },
  },
  {
    id: "contact",
    title: "Contact",
    icon: "Mail",
    minW: 2,
    minH: 2,
    defaultLayout: {
      lg: { i: "contact", x: 0, y: 8, w: 4, h: 3 },
      md: { i: "contact", x: 0, y: 12, w: 10, h: 3 },
      sm: { i: "contact", x: 0, y: 24, w: 6, h: 3 },
    },
  },
];

export const ALL_WIDGET_IDS: WidgetId[] = DEFAULT_WIDGETS.map((w) => w.id);

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
