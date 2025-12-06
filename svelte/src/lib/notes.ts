/**
 * Pure business logic for notes management
 *
 * All functions are pure and do not modify their inputs.
 * State mutations happen in the Svelte components.
 */

import type { Note, NoteColor, NoteStats } from '../types';

/**
 * Create a new note with default values
 *
 * @param params - Note creation parameters
 * @returns A new note object
 */
export function createNote(params: {
  title: string;
  content?: string;
  color?: NoteColor;
}): Note {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    title: params.title,
    content: params.content ?? '',
    color: params.color ?? 'yellow',
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update an existing note's content
 *
 * @param notes - Current notes array
 * @param noteId - ID of note to update
 * @param updates - Fields to update
 * @returns Tuple of [updated notes array, updated note or null if not found]
 */
export function updateNote(
  notes: Note[],
  noteId: string,
  updates: Partial<Pick<Note, 'title' | 'content' | 'color'>>
): [Note[], Note | null] {
  const noteIndex = notes.findIndex((n) => n.id === noteId);
  if (noteIndex === -1) {
    return [notes, null];
  }

  const updatedNote = {
    ...notes[noteIndex],
    ...updates,
    updatedAt: new Date(),
  };

  const updatedNotes = [
    ...notes.slice(0, noteIndex),
    updatedNote,
    ...notes.slice(noteIndex + 1),
  ];

  return [updatedNotes, updatedNote];
}

/**
 * Toggle a note's pinned status
 *
 * @param notes - Current notes array
 * @param noteId - ID of note to toggle
 * @returns Tuple of [updated notes array, updated note or null if not found]
 */
export function togglePinNote(notes: Note[], noteId: string): [Note[], Note | null] {
  const noteIndex = notes.findIndex((n) => n.id === noteId);
  if (noteIndex === -1) {
    return [notes, null];
  }

  const updatedNote = {
    ...notes[noteIndex],
    pinned: !notes[noteIndex].pinned,
    updatedAt: new Date(),
  };

  const updatedNotes = [
    ...notes.slice(0, noteIndex),
    updatedNote,
    ...notes.slice(noteIndex + 1),
  ];

  return [updatedNotes, updatedNote];
}

/**
 * Remove a note from the array
 *
 * @param notes - Current notes array
 * @param noteId - ID of note to remove
 * @returns Tuple of [updated notes array, removed note or null if not found]
 */
export function removeNote(notes: Note[], noteId: string): [Note[], Note | null] {
  const noteIndex = notes.findIndex((n) => n.id === noteId);
  if (noteIndex === -1) {
    return [notes, null];
  }

  const removedNote = notes[noteIndex];
  const updatedNotes = [...notes.slice(0, noteIndex), ...notes.slice(noteIndex + 1)];

  return [updatedNotes, removedNote];
}

/**
 * Search notes by title or content
 *
 * @param notes - Notes array to search
 * @param query - Search query (case-insensitive)
 * @returns Filtered notes matching the query
 */
export function searchNotes(notes: Note[], query: string): Note[] {
  const lowerQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Sort notes with pinned notes first, then by update date
 *
 * @param notes - Notes array to sort
 * @returns Sorted notes array
 */
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
}

/**
 * Calculate statistics about notes
 *
 * @param notes - Notes array to analyze
 * @returns Statistics object
 */
export function calculateNoteStats(notes: Note[]): NoteStats {
  const byColor: Record<NoteColor, number> = {
    yellow: 0,
    blue: 0,
    green: 0,
    pink: 0,
    purple: 0,
  };

  for (const note of notes) {
    byColor[note.color]++;
  }

  return {
    total: notes.length,
    pinned: notes.filter((n) => n.pinned).length,
    byColor,
  };
}

/**
 * Format notes for display as a summary string
 *
 * @param notes - Notes to format
 * @returns Formatted summary string
 */
export function formatNotesSummary(notes: Note[]): string {
  if (notes.length === 0) {
    return 'No notes yet.';
  }

  const lines = notes.map((note) => {
    const pinnedIndicator = note.pinned ? '[PINNED] ' : '';
    const preview = note.content.length > 50 ? note.content.slice(0, 50) + '...' : note.content;
    return `- ${pinnedIndicator}${note.title}: ${preview || '(no content)'}`;
  });

  return `Notes (${notes.length} total):\n${lines.join('\n')}`;
}
