"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ResponsiveLayouts } from "react-grid-layout";
import type { WidgetId } from "@/types/widget";
import { ALL_WIDGET_IDS, getDefaultLayouts, DEFAULT_ENABLED_WIDGETS } from "@/config/widgets";

export type FocusPhase = "ritual" | "focus" | "break" | "reflection";

export interface Notification {
  id: string;
  type: "overdue_task" | "upcoming_event" | "habit_reminder";
  title: string;
  body: string;
  timestamp: string;
  snoozedUntil?: string;
  read: boolean;
}

interface DashboardStore {
  layouts: ResponsiveLayouts;
  enabledWidgets: WidgetId[];
  expandedWidget: WidgetId | null;
  commandPaletteOpen: boolean;
  focusModeOpen: boolean;
  focusPhase: FocusPhase;
  dailyReviewOpen: boolean;
  achievementsOpen: boolean;
  notificationCenterOpen: boolean;

  // Sidebar
  favorites: WidgetId[];
  collapsedSections: string[];

  // Command palette
  recentCommands: string[];

  // Notifications
  notifications: Notification[];

  setLayouts: (layouts: ResponsiveLayouts) => void;
  toggleWidget: (id: WidgetId) => void;
  expandWidget: (id: WidgetId) => void;
  collapseWidget: () => void;
  resetLayout: () => void;

  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  pushRecentCommand: (id: string) => void;

  openFocusMode: () => void;
  closeFocusMode: () => void;
  setFocusPhase: (phase: FocusPhase) => void;

  openDailyReview: () => void;
  closeDailyReview: () => void;

  openAchievements: () => void;
  closeAchievements: () => void;

  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;

  // Favorites
  toggleFavorite: (id: WidgetId) => void;

  // Sidebar sections
  toggleSection: (section: string) => void;

  // Notifications
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  snoozeNotification: (id: string, until: string) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      layouts: getDefaultLayouts(),
      enabledWidgets: [...DEFAULT_ENABLED_WIDGETS],
      expandedWidget: null,
      commandPaletteOpen: false,
      focusModeOpen: false,
      focusPhase: "ritual",
      dailyReviewOpen: false,
      achievementsOpen: false,
      notificationCenterOpen: false,
      favorites: [],
      collapsedSections: [],
      recentCommands: [],
      notifications: [],

      setLayouts: (layouts) => set({ layouts }),

      toggleWidget: (id) =>
        set((state) => ({
          enabledWidgets: state.enabledWidgets.includes(id)
            ? state.enabledWidgets.filter((w) => w !== id)
            : [...state.enabledWidgets, id],
        })),

      expandWidget: (id) => set({ expandedWidget: id }),
      collapseWidget: () => set({ expandedWidget: null }),

      resetLayout: () =>
        set({
          layouts: getDefaultLayouts(),
          enabledWidgets: [...DEFAULT_ENABLED_WIDGETS],
        }),

      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      pushRecentCommand: (id) =>
        set((s) => ({
          recentCommands: [id, ...s.recentCommands.filter((c) => c !== id)].slice(0, 5),
        })),

      openFocusMode: () => set({ focusModeOpen: true, focusPhase: "ritual" }),
      closeFocusMode: () => set({ focusModeOpen: false, focusPhase: "ritual" }),
      setFocusPhase: (phase) => set({ focusPhase: phase }),

      openDailyReview: () => set({ dailyReviewOpen: true }),
      closeDailyReview: () => set({ dailyReviewOpen: false }),

      openAchievements: () => set({ achievementsOpen: true }),
      closeAchievements: () => set({ achievementsOpen: false }),

      openNotificationCenter: () => set({ notificationCenterOpen: true }),
      closeNotificationCenter: () => set({ notificationCenterOpen: false }),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),

      toggleSection: (section) =>
        set((s) => ({
          collapsedSections: s.collapsedSections.includes(section)
            ? s.collapsedSections.filter((x) => x !== section)
            : [...s.collapsedSections, section],
        })),

      addNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              ...n,
              id: Math.random().toString(36).substring(2) + Date.now().toString(36),
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...s.notifications,
          ],
        })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      snoozeNotification: (id, until) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, snoozedUntil: until, read: true } : n
          ),
        })),
      dismissNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),
      clearAllNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "widgetdeck-layout",
      partialize: (state) => ({
        layouts: state.layouts,
        enabledWidgets: state.enabledWidgets,
        favorites: state.favorites,
        collapsedSections: state.collapsedSections,
        recentCommands: state.recentCommands,
      }),
    }
  )
);
