import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Person, Link, Viewport } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { AUTOSAVE_DELAY } from '../utils/constants';

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSave(people: Person[], links: Link[], viewport: Viewport) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveToStorage(people, links, viewport);
  }, AUTOSAVE_DELAY);
}

const initialData = loadFromStorage();

// Load dark mode preference from localStorage
const getInitialDarkMode = () => {
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const useStore = create<AppState>((set, get) => ({
  // Initial state from storage
  people: initialData.people,
  links: initialData.links,
  viewport: initialData.viewport,

  // Dark mode
  darkMode: getInitialDarkMode(),

  // Selection state
  selectedPersonId: null,
  selectedLinkId: null,

  // Modal state
  isAddPersonModalOpen: false,
  isEditPersonModalOpen: false,
  isAddLinkModalOpen: false,
  isEditLinkModalOpen: false,
  isConfirmDialogOpen: false,
  confirmDialogAction: null,
  confirmDialogMessage: '',

  // Link creation state
  pendingLinkSourceId: null,

  // Actions - People
  addPerson: (personData) => {
    const now = new Date().toISOString();
    const person: Person = {
      ...personData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newPeople = [...state.people, person];
      debouncedSave(newPeople, state.links, state.viewport);
      return { people: newPeople };
    });
  },

  updatePerson: (id, updates) => {
    set((state) => {
      const newPeople = state.people.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      );
      debouncedSave(newPeople, state.links, state.viewport);
      return { people: newPeople };
    });
  },

  deletePerson: (id) => {
    set((state) => {
      const newPeople = state.people.filter((p) => p.id !== id);
      const newLinks = state.links.filter((l) => l.sourceId !== id && l.targetId !== id);
      debouncedSave(newPeople, newLinks, state.viewport);
      return {
        people: newPeople,
        links: newLinks,
        selectedPersonId: state.selectedPersonId === id ? null : state.selectedPersonId,
      };
    });
  },

  // Actions - Links
  addLink: (linkData) => {
    const now = new Date().toISOString();
    const link: Link = {
      ...linkData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newLinks = [...state.links, link];
      debouncedSave(state.people, newLinks, state.viewport);
      return { links: newLinks };
    });
  },

  updateLink: (id, updates) => {
    set((state) => {
      const newLinks = state.links.map((l) =>
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      );
      debouncedSave(state.people, newLinks, state.viewport);
      return { links: newLinks };
    });
  },

  deleteLink: (id) => {
    set((state) => {
      const newLinks = state.links.filter((l) => l.id !== id);
      debouncedSave(state.people, newLinks, state.viewport);
      return {
        links: newLinks,
        selectedLinkId: state.selectedLinkId === id ? null : state.selectedLinkId,
      };
    });
  },

  // Actions - Selection
  selectPerson: (id) => {
    set({ selectedPersonId: id, selectedLinkId: null });
  },

  selectLink: (id) => {
    set({ selectedLinkId: id, selectedPersonId: null });
  },

  clearSelection: () => {
    set({ selectedPersonId: null, selectedLinkId: null });
  },

  // Actions - Viewport
  setViewport: (viewport) => {
    set({ viewport });
    const state = get();
    debouncedSave(state.people, state.links, viewport);
  },

  // Actions - Modals
  openAddPersonModal: () => set({ isAddPersonModalOpen: true }),
  closeAddPersonModal: () => set({ isAddPersonModalOpen: false }),

  openEditPersonModal: () => set({ isEditPersonModalOpen: true }),
  closeEditPersonModal: () => set({ isEditPersonModalOpen: false }),

  openAddLinkModal: (sourceId) => set({ isAddLinkModalOpen: true, pendingLinkSourceId: sourceId }),
  closeAddLinkModal: () => set({ isAddLinkModalOpen: false, pendingLinkSourceId: null }),

  openEditLinkModal: () => set({ isEditLinkModalOpen: true }),
  closeEditLinkModal: () => set({ isEditLinkModalOpen: false }),

  openConfirmDialog: (message, action) =>
    set({ isConfirmDialogOpen: true, confirmDialogMessage: message, confirmDialogAction: action }),
  closeConfirmDialog: () =>
    set({ isConfirmDialogOpen: false, confirmDialogMessage: '', confirmDialogAction: null }),

  // Actions - Link creation
  setPendingLinkSource: (id) => set({ pendingLinkSourceId: id }),

  // Actions - Dark mode
  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.darkMode;
      localStorage.setItem('darkMode', String(newDarkMode));
      return { darkMode: newDarkMode };
    });
  },

  // Computed helpers
  getLinksForPerson: (personId) => {
    const state = get();
    return state.links.filter((l) => l.sourceId === personId || l.targetId === personId);
  },

  getPeopleConnectedTo: (personId) => {
    const state = get();
    const connectedIds = new Set<string>();
    state.links.forEach((l) => {
      if (l.sourceId === personId) connectedIds.add(l.targetId);
      if (l.targetId === personId) connectedIds.add(l.sourceId);
    });
    return state.people.filter((p) => connectedIds.has(p.id));
  },

  getPersonById: (id) => {
    const state = get();
    return state.people.find((p) => p.id === id);
  },

  getLinkById: (id) => {
    const state = get();
    return state.links.find((l) => l.id === id);
  },
}));
