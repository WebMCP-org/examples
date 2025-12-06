<script lang="ts">
/**
 * WebMCP Tool Registration Component
 *
 * Registers all WebMCP tools for AI interaction with the notes app.
 * Uses $effect to register tools when component mounts and clean up on unmount.
 */

import type { Note, NoteColor, NotificationType } from '../types';
import {
  createNote,
  updateNote,
  removeNote,
  togglePinNote,
  searchNotes,
  calculateNoteStats,
  formatNotesSummary,
} from '../lib/notes';

interface Props {
  notes: Note[];
  showNotification: (message: string, type?: NotificationType) => void;
}

let { notes = $bindable(), showNotification }: Props = $props();

$effect(() => {
  const registrations: Array<{ unregister: () => void }> = [];

  // Tool: Add Note
  registrations.push(navigator.modelContext.registerTool({
    name: 'add_note',
    description: 'Create a new note',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Note title',
        },
        content: {
          type: 'string',
          description: 'Note content (optional)',
        },
        color: {
          type: 'string',
          enum: ['yellow', 'blue', 'green', 'pink', 'purple'],
          description: 'Note color (default: yellow)',
        },
      },
      required: ['title'],
    },
    async execute(args) {
      const { title, content, color } = args as {
        title: string;
        content?: string;
        color?: NoteColor;
      };

      const newNote = createNote({ title, content, color });
      notes = [...notes, newNote];
      showNotification(`Created note: ${title}`, 'success');

      return {
        content: [
          {
            type: 'text',
            text: `Note "${title}" created successfully with ID: ${newNote.id}`,
          },
        ],
      };
    },
  }));

  // Tool: Update Note
  registrations.push(navigator.modelContext.registerTool({
    name: 'update_note',
    description: 'Update an existing note',
    inputSchema: {
      type: 'object',
      properties: {
        noteId: {
          type: 'string',
          description: 'ID of the note to update',
        },
        title: {
          type: 'string',
          description: 'New title (optional)',
        },
        content: {
          type: 'string',
          description: 'New content (optional)',
        },
        color: {
          type: 'string',
          enum: ['yellow', 'blue', 'green', 'pink', 'purple'],
          description: 'New color (optional)',
        },
      },
      required: ['noteId'],
    },
    async execute(args) {
      const { noteId, title, content, color } = args as {
        noteId: string;
        title?: string;
        content?: string;
        color?: NoteColor;
      };

      const updates: Partial<Pick<Note, 'title' | 'content' | 'color'>> = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (color !== undefined) updates.color = color;

      const [updatedNotes, note] = updateNote(notes, noteId, updates);

      if (!note) {
        showNotification('Note not found', 'error');
        return {
          content: [{ type: 'text', text: `Note ${noteId} not found` }],
        };
      }

      notes = updatedNotes;
      showNotification(`Updated: ${note.title}`, 'success');

      return {
        content: [{ type: 'text', text: `Note "${note.title}" updated successfully` }],
      };
    },
  }));

  // Tool: Delete Note
  registrations.push(navigator.modelContext.registerTool({
    name: 'delete_note',
    description: 'Delete a note',
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
    async execute(args) {
      const { noteId } = args as { noteId: string };
      const [updatedNotes, note] = removeNote(notes, noteId);

      if (!note) {
        showNotification('Note not found', 'error');
        return {
          content: [{ type: 'text', text: `Note ${noteId} not found` }],
        };
      }

      notes = updatedNotes;
      showNotification(`Deleted: ${note.title}`, 'success');

      return {
        content: [{ type: 'text', text: `Note "${note.title}" deleted` }],
      };
    },
  }));

  // Tool: List Notes
  registrations.push(navigator.modelContext.registerTool({
    name: 'list_notes',
    description: 'Get all notes',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    async execute() {
      return {
        content: [{ type: 'text', text: formatNotesSummary(notes) }],
      };
    },
  }));

  // Tool: Toggle Pin
  registrations.push(navigator.modelContext.registerTool({
    name: 'toggle_pin',
    description: 'Pin or unpin a note',
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
    async execute(args) {
      const { noteId } = args as { noteId: string };
      const [updatedNotes, note] = togglePinNote(notes, noteId);

      if (!note) {
        showNotification('Note not found', 'error');
        return {
          content: [{ type: 'text', text: `Note ${noteId} not found` }],
        };
      }

      notes = updatedNotes;
      const action = note.pinned ? 'pinned' : 'unpinned';
      showNotification(`${note.title} ${action}`, 'success');

      return {
        content: [{ type: 'text', text: `Note "${note.title}" ${action}` }],
      };
    },
  }));

  // Tool: Search Notes
  registrations.push(navigator.modelContext.registerTool({
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
    async execute(args) {
      const { query } = args as { query: string };
      const results = searchNotes(notes, query);

      if (results.length === 0) {
        return {
          content: [{ type: 'text', text: `No notes found matching "${query}"` }],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Found ${results.length} note(s):\n${formatNotesSummary(results)}`,
          },
        ],
      };
    },
  }));

  // Tool: Get Stats
  registrations.push(navigator.modelContext.registerTool({
    name: 'get_stats',
    description: 'Get notes statistics',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    async execute() {
      const stats = calculateNoteStats(notes);

      return {
        content: [
          {
            type: 'text',
            text: `Notes Statistics:
- Total: ${stats.total}
- Pinned: ${stats.pinned}
- By color: Yellow (${stats.byColor.yellow}), Blue (${stats.byColor.blue}), Green (${stats.byColor.green}), Pink (${stats.byColor.pink}), Purple (${stats.byColor.purple})`,
          },
        ],
      };
    },
  }));

  // Cleanup on unmount
  return () => {
    registrations.forEach((reg) => reg.unregister());
  };
});
</script>
