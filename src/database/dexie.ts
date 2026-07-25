import Dexie, { type Table } from 'dexie';
import { Project, Note, Task, Resource, WeeklyReview, Settings } from './schema';

class NorthgateDatabase extends Dexie {
  projects!: Table<Project, string>;
  notes!: Table<Note, string>;
  tasks!: Table<Task, string>;
  resources!: Table<Resource, string>;
  weeklyReviews!: Table<WeeklyReview, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('NorthgateDB');
    
    this.version(1).stores({
      projects: 'id, name, status, createdAt, updatedAt',
      notes: 'id, title, workspace, projectId, date, *tags, createdAt, updatedAt',
      tasks: 'id, noteId, projectId, completed, priority, dueDate',
      resources: 'id, name, type, projectId, createdAt',
      weeklyReviews: 'id, week, year',
      settings: 'id'
    });
  }
}

export const db = new NorthgateDatabase();
