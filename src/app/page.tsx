"use client";

import dynamic from "next/dynamic";
import GridBackground from "@/components/layout/GridBackground";
import Toolbar from "@/components/layout/Toolbar";
import ExpandedWidget from "@/components/layout/ExpandedWidget";
import CommandPalette from "@/components/CommandPalette";
import ThemeProvider from "@/components/ThemeProvider";
import ThemePanel from "@/components/ThemePanel";
import { useDashboardStore } from "@/store/dashboardStore";
import TodayView from "@/components/today/TodayView";

const DashboardGrid = dynamic(
  () => import("@/components/layout/DashboardGrid"),
  { ssr: false }
);

function AppContent() {
  const activeView = useDashboardStore((s) => s.activeView);

  return (
    <div className="relative min-h-screen bg-base">
      <GridBackground />
      <Toolbar />
      {activeView === "today" ? (
        <main className="relative z-10 overflow-y-auto">
          <TodayView />
        </main>
      ) : (
        <DashboardGrid />
      )}
      <ExpandedWidget />
      <CommandPalette />
      <ThemePanel />
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
