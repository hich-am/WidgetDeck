"use client";

import { useEffect } from "react";
import { useThemeStore, getActiveTheme } from "@/store/themeStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const activeThemeId = useThemeStore((s) => s.activeThemeId);

  useEffect(() => {
    const theme = getActiveTheme(activeThemeId);
    const root = document.documentElement;
    root.style.setProperty("--color-base", theme.colors.base);
    root.style.setProperty("--color-surface", theme.colors.surface);
    root.style.setProperty("--color-widget", theme.colors.widget);
    root.style.setProperty("--color-border-muted", theme.colors.borderMuted);
    root.style.setProperty("--color-accent", theme.colors.accent);
    root.style.setProperty("--color-accent-hover", theme.colors.accentHover);
    root.style.setProperty("--color-cyan", theme.colors.cyan);
    root.style.setProperty("--color-amber", theme.colors.amber);
    root.style.setProperty("--color-text-primary", theme.colors.textPrimary);
    root.style.setProperty("--color-text-muted", theme.colors.textMuted);
  }, [activeThemeId]);

  return <>{children}</>;
}
