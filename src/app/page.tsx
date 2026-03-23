"use client";

import dynamic from "next/dynamic";
import GridBackground from "@/components/layout/GridBackground";
import Toolbar from "@/components/layout/Toolbar";
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
      <div className="relative min-h-screen bg-base">
        <GridBackground />
        <Toolbar />
        <DashboardGrid />
        <ExpandedWidget />
        <CommandPalette />
        <ThemePanel />
        <DailyReview />
      </div>
    </ThemeProvider>
  );
}
