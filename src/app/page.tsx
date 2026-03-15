"use client";

import dynamic from "next/dynamic";
import GridBackground from "@/components/layout/GridBackground";
import Toolbar from "@/components/layout/Toolbar";
import ExpandedWidget from "@/components/layout/ExpandedWidget";
import CommandPalette from "@/components/CommandPalette";

const DashboardGrid = dynamic(
  () => import("@/components/layout/DashboardGrid"),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="relative min-h-screen bg-base">
      <GridBackground />
      <Toolbar />
      <DashboardGrid />
      <ExpandedWidget />
      <CommandPalette />
    </div>
  );
}
