"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useThemeStore, THEMES } from "@/store/themeStore";

export default function ThemePanel() {
  const { activeThemeId, themePickerOpen, setTheme, closeThemePicker } =
    useThemeStore();

  const lightThemes = THEMES.filter((t) =>
    ["canvas", "warm-sand", "ocean-breeze", "rose-garden", "sage", "lavender-mist", "coral-sunset", "monochrome"].includes(t.id)
  );
  const darkThemes = THEMES.filter(
    (t) => !lightThemes.includes(t)
  );

  return (
    <AnimatePresence>
      {themePickerOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-text-primary/10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeThemePicker}
          />

          <motion.div
            className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border-muted bg-surface"
            style={{ boxShadow: "-16px 0 48px rgba(0,0,0,0.06)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex h-16 items-center justify-between border-b border-border-muted px-5">
              <h2 className="text-sm font-bold tracking-tight text-text-primary">
                Theme
              </h2>
              <button
                onClick={closeThemePicker}
                className="rounded-xl p-1.5 text-text-muted transition-colors hover:bg-base hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {/* Light section */}
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Light
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {lightThemes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={theme.id === activeThemeId}
                    onClick={() => setTheme(theme.id)}
                  />
                ))}
              </div>

              {/* Dark section */}
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Dark
              </div>
              <div className="grid grid-cols-2 gap-3">
                {darkThemes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={theme.id === activeThemeId}
                    onClick={() => setTheme(theme.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ThemeCard({
  theme,
  isActive,
  onClick,
}: {
  theme: (typeof THEMES)[number];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border-2 transition-colors ${
        isActive
          ? "border-accent shadow-sm"
          : "border-transparent hover:border-border-muted"
      }`}
    >
      <div
        className="flex flex-col gap-1.5 p-3"
        style={{ backgroundColor: theme.colors.base }}
      >
        <div
          className="flex items-center gap-1 rounded-lg px-2 py-1"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: theme.colors.accent }}
          />
          <div
            className="h-1 flex-1 rounded"
            style={{ backgroundColor: theme.colors.borderMuted }}
          />
        </div>
        <div className="flex gap-1">
          <div
            className="h-6 flex-1 rounded-lg"
            style={{
              backgroundColor: theme.colors.widget,
              border: `1px solid ${theme.colors.borderMuted}`,
            }}
          />
          <div
            className="h-6 flex-1 rounded-lg"
            style={{
              backgroundColor: theme.colors.widget,
              border: `1px solid ${theme.colors.borderMuted}`,
            }}
          />
        </div>
        <div className="flex justify-center gap-1 pt-0.5">
          {[
            theme.colors.accent,
            theme.colors.cyan,
            theme.colors.amber,
          ].map((c, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div
        className="flex items-center justify-center gap-1.5 px-2 py-2"
        style={{ backgroundColor: theme.colors.surface }}
      >
        <span
          className="text-[10px] font-semibold"
          style={{ color: theme.colors.textPrimary }}
        >
          {theme.name}
        </span>
        {isActive && (
          <Check
            className="h-3 w-3"
            style={{ color: theme.colors.accent }}
          />
        )}
      </div>
    </motion.button>
  );
}
