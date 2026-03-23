"use client";

import dynamic from "next/dynamic";
import GridBackground from "@/components/layout/GridBackground";
import Sidebar from "@/components/layout/Sidebar";
import MainHeader from "@/components/layout/MainHeader";
import ExpandedWidget from "@/components/layout/ExpandedWidget";
import CommandPalette from "@/components/CommandPalette";
import ThemeProvider from "@/components/ThemeProvider";
import ThemePanel from "@/components/ThemePanel";
import DailyReview from "@/components/DailyReview";

const DashboardGrid = dynamic(
  () => import("@/components/layout/DashboardGrid"),
  { ssr: false }
);

export default function Home() {
  return (
    <ThemeProvider>
      <div className="relative flex h-screen overflow-hidden bg-base">
        <GridBackground />

        {/* Fixed left sidebar */}
        <Sidebar />

        {/* Main content: header + scrollable grid */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <MainHeader />
          <main className="flex-1 overflow-auto">
            <DashboardGrid />
          </main>
        </div>

        {/* Overlays */}
        <ExpandedWidget />
        <CommandPalette />
        <ThemePanel />
        <DailyReview />
      </div>
    </ThemeProvider>
  );
}
