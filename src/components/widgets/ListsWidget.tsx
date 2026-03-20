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
    <div className="flex h-full flex-col gap-3">
      {/* List tabs */}
      <div className="flex flex-wrap gap-1.5">
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => setActiveList(list.id)}
            className={`group flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
              activeListId === list.id
                ? "bg-accent/10 text-accent"
                : "bg-base text-text-muted hover:text-text-primary"
            }`}
          >
            <ListIcon className="h-3.5 w-3.5" />
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
      <div className="flex gap-2">
        <input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddList()}
          placeholder="New list name..."
          className="flex-1 rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
        />
        <button
          onClick={handleAddList}
          className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 text-sm font-medium text-accent hover:bg-accent/15"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {/* List items */}
      <div className="flex-1 space-y-1.5 overflow-auto">
        {!activeList && (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
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
                  className="group flex items-center gap-3 rounded-xl bg-base/60 px-4 py-2.5"
                >
                  <button onClick={() => toggleListItem(activeList.id, item.id)} className="shrink-0">
                    {item.done ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-accent" />
                    ) : (
                      <Circle className="h-4.5 w-4.5 text-text-muted/50" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      item.done ? "text-text-muted line-through" : "text-text-primary"
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteListItem(activeList.id, item.id)}
                    className="text-text-muted opacity-0 hover:text-red-400 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add item */}
            <div className="flex gap-2 pt-1">
              <input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                placeholder="Add item..."
                className="flex-1 rounded-xl border border-border-muted/60 bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
              />
              <button
                onClick={handleAddItem}
                className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 text-sm font-medium text-accent hover:bg-accent/15"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
