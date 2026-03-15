"use client";

import dynamic from "next/dynamic";
import type { WidgetId } from "@/types/widget";

const TasksWidget = dynamic(() => import("./TasksWidget"), { ssr: false });
const NotesWidget = dynamic(() => import("./NotesWidget"), { ssr: false });
const CalendarWidget = dynamic(() => import("./CalendarWidget"), { ssr: false });
const ListsWidget = dynamic(() => import("./ListsWidget"), { ssr: false });
const PomodoroWidget = dynamic(() => import("./PomodoroWidget"), { ssr: false });
const HabitsWidget = dynamic(() => import("./HabitsWidget"), { ssr: false });
const BookmarksWidget = dynamic(() => import("./BookmarksWidget"), { ssr: false });

export const widgetComponents: Record<WidgetId, React.ComponentType> = {
  tasks: TasksWidget,
  notes: NotesWidget,
  calendar: CalendarWidget,
  lists: ListsWidget,
  pomodoro: PomodoroWidget,
  habits: HabitsWidget,
  bookmarks: BookmarksWidget,
};
