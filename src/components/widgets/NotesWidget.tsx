"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, FileText, Tag, BookOpen, X } from "lucide-react";
import { useContentStore } from "@/store/contentStore";

export default function NotesWidget() {
  const {
    notes, activeNoteId,
    addNote, updateNote, deleteNote, setActiveNote,
    ensureDailyJournal,
  } = useContentStore();

  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const activeNote = notes.find((n) => n.id === activeNoteId);

  // Collect all unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  const visibleNotes = filterTag
    ? notes.filter((n) => n.tags?.includes(filterTag))
    : notes;

  const addTag = () => {
    if (!activeNote || !tagInput.trim()) return;
    const cleaned = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (!activeNote.tags?.includes(cleaned)) {
      updateNote(activeNote.id, { tags: [...(activeNote.tags || []), cleaned] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    if (!activeNote) return;
    updateNote(activeNote.id, { tags: activeNote.tags?.filter((t) => t !== tag) || [] });
  };

  return (
    <div className="flex h-full gap-3">
      {/* Sidebar */}
      <div className="flex w-36 shrink-0 flex-col gap-2 border-r border-border-muted/40 pr-3">
        <div className="flex gap-1">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => addNote()}
            className="flex flex-1 items-center gap-1.5 rounded-xl bg-accent/10 px-2 py-2 text-xs font-medium text-accent hover:bg-accent/15"
          >
            <Plus className="h-3.5 w-3.5" /> Note
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={ensureDailyJournal}
            title="Open today's journal"
            className="flex items-center justify-center rounded-xl bg-base p-2 text-text-muted hover:text-accent"
          >
            <BookOpen className="h-3.5 w-3.5" />
          </motion.button>
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilterTag(null)}
              className={`rounded-lg px-2 py-0.5 text-[10px] font-medium transition-colors ${
                !filterTag ? "bg-accent/10 text-accent" : "bg-base text-text-muted hover:text-text-primary"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`rounded-lg px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  filterTag === tag ? "bg-accent/10 text-accent" : "bg-base text-text-muted hover:text-text-primary"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Note list */}
        <div className="flex-1 space-y-1 overflow-auto">
          {visibleNotes.map((note) => (
            <div key={note.id} role="button" tabIndex={0}
              onClick={() => setActiveNote(note.id)}
              onKeyDown={(e) => e.key === "Enter" && setActiveNote(note.id)}
              className={`group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                activeNoteId === note.id
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:bg-base hover:text-text-primary"
              }`}
            >
              {note.isJournal
                ? <BookOpen className="h-3.5 w-3.5 shrink-0" />
                : <FileText className="h-3.5 w-3.5 shrink-0" />}
              <span className="flex-1 truncate">{note.title || "Untitled"}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                className="shrink-0 opacity-0 hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 flex-col gap-3">
        {activeNote ? (
          <>
            <input value={activeNote.title}
              onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
              className="border-b border-border-muted/40 bg-transparent pb-2 text-base font-semibold text-text-primary outline-none placeholder-text-muted"
              placeholder="Note title..."
            />

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-1.5">
              {activeNote.tags?.map((tag) => (
                <span key={tag}
                  className="flex items-center gap-1 rounded-full bg-accent/8 px-2 py-0.5 text-[11px] font-medium text-accent"
                >
                  #{tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              <input value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                placeholder="#tag"
                className="w-16 bg-transparent text-[11px] text-text-muted outline-none placeholder-text-muted"
              />
            </div>

            <textarea value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              placeholder="Start writing..."
              className="flex-1 resize-none bg-transparent text-sm text-text-primary outline-none placeholder-text-muted"
              style={{ lineHeight: "1.8" }}
            />
            <div className="text-xs text-text-muted">
              {new Date(activeNote.updatedAt).toLocaleString()}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            {notes.length === 0 ? "Create your first note" : "Select a note to edit"}
          </div>
        )}
      </div>
    </div>
  );
}
