"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useThemeStore, THEMES } from "@/store/themeStore";

export default function ThemePanel() {
  const { activeThemeId, themePickerOpen, setTheme, closeThemePicker } =
    useThemeStore();

  return (
    <AnimatePresence>
      {themePickerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeThemePicker}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border-muted bg-surface shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-border-muted px-5">
              <h2 className="text-sm font-semibold text-text-primary">
                Choose Theme
              </h2>
              <button
                onClick={closeThemePicker}
                className="rounded-lg p-1 text-text-muted transition-colors hover:bg-widget hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Themes grid */}
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((theme) => {
                  const isActive = theme.id === activeThemeId;
                  return (
                    <motion.button
                      key={theme.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setTheme(theme.id)}
                      className={`relative overflow-hidden rounded-xl border-2 transition-colors ${
                        isActive
                          ? "border-accent"
                          : "border-transparent hover:border-border-muted"
                      }`}
                    >
                      {/* Theme preview */}
                      <div
                        className="flex flex-col gap-1.5 p-3"
                        style={{ backgroundColor: theme.colors.base }}
                      >
                        {/* Mini toolbar */}
                        <div
                          className="flex items-center gap-1 rounded-md px-2 py-1"
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

                        {/* Mini widgets */}
                        <div className="flex gap-1">
                          <div
                            className="h-6 flex-1 rounded-md"
                            style={{
                              backgroundColor: theme.colors.widget,
                              border: `1px solid ${theme.colors.borderMuted}`,
                            }}
                          />
                          <div
                            className="h-6 flex-1 rounded-md"
                            style={{
                              backgroundColor: theme.colors.widget,
                              border: `1px solid ${theme.colors.borderMuted}`,
                            }}
                          />
                        </div>
                        <div
                          className="h-4 rounded-md"
                          style={{
                            backgroundColor: theme.colors.widget,
                            border: `1px solid ${theme.colors.borderMuted}`,
                          }}
                        />

                        {/* Color dots */}
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

                      {/* Theme name */}
                      <div
                        className="flex items-center justify-center gap-1 px-2 py-1.5"
                        style={{ backgroundColor: theme.colors.surface }}
                      >
                        <span
                          className="text-[10px] font-medium"
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
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
