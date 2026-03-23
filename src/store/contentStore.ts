"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Task,
  Note,
  CalEvent,
  UserList,
  ListItem,
  Habit,
  Bookmark,
  FocusSession,
} from "@/types/widget";

function uid(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

// ── Streak helpers ──
export function computeStreak(completedDates: string[]): number {
  const sorted = [...completedDates].sort().reverse();
  if (!sorted.length) return 0;
  const t = today();
  const y = yesterday();
  if (sorted[0] !== t && sorted[0] !== y) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const curr = new Date(sorted[i] + "T00:00:00");
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// Streak with forgiveness: only break after 2+ consecutive misses
export function computeForgivingStreak(completedDates: string[]): number {
  const sorted = [...completedDates].sort().reverse();
  if (!sorted.length) return 0;
  const t = today();
  const y = yesterday();
  // Must have been done today or yesterday
  if (sorted[0] !== t && sorted[0] !== y) {
    // Check if only one day was missed (forgiveness)
    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);
    const twoDaysAgo = dayBefore.toISOString().split("T")[0];
    if (sorted[0] !== twoDaysAgo) return 0;
  }
  let streak = 1;
  let missesAllowed = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const curr = new Date(sorted[i] + "T00:00:00");
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      streak++;
    } else if (diff === 2 && missesAllowed > 0) {
      // One day forgiven
      missesAllowed--;
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

interface ContentStore {
  // ── Tasks ──
  tasks: Task[];
  addTask: (title: string, priority?: Task["priority"], dueDate?: string) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  carryOverTasks: () => void;

  // ── Notes ──
  notes: Note[];
  activeNoteId: string | null;
  addNote: (options?: { tags?: string[]; isJournal?: boolean; title?: string }) => void;
  updateNote: (id: string, data: Partial<Pick<Note, "title" | "content" | "tags">>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  ensureDailyJournal: () => void;

  // ── Calendar Events ──
  events: CalEvent[];
  addEvent: (title: string, date: string, color?: string) => void;
  deleteEvent: (id: string) => void;

  // ── Lists ──
  lists: UserList[];
  activeListId: string | null;
  addList: (name: string) => void;
  deleteList: (id: string) => void;
  setActiveList: (id: string | null) => void;
  addListItem: (listId: string, text: string) => void;
  toggleListItem: (listId: string, itemId: string) => void;
  deleteListItem: (listId: string, itemId: string) => void;

  // ── Habits ──
  habits: Habit[];
  addHabit: (name: string, color?: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDate: (id: string, date: string) => void;

  // ── Bookmarks ──
  bookmarks: Bookmark[];
  addBookmark: (title: string, url: string) => void;
  deleteBookmark: (id: string) => void;

  // ── Pomodoro / Focus ──
  pomodoroSessions: number;
  activeTaskId: string | null;   // task linked to current focus session
  autoStartPomodoro: boolean;
  focusLog: FocusSession[];      // historical sessions
  incrementPomodoro: (taskId?: string, taskTitle?: string) => void;
  resetPomodoro: () => void;
  setActiveTask: (id: string | null) => void;
  toggleAutoStart: () => void;

  // ── Global ──
  resetAll: () => void;
}

const initialState = {
  tasks: [],
  notes: [],
  activeNoteId: null,
  events: [],
  lists: [],
  activeListId: null,
  habits: [],
  bookmarks: [],
  pomodoroSessions: 0,
  activeTaskId: null,
  autoStartPomodoro: false,
  focusLog: [] as FocusSession[],
};

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Tasks ──
      addTask: (title, priority = "medium", dueDate) =>
        set((s) => ({
          tasks: [
            {
              id: uid(),
              title,
              done: false,
              priority,
              dueDate,
              createdAt: new Date().toISOString(),
            },
            ...s.tasks,
          ],
        })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined }
              : t
          ),
        })),

      updateTask: (id, data) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      // Move yesterday's undone tasks to today if they had yesterday's date
      carryOverTasks: () =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (!t.done && t.dueDate === yesterday()) {
              return { ...t, dueDate: today() };
            }
            return t;
          }),
        })),

      // ── Notes ──
      addNote: (options = {}) =>
        set((s) => {
          const n: Note = {
            id: uid(),
            title: options.title || "Untitled",
            content: "",
            updatedAt: new Date().toISOString(),
            tags: options.tags || [],
            isJournal: options.isJournal || false,
            linkedTaskIds: [],
          };
          return { notes: [n, ...s.notes], activeNoteId: n.id };
        }),

      updateNote: (id, data) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id
              ? { ...n, ...data, updatedAt: new Date().toISOString() }
              : n
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
        const todayStr = today();
        const todayTitle = `Journal — ${new Date().toLocaleDateString("en", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}`;
        const existing = s.notes.find((n) => n.isJournal && n.title === todayTitle);
        if (!existing) {
          const n: Note = {
            id: uid(),
            title: todayTitle,
            content: "",
            updatedAt: new Date().toISOString(),
            tags: ["journal"],
            isJournal: true,
            linkedTaskIds: [],
          };
          set((s) => ({ notes: [n, ...s.notes], activeNoteId: n.id }));
        } else {
          set({ activeNoteId: existing.id });
        }
      },

      // ── Calendar ──
      addEvent: (title, date, color = "#5B8DEF") =>
        set((s) => ({
          events: [...s.events, { id: uid(), title, date, color }],
        })),
      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      // ── Lists ──
      addList: (name) =>
        set((s) => {
          const l: UserList = { id: uid(), name, items: [] };
          return { lists: [...s.lists, l], activeListId: l.id };
        }),
      deleteList: (id) =>
        set((s) => ({
          lists: s.lists.filter((l) => l.id !== id),
          activeListId: s.activeListId === id ? null : s.activeListId,
        })),
      setActiveList: (id) => set({ activeListId: id }),
      addListItem: (listId, text) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? { ...l, items: [...l.items, { id: uid(), text, done: false }] }
              : l
          ),
        })),
      toggleListItem: (listId, itemId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  items: l.items.map((i) =>
                    i.id === itemId ? { ...i, done: !i.done } : i
                  ),
                }
              : l
          ),
        })),
      deleteListItem: (listId, itemId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
              : l
          ),
        })),

      // ── Habits ──
      addHabit: (name, color = "#5B8DEF") =>
        set((s) => ({
          habits: [...s.habits, { id: uid(), name, color, completedDates: [] }],
        })),
      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
      toggleHabitDate: (id, date) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completedDates: h.completedDates.includes(date)
                    ? h.completedDates.filter((d) => d !== date)
                    : [...h.completedDates, date],
                }
              : h
          ),
        })),

      // ── Bookmarks ──
      addBookmark: (title, url) =>
        set((s) => ({
          bookmarks: [
            { id: uid(), title, url, createdAt: new Date().toISOString() },
            ...s.bookmarks,
          ],
        })),
      deleteBookmark: (id) =>
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),

      // ── Pomodoro / Focus ──
      incrementPomodoro: (taskId, taskTitle) =>
        set((s) => {
          const session: FocusSession = {
            date: today(),
            taskId,
            taskTitle,
            minutes: 25,
          };
          return {
            pomodoroSessions: s.pomodoroSessions + 1,
            focusLog: [...s.focusLog, session],
          };
        }),
      resetPomodoro: () => set({ pomodoroSessions: 0 }),
      setActiveTask: (id) => set({ activeTaskId: id }),
      toggleAutoStart: () =>
        set((s) => ({ autoStartPomodoro: !s.autoStartPomodoro })),

      // ── Global ──
      resetAll: () => set(initialState),
    }),
    { name: "widgetdeck-content" }
  )
);

// ── Selectors ──
export function getTodayTasks(tasks: Task[]): Task[] {
  const t = new Date().toISOString().split("T")[0];
  return tasks.filter((task) => !task.dueDate || task.dueDate === t);
}

export function getTodayFocusMinutes(focusLog: FocusSession[]): number {
  const t = today();
  return focusLog.filter((s) => s.date === t).reduce((acc, s) => acc + s.minutes, 0);
}
