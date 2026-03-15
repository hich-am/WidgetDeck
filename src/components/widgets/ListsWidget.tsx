"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, List as ListIcon } from "lucide-react";
import { useContentStore } from "@/store/contentStore";

export default function ListsWidget() {
  const {
    lists,
    activeListId,
    addList,
    deleteList,
    setActiveList,
    addListItem,
    toggleListItem,
    deleteListItem,
  } = useContentStore();

  const [newListName, setNewListName] = useState("");
  const [newItemText, setNewItemText] = useState("");

  const activeList = lists.find((l) => l.id === activeListId);

  const handleAddList = () => {
    const trimmed = newListName.trim();
    if (!trimmed) return;
    addList(trimmed);
    setNewListName("");
  };

  const handleAddItem = () => {
    if (!activeList || !newItemText.trim()) return;
    addListItem(activeList.id, newItemText.trim());
    setNewItemText("");
  };

  return (
    <div className="flex h-full flex-col gap-2">
      {/* List tabs */}
      <div className="flex flex-wrap gap-1">
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => setActiveList(list.id)}
            className={`group flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors ${
              activeListId === list.id
                ? "bg-accent/10 text-accent"
                : "bg-surface text-text-muted hover:text-text-primary"
            }`}
          >
            <ListIcon className="h-3 w-3" />
            {list.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteList(list.id);
              }}
              className="ml-0.5 opacity-0 hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          </button>
        ))}
      </div>

      {/* New list input */}
      <div className="flex gap-1">
        <input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddList()}
          placeholder="New list name..."
          className="flex-1 rounded-lg border border-border-muted bg-surface px-2 py-1 text-[11px] text-text-primary placeholder-text-muted outline-none focus:border-accent/50"
        />
        <button
          onClick={handleAddList}
          className="rounded-lg bg-accent/10 px-2 text-accent hover:bg-accent/20"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* List items */}
      <div className="flex-1 space-y-1 overflow-auto">
        {!activeList && (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">
            {lists.length === 0 ? "Create a list to get started" : "Select a list"}
          </div>
        )}
        {activeList && (
          <>
            <AnimatePresence initial={false}>
              {activeList.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="group flex items-center gap-2 rounded-lg bg-surface px-2 py-1.5"
                >
                  <button onClick={() => toggleListItem(activeList.id, item.id)} className="shrink-0">
                    {item.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-text-muted" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-[11px] ${
                      item.done ? "text-text-muted line-through" : "text-text-primary"
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteListItem(activeList.id, item.id)}
                    className="text-text-muted opacity-0 hover:text-red-400 group-hover:opacity-100"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add item */}
            <div className="flex gap-1 pt-1">
              <input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                placeholder="Add item..."
                className="flex-1 rounded-lg border border-border-muted bg-surface px-2 py-1 text-[11px] text-text-primary placeholder-text-muted outline-none focus:border-accent/50"
              />
              <button
                onClick={handleAddItem}
                className="rounded-lg bg-accent/10 px-2 text-accent hover:bg-accent/20"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
