"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
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
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={prev} className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-base hover:text-text-primary">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-text-primary">{monthName}</span>
        <button onClick={next} className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-base hover:text-text-primary">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-text-muted">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
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
              className={`relative flex h-8 items-center justify-center rounded-xl text-xs transition-all ${
                isSelected
                  ? "bg-accent text-white font-medium shadow-sm"
                  : isToday
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-text-primary hover:bg-base"
              }`}
            >
              {day}
              {hasEvents && !isSelected && (
                <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent/50" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date events */}
      {selectedDate && (
        <div className="mt-auto space-y-2 border-t border-border-muted/40 pt-3">
          <div className="text-xs font-medium text-text-muted">{selectedDate}</div>
          {selectedEvents.map((ev) => (
            <div
              key={ev.id}
              className="group flex items-center gap-2.5 rounded-xl bg-base/60 px-3 py-2"
            >
              <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: ev.color }} />
              <span className="flex-1 text-sm text-text-primary">{ev.title}</span>
              <button
                onClick={() => deleteEvent(ev.id)}
                className="text-text-muted opacity-0 hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <div className="flex gap-1.5">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Add event..."
              className="flex-1 rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
            />
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 rounded-xl bg-accent/10 px-3 text-sm text-accent hover:bg-accent/15"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
