import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout";

export type WidgetId =
  | "about"
  | "projects"
  | "skills"
  | "design"
  | "achievements"
  | "timeline"
  | "contact";

export interface WidgetConfig {
  id: WidgetId;
  title: string;
  icon: string; // Lucide icon name
  defaultLayout: {
    lg: LayoutItem;
    md: LayoutItem;
    sm: LayoutItem;
  };
  minW?: number;
  minH?: number;
}

export interface DashboardState {
  layouts: ResponsiveLayouts;
  enabledWidgets: WidgetId[];
  expandedWidget: WidgetId | null;
  commandPaletteOpen: boolean;
}

export interface DashboardActions {
  setLayouts: (layouts: ResponsiveLayouts) => void;
  toggleWidget: (id: WidgetId) => void;
  expandWidget: (id: WidgetId) => void;
  collapseWidget: () => void;
  resetLayout: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}
