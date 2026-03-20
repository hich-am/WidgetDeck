"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ExternalLink, Globe } from "lucide-react";
import { useContentStore } from "@/store/contentStore";

export default function BookmarksWidget() {
  const { bookmarks, addBookmark, deleteBookmark } = useContentStore();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handleAdd = () => {
    const tTrim = title.trim();
    const uTrim = url.trim();
    if (!tTrim || !uTrim) return;
    addBookmark(tTrim, uTrim.startsWith("http") ? uTrim : `https://${uTrim}`);
    setTitle("");
    setUrl("");
  };

  const getFavicon = (rawUrl: string) => {
    try {
      const u = new URL(rawUrl);
      return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Add form */}
      <div className="flex flex-col gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bookmark title"
          className="rounded-xl border border-border-muted/60 bg-surface px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
        />
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="https://..."
            className="flex-1 rounded-xl border border-border-muted/60 bg-surface px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-4 text-sm font-medium text-accent hover:bg-accent/15"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </motion.button>
        </div>
      </div>

      {/* Bookmark list */}
      <div className="flex-1 space-y-2 overflow-auto">
        {bookmarks.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            Save your first bookmark
          </div>
        )}
        <AnimatePresence initial={false}>
          {bookmarks.map((bm) => {
            const favicon = getFavicon(bm.url);
            return (
              <motion.div
                key={bm.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="group flex items-center gap-3 rounded-xl bg-base/60 px-4 py-3"
              >
                {favicon ? (
                  <img src={favicon} alt="" className="h-5 w-5 shrink-0 rounded" />
                ) : (
                  <Globe className="h-5 w-5 shrink-0 text-text-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-text-primary">
                    {bm.title}
                  </div>
                  <div className="truncate text-xs text-text-muted">{bm.url}</div>
                </div>
                <a
                  href={bm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-text-muted transition-colors hover:text-accent"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => deleteBookmark(bm.id)}
                  className="shrink-0 text-text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
