"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckSquare, CalendarDays, Flame, Bell, Clock, Snooze, Trash2 } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useContentStore } from "@/store/contentStore";
import { useMemo } from "react";

function getSnoozeUntil(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

function getTomorrowMorning(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

const TYPE_ICONS = {
  overdue_task: CheckSquare,
  upcoming_event: CalendarDays,
  habit_reminder: Flame,
};

export default function NotificationCenter() {
  const {
    notificationCenterOpen,
    closeNotificationCenter,
    notifications,
    markNotificationRead,
    snoozeNotification,
    dismissNotification,
    clearAllNotifications,
  } = useDashboardStore();

  const { tasks } = useContentStore();

  const now = new Date().toISOString();

  // Filter out snoozed notifications
  const visible = useMemo(
    () => notifications.filter((n) => !n.snoozedUntil || n.snoozedUntil <= now),
    [notifications, now]
  );

  const unread = visible.filter((n) => !n.read);

  return (
    <AnimatePresence>
      {notificationCenterOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[55]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNotificationCenter}
          />
          <motion.div
            className="fixed right-4 top-[72px] z-[56] w-[380px] overflow-hidden rounded-3xl border border-border-muted/60 bg-widget shadow-2xl"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-muted/40 px-5 py-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-text-primary">Notifications</span>
                {unread.length > 0 && (
                  <span className="flex h-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                    {unread.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {visible.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-text-muted hover:text-text-primary transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button onClick={closeNotificationCenter} className="text-text-muted hover:text-text-primary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[460px] overflow-auto">
              {visible.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Bell className="h-10 w-10 text-text-muted/20" />
                  <p className="text-sm font-medium text-text-muted">All clear!</p>
                  <p className="text-xs text-text-muted/60">No notifications right now</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {visible.map((notif) => {
                  const Icon = TYPE_ICONS[notif.type] ?? Bell;
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`group relative border-b border-border-muted/20 px-5 py-4 transition-colors ${
                        notif.read ? "opacity-70" : ""
                      } hover:bg-base/40`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                          <Icon className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${notif.read ? "text-text-muted" : "text-text-primary"}`}>
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-xs text-text-muted line-clamp-2">{notif.body}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => snoozeNotification(notif.id, getSnoozeUntil(1))}
                              className="flex items-center gap-1 rounded-lg bg-base px-2 py-1 text-[10px] text-text-muted hover:text-accent transition-colors"
                            >
                              <Clock className="h-3 w-3" />
                              1h
                            </button>
                            <button
                              onClick={() => snoozeNotification(notif.id, getTomorrowMorning())}
                              className="flex items-center gap-1 rounded-lg bg-base px-2 py-1 text-[10px] text-text-muted hover:text-accent transition-colors"
                            >
                              <Clock className="h-3 w-3" />
                              Tomorrow
                            </button>
                            {!notif.read && (
                              <button
                                onClick={() => markNotificationRead(notif.id)}
                                className="ml-auto text-[10px] text-text-muted hover:text-accent transition-colors"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="shrink-0 text-text-muted/40 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {!notif.read && (
                        <div className="absolute top-4 right-5 h-2 w-2 rounded-full bg-accent" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
