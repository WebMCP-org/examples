/**
 * Stimulus controller for WebMCP bookmark tools
 *
 * This controller registers WebMCP tools that allow AI assistants to interact
 * with the bookmarks application. It integrates with the Rails Stimulus pattern
 * while providing the same WebMCP capabilities as other framework integrations.
 *
 * @see https://docs.mcp-b.ai/frameworks/rails
 * @see https://stimulus.hotwired.dev/
 */

import { Controller } from '@hotwired/stimulus';
import '@mcp-b/global';
import type { Bookmark } from '../lib/types';
import {
  createBookmark,
  removeBookmark,
  updateBookmark,
  filterBookmarksByTag,
  searchBookmarks,
  calculateBookmarkStats,
  formatBookmarkList,
} from '../lib/bookmarks';

/**
 * Bookmarks WebMCP Controller
 *
 * Manages bookmark state and registers AI-accessible tools via WebMCP.
 * Tools are registered when the controller connects and cleaned up on disconnect.
 *
 * @example
 * ```html
 * <div data-controller="bookmarks-webmcp"
 *      data-bookmarks-webmcp-bookmarks-value="[]">
 * </div>
 * ```
 */
export default class BookmarksWebmcpController extends Controller {
  static values = {
    bookmarks: { type: Array, default: [] },
  };

  declare bookmarksValue: Bookmark[];

  private toolCleanups: Array<{ unregister: () => void }> = [];

  /**
   * Called when the controller is connected to the DOM
   * Registers all WebMCP tools for AI interaction
   */
  connect(): void {
    console.log('WebMCP Bookmarks controller connected');
    this.registerTools();
    console.log(
      'Available tools: add_bookmark, delete_bookmark, update_bookmark, list_bookmarks, search_bookmarks, get_bookmark_stats'
    );
  }

  /**
   * Called when the controller is disconnected from the DOM
   * Cleans up all registered tools
   */
  disconnect(): void {
    this.toolCleanups.forEach((cleanup) => cleanup.unregister());
    this.toolCleanups = [];
    console.log('WebMCP Bookmarks controller disconnected');
  }

  /**
   * Register all WebMCP tools for bookmark management
   */
  private registerTools(): void {
    this.registerAddBookmarkTool();
    this.registerDeleteBookmarkTool();
    this.registerUpdateBookmarkTool();
    this.registerListBookmarksTool();
    this.registerSearchBookmarksTool();
    this.registerGetStatsTool();
  }

  /**
   * WebMCP Tool: Add Bookmark
   * Creates a new bookmark with the provided details
   */
  private registerAddBookmarkTool(): void {
    const cleanup = navigator.modelContext.registerTool({
      name: 'add_bookmark',
      description: 'Add a new bookmark to save a URL for later',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Bookmark title',
          },
          url: {
            type: 'string',
            description: 'URL to bookmark',
          },
          description: {
            type: 'string',
            description: 'Optional description of the bookmark',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags for organizing the bookmark (e.g., ["work", "reference"])',
          },
        },
        required: ['title', 'url'],
      },
      execute: async (args) => {
        const bookmark = createBookmark({
          title: args.title as string,
          url: args.url as string,
          description: (args.description as string) ?? '',
          tags: (args.tags as string[]) ?? [],
        });

        this.bookmarksValue = [...this.bookmarksValue, bookmark];
        this.showNotification(`Added bookmark: ${bookmark.title}`, 'success');
        this.renderBookmarks();

        return {
          content: [
            {
              type: 'text',
              text: `Successfully added bookmark "${bookmark.title}" (${bookmark.url})`,
            },
          ],
        };
      },
    });

    this.toolCleanups.push(cleanup);
  }

  /**
   * WebMCP Tool: Delete Bookmark
   * Removes a bookmark by its ID
   */
  private registerDeleteBookmarkTool(): void {
    const cleanup = navigator.modelContext.registerTool({
      name: 'delete_bookmark',
      description: 'Delete a bookmark by its ID',
      inputSchema: {
        type: 'object',
        properties: {
          bookmarkId: {
            type: 'string',
            description: 'ID of the bookmark to delete',
          },
        },
        required: ['bookmarkId'],
      },
      execute: async (args) => {
        const [updated, removed] = removeBookmark(
          this.bookmarksValue,
          args.bookmarkId as string
        );

        if (!removed) {
          this.showNotification('Bookmark not found', 'error');
          return {
            content: [{ type: 'text', text: 'Bookmark not found' }],
          };
        }

        this.bookmarksValue = updated;
        this.showNotification(`Deleted: ${removed.title}`, 'success');
        this.renderBookmarks();

        return {
          content: [{ type: 'text', text: `Deleted bookmark "${removed.title}"` }],
        };
      },
    });

    this.toolCleanups.push(cleanup);
  }

  /**
   * WebMCP Tool: Update Bookmark
   * Updates an existing bookmark's properties
   */
  private registerUpdateBookmarkTool(): void {
    const cleanup = navigator.modelContext.registerTool({
      name: 'update_bookmark',
      description: 'Update an existing bookmark',
      inputSchema: {
        type: 'object',
        properties: {
          bookmarkId: {
            type: 'string',
            description: 'ID of the bookmark to update',
          },
          title: {
            type: 'string',
            description: 'New title (optional)',
          },
          url: {
            type: 'string',
            description: 'New URL (optional)',
          },
          description: {
            type: 'string',
            description: 'New description (optional)',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'New tags (optional)',
          },
        },
        required: ['bookmarkId'],
      },
      execute: async (args) => {
        const updates: Partial<Bookmark> = {};
        if (args.title) updates.title = args.title as string;
        if (args.url) updates.url = args.url as string;
        if (args.description !== undefined) updates.description = args.description as string;
        if (args.tags) updates.tags = args.tags as string[];

        const [updated, bookmark] = updateBookmark(
          this.bookmarksValue,
          args.bookmarkId as string,
          updates
        );

        if (!bookmark) {
          this.showNotification('Bookmark not found', 'error');
          return {
            content: [{ type: 'text', text: 'Bookmark not found' }],
          };
        }

        this.bookmarksValue = updated;
        this.showNotification(`Updated: ${bookmark.title}`, 'success');
        this.renderBookmarks();

        return {
          content: [{ type: 'text', text: `Updated bookmark "${bookmark.title}"` }],
        };
      },
    });

    this.toolCleanups.push(cleanup);
  }

  /**
   * WebMCP Tool: List Bookmarks
   * Returns all bookmarks, optionally filtered by tag
   */
  private registerListBookmarksTool(): void {
    const cleanup = navigator.modelContext.registerTool({
      name: 'list_bookmarks',
      description: 'Get a list of all saved bookmarks',
      inputSchema: {
        type: 'object',
        properties: {
          tag: {
            type: 'string',
            description: 'Filter by tag (optional)',
          },
        },
      },
      execute: async (args) => {
        const filtered = filterBookmarksByTag(
          this.bookmarksValue,
          args.tag as string | undefined
        );

        return {
          content: [
            {
              type: 'text',
              text:
                filtered.length > 0
                  ? formatBookmarkList(filtered)
                  : 'No bookmarks found',
            },
          ],
        };
      },
    });

    this.toolCleanups.push(cleanup);
  }

  /**
   * WebMCP Tool: Search Bookmarks
   * Searches bookmarks by title, description, or URL
   */
  private registerSearchBookmarksTool(): void {
    const cleanup = navigator.modelContext.registerTool({
      name: 'search_bookmarks',
      description: 'Search bookmarks by title, description, or URL',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query',
          },
        },
        required: ['query'],
      },
      execute: async (args) => {
        const results = searchBookmarks(this.bookmarksValue, args.query as string);

        return {
          content: [
            {
              type: 'text',
              text:
                results.length > 0
                  ? `Found ${results.length} bookmark(s):\n${formatBookmarkList(results)}`
                  : `No bookmarks found matching "${args.query}"`,
            },
          ],
        };
      },
    });

    this.toolCleanups.push(cleanup);
  }

  /**
   * WebMCP Tool: Get Bookmark Stats
   * Returns statistics about saved bookmarks
   */
  private registerGetStatsTool(): void {
    const cleanup = navigator.modelContext.registerTool({
      name: 'get_bookmark_stats',
      description: 'Get statistics about saved bookmarks',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        const stats = calculateBookmarkStats(this.bookmarksValue);

        const topTagsText =
          stats.topTags.length > 0
            ? stats.topTags.map((t) => `  - ${t.tag}: ${t.count}`).join('\n')
            : '  None';

        return {
          content: [
            {
              type: 'text',
              text: `Bookmark Statistics:\n- Total bookmarks: ${stats.total}\n- Unique tags: ${stats.uniqueTags}\n- Top tags:\n${topTagsText}`,
            },
          ],
        };
      },
    });

    this.toolCleanups.push(cleanup);
  }

  /**
   * Show a notification to the user
   */
  private showNotification(message: string, type: 'success' | 'error'): void {
    const event = new CustomEvent('bookmarks:notification', {
      detail: { message, type },
      bubbles: true,
    });
    this.element.dispatchEvent(event);
  }

  /**
   * Trigger a re-render of the bookmarks list
   */
  private renderBookmarks(): void {
    const event = new CustomEvent('bookmarks:updated', {
      detail: { bookmarks: this.bookmarksValue },
      bubbles: true,
    });
    this.element.dispatchEvent(event);
  }

  /**
   * Called when the bookmarks value changes (for Stimulus value change callback)
   */
  bookmarksValueChanged(): void {
    this.renderBookmarks();
  }
}
