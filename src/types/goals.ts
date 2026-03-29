"use client";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  color: string;
  dueDate?: string;
  archived: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: "active" | "completed" | "on-hold";
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate?: string;
  done: boolean;
}
