# Angular WebMCP Example

A modern note-taking application demonstrating the **WebMCP API** with Angular 19 services and signals.

## What's New

This example uses the **WebMCP API** with Angular best practices:

- Uses `navigator.modelContext.registerTool()` via an Angular service
- Angular signals for reactive state management
- Automatic cleanup via `DestroyRef`
- Type-safe with TypeScript strict mode

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Then open your browser and install the [MCP-B extension](https://github.com/WebMCP-org/WebMCP) to interact with the tools.

## Available Tools

This example exposes 6 AI-callable tools:

1. **add_note** - Create new notes with title, content, and color
2. **delete_note** - Remove notes by ID
3. **list_notes** - View all notes with optional color filter
4. **search_notes** - Find notes by title or content
5. **toggle_pin** - Pin or unpin notes
6. **get_note_stats** - Get note statistics

## How It Works

WebMCP tools are registered through an Angular service:

```typescript
import { Injectable, inject, DestroyRef } from '@angular/core';
import '@mcp-b/global';

@Injectable({ providedIn: 'root' })
export class WebMCPService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly registeredTools: Array<{ unregister: () => void }> = [];

  initialize(): void {
    const tool = navigator.modelContext.registerTool({
      name: 'add_note',
      description: 'Create a new note',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Note title' },
          content: { type: 'string', description: 'Note content' },
        },
        required: ['title', 'content'],
      },
      execute: async (args) => {
        // Your logic here
        return {
          content: [{ type: 'text', text: 'Note created!' }],
        };
      },
    });

    this.registeredTools.push(tool);

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.registeredTools.forEach((t) => t.unregister());
    });
  }
}
```

Then initialize in your component:

```typescript
@Component({ ... })
export class AppComponent implements OnInit {
  private readonly webmcpService = inject(WebMCPService);

  ngOnInit(): void {
    this.webmcpService.initialize();
  }
}
```

## Key Features

- **Angular Signals**: Reactive state with `signal()` and `computed()`
- **Service-based Architecture**: Clean separation of concerns
- **Automatic Cleanup**: Tools unregister via `DestroyRef`
- **Type Safety**: Full TypeScript strict mode

## Project Structure

```
angular/
├── README.md           # This file
├── package.json        # Dependencies
├── angular.json        # Angular CLI configuration
├── tsconfig.json       # TypeScript configuration
└── src/
    ├── index.html      # HTML entry point
    ├── main.ts         # Bootstrap
    ├── styles.css      # Global styles
    └── app/
        ├── app.component.ts      # Main component
        ├── types/
        │   └── index.ts          # Type definitions
        └── services/
            ├── note.service.ts   # Note state management
            └── webmcp.service.ts # WebMCP tool registration
```

## Learn More

- [WebMCP Documentation](https://docs.mcp-b.ai)
- [Angular Integration Guide](https://docs.mcp-b.ai/frameworks/angular)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT
