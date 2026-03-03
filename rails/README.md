# Rails WebMCP Example

A bookmarks management application demonstrating **WebMCP integration with Ruby on Rails** using Stimulus controllers.

## What's New

This example shows how to integrate WebMCP with Rails 7+ using the modern API:

- Uses `navigator.modelContext.registerTool()` with Stimulus controllers
- Follows Rails conventions with `app/javascript/controllers/` structure
- Pure business logic separated into `lib/` modules
- Compatible with both Vite and Rails importmaps

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Then open your browser and install the [MCP-B extension](https://chromewebstore.google.com/detail/mcp-b-extension/daohopfhkdelnpemnhlekblhnikhdhfa) to interact with the tools.

## Available Tools

This example exposes 6 AI-callable tools:

1. **add_bookmark** - Save new bookmarks with title, URL, description, and tags
2. **delete_bookmark** - Remove bookmarks by ID
3. **update_bookmark** - Edit existing bookmark properties
4. **list_bookmarks** - View all bookmarks (optionally filter by tag)
5. **search_bookmarks** - Find bookmarks by title, description, or URL
6. **get_bookmark_stats** - Get statistics about saved bookmarks

## How It Works

The integration uses Stimulus controllers to register WebMCP tools:

```typescript
// app/javascript/controllers/bookmarks_webmcp_controller.ts
import { Controller } from '@hotwired/stimulus';
import '@mcp-b/global';

export default class BookmarksWebmcpController extends Controller {
  connect() {
    navigator.modelContext.registerTool({
      name: 'add_bookmark',
      description: 'Add a new bookmark',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Bookmark title' },
          url: { type: 'string', description: 'URL to bookmark' },
        },
        required: ['title', 'url'],
      },
      execute: async (args) => {
        // Your logic here
        return {
          content: [{ type: 'text', text: 'Bookmark added!' }],
        };
      },
    });
  }
}
```

Then in your view:

```erb
<div data-controller="bookmarks-webmcp"
     data-bookmarks-webmcp-bookmarks-value="<%= @bookmarks.to_json %>">
  <!-- Your UI here -->
</div>
```

## Rails Integration Guide

### Option 1: With Vite (Recommended)

If using [vite_rails](https://vite-ruby.netlify.app/guide/rails.html):

1. Add dependencies:
   ```bash
   pnpm add @mcp-b/global @hotwired/stimulus
   ```

2. Copy the `app/javascript/` directory structure to your Rails app

3. Import in your application entry point:
   ```typescript
   // app/javascript/application.ts
   import '@mcp-b/global';
   import './controllers';
   ```

### Option 2: With Importmaps

If using Rails importmaps:

1. Pin the packages:
   ```bash
   bin/importmap pin @mcp-b/global
   ```

2. Create the Stimulus controller in JavaScript (not TypeScript):
   ```javascript
   // app/javascript/controllers/bookmarks_webmcp_controller.js
   import { Controller } from "@hotwired/stimulus"

   export default class extends Controller {
     connect() {
       navigator.modelContext.registerTool({
         name: 'add_bookmark',
         // ... tool configuration
       });
     }
   }
   ```

3. Register in your manifest:
   ```javascript
   // app/javascript/controllers/index.js
   import { application } from "controllers/application"
   import BookmarksWebmcpController from "./bookmarks_webmcp_controller"
   application.register("bookmarks-webmcp", BookmarksWebmcpController)
   ```

### Option 3: With esbuild

If using jsbundling-rails with esbuild:

1. Add dependencies:
   ```bash
   yarn add @mcp-b/global @hotwired/stimulus
   ```

2. Import in your entry point:
   ```javascript
   // app/javascript/application.js
   import "@mcp-b/global";
   import "./controllers";
   ```

## Project Structure

```
rails/
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html                           # Demo entry point
├── app/
│   ├── assets/
│   │   └── stylesheets/
│   │       └── application.css          # Styles
│   └── javascript/
│       ├── application.ts               # JS entry point
│       ├── controllers/
│       │   ├── index.ts                 # Controller registration
│       │   └── bookmarks_webmcp_controller.ts
│       └── lib/
│           ├── bookmarks.ts             # Pure business logic
│           └── types.ts                 # Type definitions
└── app/
    └── views/
        └── bookmarks/
            └── index.html.erb           # Sample ERB template
```

## Key Patterns

### 1. Separation of Concerns

Business logic is in pure functions (`lib/bookmarks.ts`), making it testable and reusable:

```typescript
// lib/bookmarks.ts
export function createBookmark(data) {
  return {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  };
}
```

### 2. Stimulus Value Binding

Use Stimulus values to manage state:

```typescript
export default class extends Controller {
  static values = {
    bookmarks: { type: Array, default: [] }
  };

  declare bookmarksValue: Bookmark[];

  bookmarksValueChanged() {
    // Re-render when bookmarks change
  }
}
```

### 3. Custom Events for UI Updates

Emit custom events to update the UI:

```typescript
this.element.dispatchEvent(
  new CustomEvent('bookmarks:updated', {
    detail: { bookmarks: this.bookmarksValue },
    bubbles: true,
  })
);
```

### 4. Tool Cleanup

Properly cleanup tools when the controller disconnects:

```typescript
private toolCleanups: Array<{ unregister: () => void }> = [];

connect() {
  const cleanup = navigator.modelContext.registerTool({...});
  this.toolCleanups.push(cleanup);
}

disconnect() {
  this.toolCleanups.forEach((cleanup) => cleanup.unregister());
  this.toolCleanups = [];
}
```

## Sample Rails Files

### Model (for reference)

```ruby
# app/models/bookmark.rb
class Bookmark < ApplicationRecord
  validates :title, presence: true
  validates :url, presence: true, format: URI::DEFAULT_PARSER.make_regexp

  scope :by_tag, ->(tag) { where("? = ANY(tags)", tag) }
  scope :search, ->(query) {
    where("title ILIKE :q OR description ILIKE :q OR url ILIKE :q", q: "%#{query}%")
  }
end
```

### Controller (for reference)

```ruby
# app/controllers/bookmarks_controller.rb
class BookmarksController < ApplicationController
  def index
    @bookmarks = Bookmark.order(created_at: :desc)
  end
end
```

### View (for reference)

```erb
<%# app/views/bookmarks/index.html.erb %>
<div data-controller="bookmarks-webmcp"
     data-bookmarks-webmcp-bookmarks-value="<%= @bookmarks.to_json %>">

  <h1>My Bookmarks</h1>

  <div id="bookmarks-list">
    <% @bookmarks.each do |bookmark| %>
      <%= render bookmark %>
    <% end %>
  </div>
</div>
```

## Learn More

- [WebMCP Documentation](https://docs.mcp-b.ai)
- [Rails Integration Guide](https://docs.mcp-b.ai/frameworks/rails)
- [Stimulus Handbook](https://stimulus.hotwired.dev/handbook/introduction)
- [Vite Ruby](https://vite-ruby.netlify.app/)

## License

MIT
