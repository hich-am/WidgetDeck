"use client";

import dynamic from "next/dynamic";
import type { WidgetId } from "@/types/widget";

const AboutWidget = dynamic(() => import("./AboutWidget"), { ssr: false });
const ProjectsWidget = dynamic(() => import("./ProjectsWidget"), { ssr: false });
const SkillsWidget = dynamic(() => import("./SkillsWidget"), { ssr: false });
const DesignWidget = dynamic(() => import("./DesignWidget"), { ssr: false });
const AchievementsWidget = dynamic(() => import("./AchievementsWidget"), { ssr: false });
const TimelineWidget = dynamic(() => import("./TimelineWidget"), { ssr: false });
const ContactWidget = dynamic(() => import("./ContactWidget"), { ssr: false });

export const widgetComponents: Record<WidgetId, React.ComponentType> = {
  about: AboutWidget,
  projects: ProjectsWidget,
  skills: SkillsWidget,
  design: DesignWidget,
  achievements: AchievementsWidget,
  timeline: TimelineWidget,
  contact: ContactWidget,
};
