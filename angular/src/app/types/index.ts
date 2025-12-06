/**
 * Type definitions for the note-taking application
 */

/** Available color options for notes */
export type NoteColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

/** Represents a note in the note manager */
export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Parameters for creating a new note */
export interface CreateNoteParams {
  title: string;
  content: string;
  color?: NoteColor;
  pinned?: boolean;
}

/** Statistics about notes */
export interface NoteStats {
  total: number;
  pinned: number;
  byColor: Record<NoteColor, number>;
}
