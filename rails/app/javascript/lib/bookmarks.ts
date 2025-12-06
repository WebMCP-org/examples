/**
 * Pure business logic functions for bookmark operations
 *
 * These functions are framework-agnostic and can be used with any UI
 */

import type { Bookmark, BookmarkStats, NotificationType } from './types';

/**
 * Create a new bookmark with generated ID and timestamp
 *
 * @param data - Bookmark data without id and timestamp
 * @returns Complete bookmark object
 */
export function createBookmark(
  data: Pick<Bookmark, 'title' | 'url'> & Partial<Pick<Bookmark, 'description' | 'tags'>>
): Bookmark {
  return {
    id: crypto.randomUUID(),
    title: data.title,
    url: data.url,
    description: data.description ?? '',
    tags: data.tags ?? [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Update an existing bookmark
 *
 * @param bookmarks - Current bookmarks array
 * @param id - ID of bookmark to update
 * @param updates - Partial bookmark data to update
 * @returns Tuple of [updated bookmarks array, updated bookmark or null]
 */
export function updateBookmark(
  bookmarks: Bookmark[],
  id: string,
  updates: Partial<Pick<Bookmark, 'title' | 'url' | 'description' | 'tags'>>
): [Bookmark[], Bookmark | null] {
  const index = bookmarks.findIndex((b) => b.id === id);

  if (index === -1) {
    return [bookmarks, null];
  }

  const updated: Bookmark[] = [...bookmarks];
  updated[index] = { ...updated[index], ...updates };

  return [updated, updated[index]];
}

/**
 * Remove a bookmark by ID
 *
 * @param bookmarks - Current bookmarks array
 * @param id - ID of bookmark to remove
 * @returns Tuple of [updated bookmarks array, removed bookmark or null]
 */
export function removeBookmark(
  bookmarks: Bookmark[],
  id: string
): [Bookmark[], Bookmark | null] {
  const index = bookmarks.findIndex((b) => b.id === id);

  if (index === -1) {
    return [bookmarks, null];
  }

  const removed = bookmarks[index];
  const updated = bookmarks.filter((_, i) => i !== index);

  return [updated, removed];
}

/**
 * Filter bookmarks by tag
 *
 * @param bookmarks - Array of bookmarks
 * @param tag - Tag to filter by (optional)
 * @returns Filtered bookmarks array
 */
export function filterBookmarksByTag(
  bookmarks: Bookmark[],
  tag?: string
): Bookmark[] {
  if (!tag) {
    return bookmarks;
  }

  return bookmarks.filter((b) => b.tags.includes(tag));
}

/**
 * Search bookmarks by title or description
 *
 * @param bookmarks - Array of bookmarks
 * @param query - Search query string
 * @returns Matching bookmarks
 */
export function searchBookmarks(
  bookmarks: Bookmark[],
  query: string
): Bookmark[] {
  const lowerQuery = query.toLowerCase();

  return bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(lowerQuery) ||
      b.description.toLowerCase().includes(lowerQuery) ||
      b.url.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Calculate bookmark statistics
 *
 * @param bookmarks - Array of bookmarks
 * @returns Statistics object
 */
export function calculateBookmarkStats(bookmarks: Bookmark[]): BookmarkStats {
  const allTags = bookmarks.flatMap((b) => b.tags);
  const tagCounts: Record<string, number> = {};

  for (const tag of allTags) {
    tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
  }

  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return {
    total: bookmarks.length,
    uniqueTags: new Set(allTags).size,
    topTags: sortedTags.map(([tag, count]) => ({ tag, count })),
  };
}

/**
 * Format bookmarks for display
 *
 * @param bookmarks - Array of bookmarks
 * @returns Formatted string
 */
export function formatBookmarkList(bookmarks: Bookmark[]): string {
  if (bookmarks.length === 0) {
    return 'No bookmarks found';
  }

  return bookmarks
    .map((b) => {
      const tags = b.tags.length > 0 ? ` [${b.tags.join(', ')}]` : '';
      return `- ${b.title}: ${b.url}${tags}`;
    })
    .join('\n');
}

export type { Bookmark, BookmarkStats, NotificationType };
