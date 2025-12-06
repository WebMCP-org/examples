/**
 * Type definitions for the notes application
 */

/**
 * Color options for notes
 */
export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple';

/**
 * Represents a note in the notes app
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
 * Statistics about notes
 */
export interface NoteStats {
  total: number;
  pinned: number;
  byColor: Record<NoteColor, number>;
}

/**
 * Notification types for UI feedback
 */
export type NotificationType = 'success' | 'error';

/**
 * Notification state
 */
export interface Notification {
  message: string;
  type: NotificationType;
}
