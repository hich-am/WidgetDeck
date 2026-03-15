"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react";
import { useContentStore } from "@/store/contentStore";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function fmt(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarWidget() {
  const { events, addEvent, deleteEvent } = useContentStore();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = fmt(today.getFullYear(), today.getMonth(), today.getDate());

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof events> = {};
    for (const e of events) {
      (map[e.date] ||= []).push(e);
    }
    return map;
  }, [events]);

  const prev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const next = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const monthName = new Date(viewYear, viewMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const handleAdd = () => {
    if (!newTitle.trim() || !selectedDate) return;
    addEvent(newTitle.trim(), selectedDate);
    setNewTitle("");
  };

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={prev} className="rounded-lg p-1 text-text-muted hover:bg-surface hover:text-text-primary">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium text-text-primary">{monthName}</span>
        <button onClick={next} className="rounded-lg p-1 text-text-muted hover:bg-surface hover:text-text-primary">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-text-muted">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = fmt(viewYear, viewMonth, day);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const hasEvents = !!eventsByDate[dateStr];

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={`relative flex h-7 items-center justify-center rounded-lg text-[11px] transition-colors ${
                isSelected
                  ? "bg-accent text-white"
                  : isToday
                    ? "bg-accent/15 text-accent font-semibold"
                    : "text-text-primary hover:bg-surface"
              }`}
            >
              {day}
              {hasEvents && !isSelected && (
                <div className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date events */}
      {selectedDate && (
        <div className="mt-auto space-y-1.5 border-t border-border-muted pt-2">
          <div className="text-[10px] font-medium text-text-muted">{selectedDate}</div>
          {selectedEvents.map((ev) => (
            <div
              key={ev.id}
              className="group flex items-center gap-2 rounded-lg bg-surface px-2 py-1"
            >
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ev.color }} />
              <span className="flex-1 text-[11px] text-text-primary">{ev.title}</span>
              <button
                onClick={() => deleteEvent(ev.id)}
                className="text-text-muted opacity-0 hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
          <div className="flex gap-1">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Add event..."
              className="flex-1 rounded-lg border border-border-muted bg-surface px-2 py-1 text-[11px] text-text-primary placeholder-text-muted outline-none focus:border-accent/50"
            />
            <button
              onClick={handleAdd}
              className="rounded-lg bg-accent/10 px-2 text-accent hover:bg-accent/20"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
