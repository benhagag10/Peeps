import type { Person, Link, Viewport, StoredData } from '../types';
import { STORAGE_KEY } from './constants';

const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

export function loadFromStorage(): { people: Person[]; links: Link[]; viewport: Viewport } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { people: [], links: [], viewport: DEFAULT_VIEWPORT };
    }

    const data: StoredData = JSON.parse(raw);

    if (data.version !== 1) {
      console.warn('Unknown storage version, using defaults');
      return { people: [], links: [], viewport: DEFAULT_VIEWPORT };
    }

    return {
      people: data.people || [],
      links: data.links || [],
      viewport: data.viewport || DEFAULT_VIEWPORT,
    };
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return { people: [], links: [], viewport: DEFAULT_VIEWPORT };
  }
}

export function saveToStorage(people: Person[], links: Link[], viewport: Viewport): void {
  try {
    const data: StoredData = {
      version: 1,
      people,
      links,
      viewport,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
