export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  goals: { id: string; text: string; completed: boolean }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  workspace: string; // e.g., 'Learning', 'Personal', 'Work'
  projectId?: string; // Relation to Project
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  date: string; // YYYY-MM-DD
  attachments: string[]; // Paths or local object URLs to Resources
}

export interface Task {
  id: string;
  noteId?: string; // Optional if created within a note
  projectId?: string; // Relation to Project
  text: string;
  completed: boolean;
  rolloverCount: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: string; // YYYY-MM-DD
}

export interface Resource {
  id: string;
  name: string;
  type: string; // MIME type
  size: number; // Bytes
  path: string; // Local sandboxed file path or object URL
  projectId?: string;
  createdAt: Date;
}

export interface WeeklyReview {
  id: string; // e.g., "2026-W29"
  week: number;
  year: number;
  summary: string;
  generated: boolean;
  edited: boolean;
}

export interface Settings {
  id: 'global';
  theme: 'dark' | 'light';
  githubTokenEncrypted?: string;
  githubRepo?: string;
  weeklyReminder: boolean;
  notifications: boolean;
  lastSyncAt?: Date;
}

