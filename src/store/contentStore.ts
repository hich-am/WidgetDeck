"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Task,
  Note,
  CalEvent,
  UserList,
  Habit,
  Bookmark,
  FocusSession,
  BadgeId,
} from "@/types/widget";
import { BADGE_CATALOG } from "@/types/widget";

function uid(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

// ── Streak helpers ──
export function computeForgivingStreak(completedDates: string[]): number {
  const sorted = [...completedDates].sort().reverse();
  if (!sorted.length) return 0;
  const t = todayStr();
  const y = yesterday();
  const twoDaysAgo = (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().split("T")[0]; })();
  if (sorted[0] !== t && sorted[0] !== y && sorted[0] !== twoDaysAgo) return 0;
  let streak = 1;
  let missesAllowed = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const curr = new Date(sorted[i] + "T00:00:00");
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) { streak++; }
    else if (diff === 2 && missesAllowed > 0) { missesAllowed--; streak++; }
    else break;
  }
  return streak;
}

export function getTodayFocusMinutes(focusLog: FocusSession[]): number {
  return focusLog.filter((s) => s.date === todayStr()).reduce((a, s) => a + s.minutes, 0);
}

// ── XP rules ──
const XP_TASK_DONE = 10;
const XP_POMODORO = 15;
const XP_HABIT = 5;

function checkBadges(state: {
  tasks: Task[];
  pomodoroSessions: number;
  habits: Habit[];
  xp: number;
  dailyStreak: number;
  badges: BadgeId[];
}): BadgeId[] {
  const earned: BadgeId[] = [];
  const { tasks, pomodoroSessions, habits, xp, dailyStreak, badges } = state;
  const doneTasks = tasks.filter((t) => t.done).length;
  const today = todayStr();

  const candidates: [BadgeId, boolean][] = [
    ["first_task",   doneTasks >= 1],
    ["streak_3",     dailyStreak >= 3],
    ["streak_7",     dailyStreak >= 7],
    ["streak_30",    dailyStreak >= 30],
    ["pomodoro_10",  pomodoroSessions >= 10],
    ["pomodoro_50",  pomodoroSessions >= 50],
    ["xp_100",       xp >= 100],
    ["xp_500",       xp >= 500],
    ["habit_master", habits.length > 0 && habits.every((h) => h.completedDates.includes(today))],
  ];

  for (const [id, condition] of candidates) {
    if (condition && !badges.includes(id)) earned.push(id);
  }
  return earned;
}

interface ContentStore {
  tasks: Task[];
  notes: Note[];
  activeNoteId: string | null;
  events: CalEvent[];
  lists: UserList[];
  activeListId: string | null;
  habits: Habit[];
  bookmarks: Bookmark[];
  pomodoroSessions: number;
  activeTaskId: string | null;
  autoStartPomodoro: boolean;
  focusLog: FocusSession[];

  // Gamification
  xp: number;
  dailyStreak: number;
  lastActiveDate: string;
  badges: BadgeId[];
  recentBadge: BadgeId | null;

  // Tasks
  addTask: (title: string, priority?: Task["priority"], dueDate?: string, opts?: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  carryOverTasks: () => void;

  // Notes
  addNote: (opts?: { tags?: string[]; isJournal?: boolean; title?: string }) => void;
  updateNote: (id: string, data: Partial<Pick<Note, "title" | "content" | "tags">>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  ensureDailyJournal: () => void;

  // Calendar
  addEvent: (title: string, date: string, color?: string) => void;
  deleteEvent: (id: string) => void;

  // Lists
  addList: (name: string) => void;
  deleteList: (id: string) => void;
  setActiveList: (id: string | null) => void;
  addListItem: (listId: string, text: string) => void;
  toggleListItem: (listId: string, itemId: string) => void;
  deleteListItem: (listId: string, itemId: string) => void;

  // Habits
  addHabit: (name: string, color?: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDate: (id: string, date: string) => void;

  // Bookmarks
  addBookmark: (title: string, url: string) => void;
  deleteBookmark: (id: string) => void;

  // Pomodoro
  incrementPomodoro: (taskId?: string, taskTitle?: string) => void;
  resetPomodoro: () => void;
  setActiveTask: (id: string | null) => void;
  toggleAutoStart: () => void;

  // Global
  resetAll: () => void;
  touchActivity: () => void;
  clearRecentBadge: () => void;
}

const initialState = {
  tasks: [] as Task[],
  notes: [] as Note[],
  activeNoteId: null as string | null,
  events: [] as CalEvent[],
  lists: [] as UserList[],
  activeListId: null as string | null,
  habits: [] as Habit[],
  bookmarks: [] as Bookmark[],
  pomodoroSessions: 0,
  activeTaskId: null as string | null,
  autoStartPomodoro: false,
  focusLog: [] as FocusSession[],
  xp: 0,
  dailyStreak: 0,
  lastActiveDate: "",
  badges: [] as BadgeId[],
  recentBadge: null as BadgeId | null,
};

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      touchActivity: () => {
        const t = todayStr();
        set((s) => {
          if (s.lastActiveDate === t) return {};
          const y = yesterday();
          const newStreak = s.lastActiveDate === y ? s.dailyStreak + 1 : 1;
          return { lastActiveDate: t, dailyStreak: newStreak };
        });
      },

      clearRecentBadge: () => set({ recentBadge: null }),

      // ── Tasks ──
      addTask: (title, priority = "medium", dueDate, opts = {}) => {
        set((s) => {
          const newTask: Task = {
            id: uid(), title, done: false, priority, dueDate,
            createdAt: new Date().toISOString(), ...opts,
          };
          return { tasks: [newTask, ...s.tasks] };
        });
        get().touchActivity();
      },

      toggleTask: (id) => {
        set((s) => {
          const task = s.tasks.find((t) => t.id === id);
          if (!task) return {};
          const completing = !task.done;
          const newXp = completing ? s.xp + XP_TASK_DONE : Math.max(0, s.xp - XP_TASK_DONE);
          const newTasks = s.tasks.map((t) =>
            t.id === id ? { ...t, done: completing, completedAt: completing ? new Date().toISOString() : undefined } : t
          );
          const newBadges = checkBadges({ ...s, tasks: newTasks, xp: newXp });
          return {
            tasks: newTasks,
            xp: newXp,
            badges: [...s.badges, ...newBadges],
            recentBadge: newBadges[0] ?? s.recentBadge,
          };
        });
        get().touchActivity();
      },

      updateTask: (id, data) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)) })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      carryOverTasks: () =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            !t.done && t.dueDate === yesterday() ? { ...t, dueDate: todayStr() } : t
          ),
        })),

      // ── Notes ──
      addNote: (opts = {}) =>
        set((s) => {
          const n: Note = {
            id: uid(), title: opts.title || "Untitled",
            content: "", updatedAt: new Date().toISOString(),
            tags: opts.tags || [], isJournal: opts.isJournal || false, linkedTaskIds: [],
          };
          return { notes: [n, ...s.notes], activeNoteId: n.id };
        }),

      updateNote: (id, data) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n
          ),
        })),

      deleteNote: (id) =>
        set((s) => ({
          notes: s.notes.filter((n) => n.id !== id),
          activeNoteId: s.activeNoteId === id ? null : s.activeNoteId,
        })),

      setActiveNote: (id) => set({ activeNoteId: id }),

      ensureDailyJournal: () => {
        const s = get();
        const title = `Journal — ${new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}`;
        const existing = s.notes.find((n) => n.isJournal && n.title === title);
        if (!existing) {
          const n: Note = { id: uid(), title, content: "", updatedAt: new Date().toISOString(), tags: ["journal"], isJournal: true, linkedTaskIds: [] };
          set((s) => ({ notes: [n, ...s.notes], activeNoteId: n.id }));
        } else {
          set({ activeNoteId: existing.id });
        }
      },

      // ── Calendar ──
      addEvent: (title, date, color = "#5B8DEF") =>
        set((s) => ({ events: [...s.events, { id: uid(), title, date, color }] })),
      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      // ── Lists ──
      addList: (name) =>
        set((s) => { const l: UserList = { id: uid(), name, items: [] }; return { lists: [...s.lists, l], activeListId: l.id }; }),
      deleteList: (id) =>
        set((s) => ({ lists: s.lists.filter((l) => l.id !== id), activeListId: s.activeListId === id ? null : s.activeListId })),
      setActiveList: (id) => set({ activeListId: id }),
      addListItem: (listId, text) =>
        set((s) => ({ lists: s.lists.map((l) => l.id === listId ? { ...l, items: [...l.items, { id: uid(), text, done: false }] } : l) })),
      toggleListItem: (listId, itemId) =>
        set((s) => ({ lists: s.lists.map((l) => l.id === listId ? { ...l, items: l.items.map((i) => i.id === itemId ? { ...i, done: !i.done } : i) } : l) })),
      deleteListItem: (listId, itemId) =>
        set((s) => ({ lists: s.lists.map((l) => l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l) })),

      // ── Habits ──
      addHabit: (name, color = "#5B8DEF") =>
        set((s) => ({ habits: [...s.habits, { id: uid(), name, color, completedDates: [] }] })),
      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
      toggleHabitDate: (habitId, date) => {
        set((s) => {
          const habit = s.habits.find((h) => h.id === habitId);
          if (!habit) return {};
          const wasOn = habit.completedDates.includes(date);
          const newHabits = s.habits.map((h) =>
            h.id === habitId
              ? { ...h, completedDates: wasOn ? h.completedDates.filter((d) => d !== date) : [...h.completedDates, date] }
              : h
          );
          const newXp = wasOn ? Math.max(0, s.xp - XP_HABIT) : s.xp + XP_HABIT;
          const newBadges = checkBadges({ ...s, habits: newHabits, xp: newXp });
          return { habits: newHabits, xp: newXp, badges: [...s.badges, ...newBadges], recentBadge: newBadges[0] ?? s.recentBadge };
        });
        get().touchActivity();
      },

      // ── Bookmarks ──
      addBookmark: (title, url) =>
        set((s) => ({ bookmarks: [{ id: uid(), title, url, createdAt: new Date().toISOString() }, ...s.bookmarks] })),
      deleteBookmark: (id) =>
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),

      // ── Pomodoro ──
      incrementPomodoro: (taskId, taskTitle) => {
        set((s) => {
          const session: FocusSession = { date: todayStr(), taskId, taskTitle, minutes: 25 };
          const newXp = s.xp + XP_POMODORO;
          const newSessions = s.pomodoroSessions + 1;
          const newBadges = checkBadges({ ...s, pomodoroSessions: newSessions, xp: newXp });
          return {
            pomodoroSessions: newSessions,
            focusLog: [...s.focusLog, session],
            xp: newXp,
            badges: [...s.badges, ...newBadges],
            recentBadge: newBadges[0] ?? s.recentBadge,
          };
        });
        get().touchActivity();
      },
      resetPomodoro: () => set({ pomodoroSessions: 0 }),
      setActiveTask: (id) => set({ activeTaskId: id }),
      toggleAutoStart: () => set((s) => ({ autoStartPomodoro: !s.autoStartPomodoro })),

      resetAll: () => set(initialState),
    }),
    { name: "widgetdeck-content" }
  )
);
