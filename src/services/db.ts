import { NovelProject } from '../types/novel';
import { SAMPLE_PROJECT } from '../data/presetAssets';

const DB_NAME = 'novel_studio_db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const ACTIVE_KEY = 'active_project';
const LOCAL_STORAGE_FALLBACK_KEY = 'novel_studio_active_project';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveActiveProject(project: NovelProject): Promise<void> {
  try {
    const updated = { ...project, updatedAt: Date.now() };
    // Also save in localStorage as instant sync backup
    try {
      localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage full
    }

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      // save active project with specific fixed ID for fast resume
      store.put({ id: ACTIVE_KEY, project: updated });
      // also save into project collection by project.id
      store.put({ id: project.id, project: updated });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Falling back to localStorage for save:', err);
    try {
      localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Save failed entirely:', e);
    }
  }
}

export async function loadActiveProject(): Promise<NovelProject> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(ACTIVE_KEY);
      req.onsuccess = () => {
        if (req.result?.project) {
          resolve(req.result.project as NovelProject);
        } else {
          // fallback to localStorage
          const local = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
          if (local) {
            try {
              resolve(JSON.parse(local));
              return;
            } catch {
              // fallback
            }
          }
          resolve(SAMPLE_PROJECT);
        }
      };
      req.onerror = () => {
        const local = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
        if (local) {
          try {
            resolve(JSON.parse(local));
            return;
          } catch {
            // fallback
          }
        }
        resolve(SAMPLE_PROJECT);
      };
    });
  } catch {
    const local = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // fallback
      }
    }
    return SAMPLE_PROJECT;
  }
}

export async function getAllSavedProjects(): Promise<NovelProject[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result || [];
        const projects = results
          .filter((item: { id: string; project: NovelProject }) => item.id !== ACTIVE_KEY && item.project)
          .map((item: { project: NovelProject }) => item.project);
        resolve(projects);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(projectId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Delete project failed', err);
  }
}
