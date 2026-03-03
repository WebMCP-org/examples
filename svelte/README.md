# Svelte WebMCP Example

A modern notes application demonstrating **Svelte 5 runes** with the **WebMCP API**.

## What's New

This example showcases Svelte 5's reactive primitives with WebMCP:

- Uses `$state` and `$derived` runes for reactive state
- Uses `$effect` for WebMCP tool registration lifecycle
- Uses `$bindable` for two-way binding between components
- TypeScript with strict mode
- Zero framework-specific WebMCP wrapper needed

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Then open your browser and install the [MCP-B extension](https://chromewebstore.google.com/detail/mcp-b-extension/daohopfhkdelnpemnhlekblhnikhdhfa) to interact with the tools.

## Available Tools

This example exposes 7 AI-callable tools:

1. **add_note** - Create new notes with title, content, and color
2. **update_note** - Edit existing note properties
3. **delete_note** - Remove notes by ID
4. **list_notes** - Get all notes with formatted summary
5. **toggle_pin** - Pin or unpin a note
6. **search_notes** - Find notes by title or content
7. **get_stats** - Get notes statistics

## How It Works

Svelte 5 runes make WebMCP integration clean and reactive:

```svelte
<script lang="ts">
import '@mcp-b/global';

// Reactive state with $state rune
let notes = $state<Note[]>([]);

// Derived state automatically updates
const stats = $derived(calculateNoteStats(notes));

// Register tools in $effect for proper lifecycle
$effect(() => {
  const cleanup = navigator.modelContext.registerTool({
    name: 'add_note',
    description: 'Create a new note',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Note title' },
        content: { type: 'string', description: 'Note content' },
      },
      required: ['title'],
    },
    async execute(args) {
      const newNote = createNote(args);
      notes = [...notes, newNote]; // Reactive update
      return {
        content: [{ type: 'text', text: `Note created: ${newNote.id}` }],
      };
    },
  });

  return cleanup; // Cleanup on unmount
});
</script>
```

## Svelte 5 Runes Used

| Rune | Purpose |
|------|---------|
| `$state` | Reactive state for notes array |
| `$derived` | Computed values (sorted notes, stats) |
| `$effect` | Tool registration with cleanup |
| `$props` | Type-safe component props |
| `$bindable` | Two-way binding for state updates |

## Project Structure

```
svelte/
├── src/
│   ├── main.ts              # Entry point
│   ├── App.svelte           # Main component with runes
│   ├── app.css              # Global styles
│   ├── types/
│   │   └── index.ts         # Type definitions
│   ├── lib/
│   │   └── notes.ts         # Pure business logic
│   └── components/
│       ├── WebMCPTools.svelte  # Tool registration
│       ├── NoteList.svelte     # Notes grid display
│       └── NoteStats.svelte    # Statistics display
├── package.json
├── tsconfig.json
├── vite.config.ts
└── svelte.config.js
```

## Key Patterns

### Reactive Tool Updates

When AI calls a tool, Svelte's `$state` automatically triggers UI updates:

```typescript
async execute(args) {
  notes = [...notes, newNote]; // UI updates automatically
  return { content: [{ type: 'text', text: 'Done!' }] };
}
```

### Cleanup on Unmount

Tools are automatically unregistered when components unmount:

```typescript
$effect(() => {
  const cleanup = navigator.modelContext.registerTool({ ... });
  return cleanup; // Called on unmount
});
```

### Bindable State

State can be shared across components using `$bindable`:

```svelte
<!-- Parent -->
<WebMCPTools bind:notes {showNotification} />

<!-- Child -->
let { notes = $bindable() }: Props = $props();
```

## Learn More

- [WebMCP Documentation](https://docs.mcp-b.ai)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [WebMCP Svelte Guide](https://docs.mcp-b.ai/frameworks/svelte)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT
