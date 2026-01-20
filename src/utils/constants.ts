import type { LinkType } from '../types';

export const AVATAR_COLORS = [
  '#F87171', // red
  '#FB923C', // orange
  '#FBBF24', // amber
  '#A3E635', // lime
  '#34D399', // emerald
  '#22D3EE', // cyan
  '#818CF8', // indigo
  '#E879F9', // fuchsia
];

export const LINK_TYPE_COLORS: Record<LinkType, string> = {
  collaborator: '#3B82F6', // blue
  mentor: '#8B5CF6', // purple
  student: '#EC4899', // pink
  colleague: '#6B7280', // gray
  friend: '#10B981', // green
  advisor: '#F59E0B', // amber
  coauthor: '#EF4444', // red
  stream: '#06B6D4', // cyan
  interest: '#F472B6', // pink
  other: '#6B7280', // gray
};

export const LINK_TYPE_LABELS: Record<LinkType, string> = {
  collaborator: 'Collaborator',
  mentor: 'Mentor',
  student: 'Student',
  colleague: 'Colleague',
  friend: 'Friend',
  advisor: 'Advisor',
  coauthor: 'Co-author',
  stream: 'Same Stream',
  interest: 'Shared Interest',
  other: 'Other',
};

export const LINK_TYPES: LinkType[] = [
  'collaborator',
  'mentor',
  'student',
  'colleague',
  'friend',
  'advisor',
  'coauthor',
  'other',
];

// Stream link types are auto-generated, not manually selectable

export const STORAGE_KEY = 'research-graph-data';

export const AUTOSAVE_DELAY = 500;
