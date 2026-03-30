"use client";

import dynamic from "next/dynamic";
import DashboardShell from "@/components/layout/DashboardShell";

const DashboardGrid = dynamic(
  () => import("@/components/layout/DashboardGrid"),
  { ssr: false }
);

export default function Home() {
  return (
    <DashboardShell mainClassName="py-4">
      <DashboardGrid />
    </DashboardShell>
  );
}
