import { create } from 'zustand';
import { db } from '../database/dexie';
import { Project, Note, Task, Settings } from '../database/schema';

interface NorthgateStore {
  activeWorkspace: string;
  activeProjectId: string | null;
  projects: Project[];
  recentNotes: Note[];
  todayTasks: Task[];
  settings: Settings | null;
  streak: number;
  isLoading: boolean;
  
  initialize: () => Promise<void>;
  setActiveWorkspace: (workspace: string) => void;
  setActiveProjectId: (projectId: string | null) => void;
  
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'rolloverCount'>) => Promise<void>;
  toggleTask: (id: string, completed: boolean) => Promise<void>;
  calculateStreak: () => Promise<void>;
}

export const useNorthgateStore = create<NorthgateStore>((set, get) => ({
  activeWorkspace: 'All',
  activeProjectId: null,
  projects: [],
  recentNotes: [],
  todayTasks: [],
  settings: null,
  streak: 0,
  isLoading: true,

  initialize: async () => {
    set({ isLoading: true });
    
    let settings = await db.settings.get('global');
    if (!settings) {
      settings = {
        id: 'global',
        theme: 'dark',
        weeklyReminder: true,
        notifications: false,
      };
      await db.settings.add(settings);
    }

    const projects = await db.projects.toArray();
    const recentNotes = await db.notes.orderBy('updatedAt').reverse().limit(10).toArray();
    
    const todayStr = new Date().toISOString().split('T')[0];
    // Optimized Indexed Query
    const todayTasks = await db.tasks.where('dueDate').equals(todayStr).toArray();

    set({
      projects,
      recentNotes,
      todayTasks,
      settings,
      isLoading: false,
    });

    await get().calculateStreak();
  },

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),

  addProject: async (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.projects.add(newProject);
    set((state) => ({ projects: [...state.projects, newProject] }));
  },

  updateProject: async (id, updates) => {
    const updatedFields = { ...updates, updatedAt: new Date() };
    await db.projects.update(id, updatedFields);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)),
    }));
  },

  addNote: async (noteData) => {
    const newNote: Note = {
      ...noteData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.notes.add(newNote);
    
    const recentNotes = await db.notes.orderBy('updatedAt').reverse().limit(10).toArray();
    set({ recentNotes });
  },

  addTask: async (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      rolloverCount: 0,
      createdAt: new Date(),
    };
    await db.tasks.add(newTask);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = await db.tasks.where('dueDate').equals(todayStr).toArray();
    set({ todayTasks });
  },

  toggleTask: async (id, completed) => {
    await db.tasks.update(id, { completed });
    set((state) => ({
      todayTasks: state.todayTasks.map((t) => (t.id === id ? { ...t, completed } : t)),
    }));
  },

  calculateStreak: async () => {
    const notes = await db.notes.toArray();
    if (notes.length === 0) {
      set({ streak: 0 });
      return;
    }

    const uniqueDates = Array.from(new Set(notes.map((n) => n.date))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentNoteDate = new Date(uniqueDates[0]);
    mostRecentNoteDate.setHours(0, 0, 0, 0);

    // Break streak if no posts today or yesterday
    if (mostRecentNoteDate.getTime() < yesterday.getTime()) {
      set({ streak: 0 });
      return;
    }

    let currentStreak = 0;
    let checkDate = mostRecentNoteDate;

    for (let i = 0; i < uniqueDates.length; i++) {
      const noteDate = new Date(uniqueDates[i]);
      noteDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((checkDate.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        currentStreak++;
        checkDate = noteDate;
      } else {
        break;
      }
    }

    set({ streak: currentStreak });
  },
}));

