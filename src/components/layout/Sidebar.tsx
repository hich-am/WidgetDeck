"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare, FileText, CalendarDays, Flame, Timer, Bookmark,
  List, BarChart2, Plus, HelpCircle, Archive, LayoutGrid,
  ChevronRight, Target, Star, StarOff, ChevronDown, Bell,
  Sparkles,
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useContentStore } from "@/store/contentStore";
import type { WidgetId } from "@/types/widget";
import GamificationBar from "@/components/GamificationBar";

const SECTIONS = [
  {
    label: "Productivity",
    items: [
      { id: "tasks" as WidgetId, label: "Tasks", icon: CheckSquare },
      { id: "notes" as WidgetId, label: "Notes", icon: FileText },
      { id: "calendar" as WidgetId, label: "Calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Planning",
    items: [
      { id: "goals" as WidgetId, label: "Goals", icon: Target },
      { id: "habits" as WidgetId, label: "Habits", icon: Flame },
      { id: "lists" as WidgetId, label: "Lists", icon: List },
    ],
  },
  {
    label: "Focus",
    items: [
      { id: "pomodoro" as WidgetId, label: "Pomodoro", icon: Timer },
      { id: "bookmarks" as WidgetId, label: "Bookmarks", icon: Bookmark },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "analytics" as WidgetId, label: "Analytics", icon: BarChart2 },
    ],
  },
];

function NavItem({
  id,
  label,
  icon: Icon,
  collapsed,
  isActive,
  isFavorite,
  isEnabled,
  onExpand,
  onToggleFavorite,
}: {
  id: WidgetId;
  label: string;
  icon: React.ElementType;
  collapsed: boolean;
  isActive: boolean;
  isFavorite: boolean;
  isEnabled: boolean;
  onExpand: () => void;
  onToggleFavorite: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        whileHover={{ x: collapsed ? 0 : 2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onExpand}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
          isActive
            ? "bg-accent/10 text-accent"
            : isEnabled
            ? "text-text-primary hover:bg-base"
            : "text-text-muted/50 hover:text-text-muted"
        }`}
        title={collapsed ? label : undefined}
      >
        <Icon
          className={`h-4 w-4 shrink-0 ${
            isActive ? "text-accent" : isEnabled ? "text-accent/70" : "text-text-muted/40"
          }`}
        />
        {!collapsed && (
          <>
            <span className="flex-1 text-left font-medium">{label}</span>
            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-accent" />}
            {!isActive && isEnabled && (
              <ChevronRight className="h-3 w-3 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </>
        )}
      </motion.button>
      {/* Favorite toggle — shown on hover when not collapsed */}
      {!collapsed && hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute right-9 top-1/2 -translate-y-1/2 text-text-muted/30 hover:text-amber transition-colors"
          title={isFavorite ? "Unpin" : "Pin to favorites"}
        >
          {isFavorite ? <Star className="h-3 w-3 fill-amber text-amber" /> : <Star className="h-3 w-3" />}
        </button>
      )}
    </motion.div>
  );
}

export default function Sidebar() {
  const {
    expandWidget,
    enabledWidgets,
    toggleWidget,
    openCommandPalette,
    expandedWidget,
    favorites,
    toggleFavorite,
    collapsedSections,
    toggleSection,
    openNotificationCenter,
    notifications,
  } = useDashboardStore();

  const [collapsed, setCollapsed] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const favoriteItems = SECTIONS.flatMap((s) => s.items).filter((item) =>
    favorites.includes(item.id)
  );

  return (
    <aside
      className={`relative flex h-screen shrink-0 flex-col border-r border-border-muted/60 bg-surface/80 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-3 border-b border-border-muted/40 px-4">
        <div className="flex shrink-0 items-center justify-center">
          <img src="/logo.png" alt="monolith icon" className="h-8 w-8 object-contain" />
        </div>
        {!collapsed && (
          <div className="flex flex-1 items-center">
            <img src="/logotype.png" alt="monolith" className="h-5 w-auto object-contain dark:invert" />
          </div>
        )}
      </div>

      {/* Gamification */}
      {!collapsed && (
        <div className="flex px-3 py-2 border-b border-border-muted/40 pb-3 items-center justify-center">
          <GamificationBar />
        </div>
      )}

      {/* Nav */}
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-2 py-3">

        {/* Favorites section */}
        {!collapsed && favoriteItems.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1.5 mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              <Star className="h-2.5 w-2.5 fill-amber text-amber" />
              Favorites
            </div>
            {favoriteItems.map(({ id, label, icon }) => (
              <NavItem
                key={id + "-fav"}
                id={id}
                label={label}
                icon={icon}
                collapsed={collapsed}
                isActive={expandedWidget === id}
                isFavorite={true}
                isEnabled={enabledWidgets.includes(id)}
                onExpand={() => expandWidget(id)}
                onToggleFavorite={() => toggleFavorite(id)}
              />
            ))}
            <div className="mx-3 my-2 border-t border-border-muted/30" />
          </div>
        )}

        {/* Sections */}
        {SECTIONS.map((section) => {
          const isCollapsed = collapsedSections.includes(section.label);
          return (
            <div key={section.label} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex w-full items-center gap-1.5 px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
                >
                  <motion.div animate={{ rotate: isCollapsed ? -90 : 0 }} transition={{ duration: 0.15 }}>
                    <ChevronDown className="h-3 w-3" />
                  </motion.div>
                  {section.label}
                </button>
              )}
              <AnimatePresence initial={false}>
                {(!isCollapsed || collapsed) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    {section.items.map(({ id, label, icon }) => (
                      <NavItem
                        key={id}
                        id={id}
                        label={label}
                        icon={icon}
                        collapsed={collapsed}
                        isActive={expandedWidget === id}
                        isFavorite={favorites.includes(id)}
                        isEnabled={enabledWidgets.includes(id)}
                        onExpand={() => expandWidget(id)}
                        onToggleFavorite={() => toggleFavorite(id)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="border-t border-border-muted/40 px-2 py-3 space-y-0.5">
        <button
          onClick={openCommandPalette}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-base hover:text-accent"
          title={collapsed ? "Add widget" : undefined}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Add Widget</span>}
        </button>
        <button
          onClick={openNotificationCenter}
          className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-base hover:text-text-primary"
          title={collapsed ? "Notifications" : undefined}
        >
          <Bell className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Notifications</span>}
          {unreadCount > 0 && (
            <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-[82px] flex h-6 w-6 items-center justify-center rounded-full border border-border-muted/60 bg-surface text-text-muted shadow-sm hover:text-accent transition-colors"
      >
        <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
      </button>
    </aside>
  );
}
