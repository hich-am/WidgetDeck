"use client";

import { motion } from "framer-motion";
import { Plus, Trash2, FileText } from "lucide-react";
import { useContentStore } from "@/store/contentStore";

export default function NotesWidget() {
  const { notes, activeNoteId, addNote, updateNote, deleteNote, setActiveNote } =
    useContentStore();

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="flex h-full gap-2">
      {/* Sidebar */}
      <div className="flex w-32 shrink-0 flex-col gap-1 border-r border-border-muted pr-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addNote}
          className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-2 py-1.5 text-[10px] font-medium text-accent transition-colors hover:bg-accent/20"
        >
          <Plus className="h-3 w-3" />
          New Note
        </motion.button>

        <div className="flex-1 space-y-0.5 overflow-auto">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setActiveNote(note.id)}
              className={`group flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] transition-colors ${
                activeNoteId === note.id
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:bg-surface hover:text-text-primary"
              }`}
            >
              <FileText className="h-3 w-3 shrink-0" />
              <span className="flex-1 truncate">{note.title || "Untitled"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                className="shrink-0 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 flex-col gap-2">
        {activeNote ? (
          <>
            <input
              value={activeNote.title}
              onChange={(e) =>
                updateNote(activeNote.id, { title: e.target.value })
              }
              className="border-b border-border-muted bg-transparent pb-1 text-sm font-medium text-text-primary outline-none placeholder-text-muted"
              placeholder="Note title..."
            />
            <textarea
              value={activeNote.content}
              onChange={(e) =>
                updateNote(activeNote.id, { content: e.target.value })
              }
              placeholder="Start writing..."
              className="flex-1 resize-none bg-transparent text-xs leading-relaxed text-text-primary outline-none placeholder-text-muted"
            />
            <div className="text-[10px] text-text-muted">
              {new Date(activeNote.updatedAt).toLocaleString()}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">
            {notes.length === 0
              ? "Create your first note"
              : "Select a note to edit"}
          </div>
        )}
      </div>
    </div>
  );
}
