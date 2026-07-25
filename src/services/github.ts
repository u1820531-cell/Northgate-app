import { db } from '../database/dexie';
import { Note, Project } from '../database/schema';
import { decryptToken, getOrCreateDeviceId } from '../utils/crypto';

interface SyncPayload {
  path: string;
  content: string;
  sha?: string;
}

export class GitHubSyncService {
  private static async getDecryptedToken(): Promise<string | null> {
    const settings = await db.settings.get('global');
    if (!settings || !settings.githubTokenEncrypted) return null;
    try {
      const deviceId = getOrCreateDeviceId();
      return await decryptToken(settings.githubTokenEncrypted, deviceId);
    } catch (e) {
      console.error('Failed to decrypt GitHub Token', e);
      return null;
    }
  }

  private static formatNotePath(note: Note): string {
    const dateObj = new Date(note.date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const sanitizedTitle = note.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    return `notes/${year}/${month}/${note.date}/${sanitizedTitle || 'untitled'}.md`;
  }

  private static serializeNote(note: Note, project?: Project): string {
    return [
      '---',
      `id: "${note.id}"`,
      `title: "${note.title.replace(/"/g, '\\"')}"`,
      `date: "${note.date}"`,
      `workspace: "${note.workspace}"`,
      project ? `project: "${project.name}"` : 'project: null',
      `tags: [${note.tags.map((t) => `"${t}"`).join(', ')}]`,
      `updatedAt: "${note.updatedAt.toISOString()}"`,
      '---',
      '',
      note.content,
    ].join('\n');
  }

  private static utf8ToBase64(str: string): string {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static async getFileSHA(token: string, repo: string, path: string): Promise<string | null> {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (response.status === 200) {
        const data = await response.json();
        return data.sha;
      }
      return null;
    } catch {
      return null;
    }
  }

  public static async pushFile(path: string, content: string, message: string): Promise<boolean> {
    const token = await this.getDecryptedToken();
    const settings = await db.settings.get('global');
    
    if (!token || !settings?.githubRepo) {
      throw new Error('GitHub Sync configuration missing or invalid decryption credentials.');
    }

    const sha = await this.getFileSHA(token, settings.githubRepo, path);
    const payload: SyncPayload = { path, content };
    if (sha) payload.sha = sha;

    try {
      const response = await fetch(`https://api.github.com/repos/${settings.githubRepo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: this.utf8ToBase64(content),
          sha: payload.sha,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `GitHub API returned status ${response.status}`);
      }

      await db.settings.update('global', { lastSyncAt: new Date() });
      return true;
    } catch (error) {
      console.error('Push failed:', error);
      throw error;
    }
  }

  public static async syncPendingNotes(): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };
    const notes = await db.notes.toArray();

    for (const note of notes) {
      const project = note.projectId ? await db.projects.get(note.projectId) : undefined;
      const path = this.formatNotePath(note);
      const content = this.serializeNote(note, project);
      
      try {
        await this.pushFile(path, content, `Sync Note: ${note.title}`);
        results.success++;
      } catch {
        results.failed++;
      }
    }

    return results;
  }
}

