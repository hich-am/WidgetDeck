"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flame,
  ListTodo,
  NotebookPen,
  Play,
} from "lucide-react";
import { useMemo } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useContentStore, getTodayFocusMinutes, todayStr } from "@/store/contentStore";
import type { WidgetId } from "@/types/widget";

const TARGET_FOCUS_MINUTES = 120;
const MAX_SNIPPET_LENGTH = 140;

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-border-muted/60 bg-base/50 px-4 py-3 text-sm text-text-muted">
      {label}
    </div>
  );
}

export function TasksPreview() {
  const { tasks, addTask, toggleTask } = useContentStore();
  const { expandWidget } = useDashboardStore();

  const openTasks = tasks.filter((t) => !t.done);
  const topTasks = useMemo(
    () =>
      [...openTasks]
        .sort((a, b) => (a.priority || "").localeCompare(b.priority || ""))
        .slice(0, 3),
    [openTasks]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-base/70 px-4 py-3">
        <div>
          <p className="text-xs text-text-muted">Today</p>
          <p className="text-lg font-semibold text-text-primary">
            {openTasks.length > 0 ? `${openTasks.length} tasks queued` : "You're clear"}
          </p>
        </div>
        <button
          onClick={() => addTask("Quick task", "medium", todayStr())}
          className="inline-flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/15"
        >
          <ListTodo className="h-3.5 w-3.5" />
          Capture
        </button>
      </div>

      <div className="space-y-2">
        {topTasks.length === 0 && <EmptyState label="Nothing urgent. Pick a focus." />}
        {topTasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className="flex w-full items-center gap-3 rounded-2xl border border-border-muted/60 bg-widget/40 px-3 py-2.5 text-left transition hover:border-accent/40 hover:bg-accent/5"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                task.done
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-border-muted/60 text-text-muted"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary line-clamp-1">
                {task.title}
              </p>
              {task.dueDate && (
                <p className="text-[11px] text-text-muted">
                  Due {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </p>
              )}
            </div>
            {task.priority && (
              <span className="rounded-full bg-base px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                {task.priority}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border-muted/60 px-3 py-2">
        <div className="text-sm text-text-muted">Need more control?</div>
        <button
          onClick={() => expandWidget("tasks")}
          className="inline-flex items-center gap-2 rounded-xl bg-base px-3 py-2 text-xs font-semibold text-text-primary transition hover:bg-accent/10 hover:text-accent"
        >
          Open tasks
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function PomodoroPreview() {
  const { pomodoroSessions, focusLog, incrementPomodoro } = useContentStore();
  const { expandWidget } = useDashboardStore();

  const todayMinutes = getTodayFocusMinutes(focusLog);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-base/70 px-4 py-3">
        <p className="text-xs text-text-muted">Focus time today</p>
        <div className="mt-1 flex items-center gap-3">
          <div className="text-2xl font-semibold text-text-primary">{todayMinutes}m</div>
          <div className="flex-1 rounded-full bg-base/60">
            <div
              className="h-2 rounded-full bg-accent"
              style={{ width: `${Math.min(100, (todayMinutes / TARGET_FOCUS_MINUTES) * 100)}%` }}
            />
          </div>
        </div>
        <p className="mt-1 text-[11px] text-text-muted">
          {pomodoroSessions === 0
            ? "No pomodoros logged yet"
            : `${pomodoroSessions} pomodoro${pomodoroSessions === 1 ? "" : "s"} logged`}
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-border-muted/60 bg-widget/40 p-3">
        <p className="text-sm font-semibold text-text-primary">Next sprint</p>
        <p className="text-sm text-text-muted">
          Start a 25 minute deep-focus block and log it to your streak.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => incrementPomodoro()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent/90"
          >
            <Play className="h-4 w-4" />
            Log focus
          </button>
          <button
            onClick={() => expandWidget("pomodoro")}
            className="inline-flex items-center gap-2 rounded-xl bg-base px-3 py-2 text-xs font-semibold text-text-primary transition hover:bg-accent/10 hover:text-accent"
          >
            Full view
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotesPreview() {
  const { notes, addNote } = useContentStore();
  const { expandWidget } = useDashboardStore();

  const latest = notes.length > 0 ? notes[0] : null;
  const snippetSource = latest?.content ?? "";
  const snippet =
    snippetSource.length === 0
      ? "Start a fresh note to capture ideas."
      : snippetSource.length > MAX_SNIPPET_LENGTH
        ? `${snippetSource.slice(0, MAX_SNIPPET_LENGTH)}...`
        : snippetSource;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-2xl bg-base/70 px-4 py-3">
        <div>
          <p className="text-xs text-text-muted">Notebook</p>
          <p className="text-sm font-semibold text-text-primary">
            {latest ? latest.title : "No notes yet"}
          </p>
        </div>
        <button
          onClick={() => addNote({ title: "New note" })}
          className="inline-flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/15"
        >
          <NotebookPen className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      <div className="rounded-2xl border border-border-muted/60 bg-widget/40 px-4 py-3 text-sm text-text-muted">
        {snippet}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border-muted/60 px-3 py-2">
        <div className="text-sm text-text-muted">Open your full notebook</div>
        <button
          onClick={() => expandWidget("notes")}
          className="inline-flex items-center gap-2 rounded-xl bg-base px-3 py-2 text-xs font-semibold text-text-primary transition hover:bg-accent/10 hover:text-accent"
        >
          Open notes
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function CalendarPreview() {
  const { events, addEvent } = useContentStore();
  const { expandWidget } = useDashboardStore();

  const today = todayStr();
  const nextEvent = useMemo(() => {
    return [...events]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
  }, [events, today]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-base/70 px-4 py-3">
        <div>
          <p className="text-xs text-text-muted">Upcoming</p>
          <p className="text-sm font-semibold text-text-primary">
            {nextEvent
              ? `${nextEvent.title} — ${new Date(nextEvent.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}`
              : "No events scheduled"}
          </p>
        </div>
        <button
          onClick={() => addEvent("New event", today)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/15"
        >
          <Clock3 className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      <div className="rounded-2xl border border-border-muted/60 bg-widget/40 px-4 py-3 text-sm text-text-muted">
        Stay aligned by keeping just the next thing visible. Open the calendar to plan more.
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border-muted/60 px-3 py-2">
        <div className="text-sm text-text-muted">See the full calendar</div>
        <button
          onClick={() => expandWidget("calendar")}
          className="inline-flex items-center gap-2 rounded-xl bg-base px-3 py-2 text-xs font-semibold text-text-primary transition hover:bg-accent/10 hover:text-accent"
        >
          Open calendar
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function HabitsPreview() {
  const { habits, toggleHabitDate, dailyStreak } = useContentStore();
  const { expandWidget } = useDashboardStore();
  const today = todayStr();

  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const total = habits.length || 1;
  const progress = Math.round((completedToday / total) * 100);

  const nextHabit = habits.find((h) => !h.completedDates.includes(today));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-base/70 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Habits</p>
            <p className="text-lg font-semibold text-text-primary">
              {completedToday}/{habits.length || 0} done today
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-300">
            <Flame className="h-3.5 w-3.5" />
            {dailyStreak}d streak
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-base/50">
          <div
            className="h-2 rounded-full bg-accent"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {nextHabit ? (
        <button
          onClick={() => toggleHabitDate(nextHabit.id, today)}
          className="flex w-full items-center gap-3 rounded-2xl border border-border-muted/60 bg-widget/40 px-3 py-2.5 text-left transition hover:border-accent/40 hover:bg-accent/5"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border-muted/60 text-text-muted">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">{nextHabit.name}</p>
            <p className="text-[11px] text-text-muted">Mark complete for today</p>
          </div>
        </button>
      ) : (
        <EmptyState label="All habits logged for today." />
      )}

      <div className="flex items-center justify-between rounded-2xl border border-border-muted/60 px-3 py-2">
        <div className="text-sm text-text-muted">Review streaks and stacks</div>
        <button
          onClick={() => expandWidget("habits")}
          className="inline-flex items-center gap-2 rounded-xl bg-base px-3 py-2 text-xs font-semibold text-text-primary transition hover:bg-accent/10 hover:text-accent"
        >
          Open habits
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export const widgetPreviewComponents: Partial<Record<WidgetId, React.ComponentType>> = {
  tasks: TasksPreview,
  pomodoro: PomodoroPreview,
  notes: NotesPreview,
  calendar: CalendarPreview,
  habits: HabitsPreview,
};
