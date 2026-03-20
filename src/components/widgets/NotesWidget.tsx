"use client";

import { motion } from "framer-motion";
import { Plus, Trash2, FileText } from "lucide-react";
import { useContentStore } from "@/store/contentStore";

export default function NotesWidget() {
  const { notes, activeNoteId, addNote, updateNote, deleteNote, setActiveNote } =
    useContentStore();

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="flex h-full gap-3">
      {/* Sidebar */}
      <div className="flex w-36 shrink-0 flex-col gap-2 border-r border-border-muted/40 pr-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addNote}
          className="flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/15"
        >
          <Plus className="h-3.5 w-3.5" />
          New Note
        </motion.button>

        <div className="flex-1 space-y-1 overflow-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveNote(note.id)}
              onKeyDown={(e) => e.key === "Enter" && setActiveNote(note.id)}
              className={`group flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                activeNoteId === note.id
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:bg-base hover:text-text-primary"
              }`}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate">{note.title || "Untitled"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                className="shrink-0 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
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
            <input
              value={activeNote.title}
              onChange={(e) =>
                updateNote(activeNote.id, { title: e.target.value })
              }
              className="border-b border-border-muted/40 bg-transparent pb-2 text-base font-semibold text-text-primary outline-none placeholder-text-muted"
              placeholder="Note title..."
            />
            <textarea
              value={activeNote.content}
              onChange={(e) =>
                updateNote(activeNote.id, { content: e.target.value })
              }
              placeholder="Start writing..."
              className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-text-primary outline-none placeholder-text-muted"
              style={{ lineHeight: "1.8" }}
            />
            <div className="text-xs text-text-muted">
              {new Date(activeNote.updatedAt).toLocaleString()}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            {notes.length === 0
              ? "Create your first note"
              : "Select a note to edit"}
          </div>
        )}
      </div>
    </div>
  );
}
