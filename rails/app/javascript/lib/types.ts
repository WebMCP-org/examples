/**
 * Type definitions for the bookmarks application
 */

/**
 * Represents a saved bookmark
 */
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  createdAt: string;
}

/**
 * Statistics about saved bookmarks
 */
export interface BookmarkStats {
  total: number;
  uniqueTags: number;
  topTags: Array<{ tag: string; count: number }>;
}

/**
 * Notification types for UI feedback
 */
export type NotificationType = 'success' | 'error';
