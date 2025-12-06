/**
 * Type definitions for the note-taking application
 */

/**
 * Color options for notes
 */
export type NoteColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

/**
 * Notification types for UI feedback
 */
export type NotificationType = 'success' | 'error';

/**
 * Represents a note in the note manager
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parameters for creating a new note
 */
export interface CreateNoteParams {
  title: string;
  content: string;
  color?: NoteColor;
  pinned?: boolean;
}

/**
 * Statistics about notes
 */
export interface NoteStats {
  total: number;
  pinned: number;
  byColor: Record<NoteColor, number>;
}

/**
 * Notification state
 */
export interface Notification {
  message: string;
  type: NotificationType;
}
