"use client";

import GridBackground from "@/components/layout/GridBackground";
import Sidebar from "@/components/layout/Sidebar";
import MainHeader from "@/components/layout/MainHeader";
import ExpandedWidget from "@/components/layout/ExpandedWidget";
import CommandPalette from "@/components/CommandPalette";
import ThemeProvider from "@/components/ThemeProvider";
import ThemePanel from "@/components/ThemePanel";
import DailyReview from "@/components/DailyReview";

interface DashboardShellProps {
  children: React.ReactNode;
  mainClassName?: string;
}

export default function DashboardShell({
  children,
  mainClassName,
}: DashboardShellProps) {
  return (
    <ThemeProvider>
      <div className="relative flex h-screen overflow-hidden bg-base">
        <GridBackground />

        <Sidebar />

        <div className="relative flex flex-1 flex-col overflow-hidden">
          <MainHeader />
          <main className={`flex-1 overflow-auto ${mainClassName ?? ""}`}>
            {children}
          </main>
        </div>

        <ExpandedWidget />
        <CommandPalette />
        <ThemePanel />
        <DailyReview />
      </div>
    </ThemeProvider>
  );
}
