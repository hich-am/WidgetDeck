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
} from "@/types/widget";

function uid(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

interface ContentStore {
  // ── Tasks ──
  tasks: Task[];
  addTask: (title: string, priority?: Task["priority"]) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // ── Notes ──
  notes: Note[];
  activeNoteId: string | null;
  addNote: () => void;
  updateNote: (id: string, data: Partial<Pick<Note, "title" | "content">>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;

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

  // ── Pomodoro ──
  pomodoroSessions: number;
  incrementPomodoro: () => void;
  resetPomodoro: () => void;

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
};

export const useContentStore = create<ContentStore>()(
  persist(
    (set) => ({
      ...initialState,

      // ── Tasks ──
      addTask: (title, priority = "medium") =>
        set((s) => ({
          tasks: [
            { id: uid(), title, done: false, priority },
            ...s.tasks,
          ],
        })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        })),
      updateTask: (id, data) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),
      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      // ── Notes ──
      addNote: () =>
        set((s) => {
          const n: Note = {
            id: uid(),
            title: "Untitled",
            content: "",
            updatedAt: new Date().toISOString(),
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

      // ── Calendar ──
      addEvent: (title, date, color = "#6C63FF") =>
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
              ? {
                  ...l,
                  items: [...l.items, { id: uid(), text, done: false }],
                }
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
      addHabit: (name, color = "#6C63FF") =>
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

      // ── Pomodoro ──
      incrementPomodoro: () =>
        set((s) => ({ pomodoroSessions: s.pomodoroSessions + 1 })),
      resetPomodoro: () => set({ pomodoroSessions: 0 }),

      // ── Global ──
      resetAll: () => set(initialState),
    }),
    {
      name: "widgetdeck-content",
    }
  )
);
