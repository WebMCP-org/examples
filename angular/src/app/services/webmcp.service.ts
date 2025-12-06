/**
 * WebMCP Service for Angular
 *
 * This service demonstrates how to integrate WebMCP with Angular.
 * It registers tools that AI agents can call to interact with the app.
 *
 * Key patterns shown:
 * - Using navigator.modelContext.registerTool() for tool registration
 * - Storing tool references for cleanup via DestroyRef
 * - Connecting tools to application state (NoteService)
 *
 * @see https://docs.mcp-b.ai/frameworks/angular
 */

import { Injectable, inject, DestroyRef } from '@angular/core';
import '@mcp-b/global';
import { NoteService } from './note.service';
import type { NoteColor } from '../types';

@Injectable({ providedIn: 'root' })
export class WebMCPService {
  private readonly noteService = inject(NoteService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly registeredTools: Array<{ unregister: () => void }> = [];

  /**
   * Initialize all WebMCP tools.
   * Call this from your root component's ngOnInit.
   */
  initialize(): void {
    this.registerAddNoteTool();
    this.registerDeleteNoteTool();
    this.registerListNotesTool();
    this.registerSearchNotesTool();
    this.registerTogglePinTool();
    this.registerGetStatsTool();

    console.log('WebMCP: 6 tools registered (add_note, delete_note, list_notes, search_notes, toggle_pin, get_note_stats)');

    // Cleanup: unregister all tools when service is destroyed
    this.destroyRef.onDestroy(() => {
      this.registeredTools.forEach((tool) => tool.unregister());
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tool Registration Methods
  // Each method registers one WebMCP tool using navigator.modelContext.registerTool()
  // ─────────────────────────────────────────────────────────────────────────────

  private registerAddNoteTool(): void {
    const tool = navigator.modelContext.registerTool({
      name: 'add_note',
      description: 'Create a new note with title and content',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Note title',
          },
          content: {
            type: 'string',
            description: 'Note content',
          },
          color: {
            type: 'string',
            enum: ['yellow', 'green', 'blue', 'pink', 'purple'],
            description: 'Note color (default: yellow)',
          },
          pinned: {
            type: 'boolean',
            description: 'Whether to pin the note (default: false)',
          },
        },
        required: ['title', 'content'],
      },
      execute: async (args) => {
        const { title, content, color, pinned } = args as {
          title: string;
          content: string;
          color?: NoteColor;
          pinned?: boolean;
        };

        const note = this.noteService.addNote({ title, content, color, pinned });

        return {
          content: [
            {
              type: 'text',
              text: `Created note "${note.title}" with ID ${note.id}`,
            },
          ],
        };
      },
    });

    this.registeredTools.push(tool);
  }

  private registerDeleteNoteTool(): void {
    const tool = navigator.modelContext.registerTool({
      name: 'delete_note',
      description: 'Delete a note by ID',
      inputSchema: {
        type: 'object',
        properties: {
          noteId: {
            type: 'string',
            description: 'ID of the note to delete',
          },
        },
        required: ['noteId'],
      },
      execute: async (args) => {
        const { noteId } = args as { noteId: string };
        const note = this.noteService.deleteNote(noteId);

        if (!note) {
          return {
            content: [{ type: 'text', text: `Note ${noteId} not found` }],
          };
        }

        return {
          content: [{ type: 'text', text: `Deleted note "${note.title}"` }],
        };
      },
    });

    this.registeredTools.push(tool);
  }

  private registerListNotesTool(): void {
    const tool = navigator.modelContext.registerTool({
      name: 'list_notes',
      description: 'Get all notes, optionally filtered by color',
      inputSchema: {
        type: 'object',
        properties: {
          color: {
            type: 'string',
            enum: ['yellow', 'green', 'blue', 'pink', 'purple'],
            description: 'Filter by color (optional)',
          },
        },
      },
      execute: async (args) => {
        const { color } = args as { color?: NoteColor };

        const notes = color
          ? this.noteService.filterByColor(color)
          : this.noteService.getAllNotes();

        if (notes.length === 0) {
          return {
            content: [{ type: 'text', text: 'No notes found' }],
          };
        }

        const noteList = notes
          .map(
            (n) =>
              `- [${n.id}] ${n.pinned ? '(pinned) ' : ''}${n.title}: ${n.content.substring(0, 50)}${n.content.length > 50 ? '...' : ''}`
          )
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${notes.length} note(s):\n${noteList}`,
            },
          ],
        };
      },
    });

    this.registeredTools.push(tool);
  }

  private registerSearchNotesTool(): void {
    const tool = navigator.modelContext.registerTool({
      name: 'search_notes',
      description: 'Search notes by title or content',
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
        const { query } = args as { query: string };
        const notes = this.noteService.searchNotes(query);

        if (notes.length === 0) {
          return {
            content: [{ type: 'text', text: `No notes found matching "${query}"` }],
          };
        }

        const noteList = notes
          .map((n) => `- [${n.id}] ${n.title}: ${n.content.substring(0, 50)}...`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${notes.length} note(s) matching "${query}":\n${noteList}`,
            },
          ],
        };
      },
    });

    this.registeredTools.push(tool);
  }

  private registerTogglePinTool(): void {
    const tool = navigator.modelContext.registerTool({
      name: 'toggle_pin',
      description: 'Toggle the pinned status of a note',
      inputSchema: {
        type: 'object',
        properties: {
          noteId: {
            type: 'string',
            description: 'ID of the note to pin/unpin',
          },
        },
        required: ['noteId'],
      },
      execute: async (args) => {
        const { noteId } = args as { noteId: string };
        const note = this.noteService.togglePin(noteId);

        if (!note) {
          return {
            content: [{ type: 'text', text: `Note ${noteId} not found` }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `Note "${note.title}" is now ${note.pinned ? 'pinned' : 'unpinned'}`,
            },
          ],
        };
      },
    });

    this.registeredTools.push(tool);
  }

  private registerGetStatsTool(): void {
    const tool = navigator.modelContext.registerTool({
      name: 'get_note_stats',
      description: 'Get statistics about all notes',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        const stats = this.noteService.stats();

        const colorBreakdown = Object.entries(stats.byColor)
          .filter(([, count]) => count > 0)
          .map(([color, count]) => `${color}: ${count}`)
          .join(', ');

        return {
          content: [
            {
              type: 'text',
              text: `Notes: ${stats.total} total, ${stats.pinned} pinned\nBy color: ${colorBreakdown || 'none'}`,
            },
          ],
        };
      },
    });

    this.registeredTools.push(tool);
  }
}
