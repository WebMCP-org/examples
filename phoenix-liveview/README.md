# Phoenix LiveView WebMCP Example

A minimal Phoenix LiveView application demonstrating **WebMCP integration** with server-side state management.

## What This Demonstrates

This example shows how to integrate WebMCP with Phoenix LiveView using JavaScript hooks:

- WebMCP tools registered via LiveView hooks
- Bidirectional communication: AI -> JavaScript -> LiveView -> Server
- Real-time state synchronization
- Server-side state management with client-side AI access

## Quick Start

### Prerequisites

- Elixir 1.14+ and Erlang/OTP 25+
- Node.js 18+
- A WebMCP-compatible client (browser extension, AI agent, etc.)

### Installation

```bash
# Install Elixir dependencies
mix deps.get

# Install Node.js dependencies and build assets
mix setup

# Start the development server
mix phx.server
```

Open [http://localhost:4000](http://localhost:4000) and connect your WebMCP client to discover the available tools.

## Available Tools

This example exposes 6 AI-callable tools:

| Tool | Description |
|------|-------------|
| `increment_counter` | Increase the counter by 1 |
| `decrement_counter` | Decrease the counter by 1 (minimum 0) |
| `set_counter` | Set the counter to a specific value |
| `add_item` | Add a new item to the list |
| `remove_item` | Remove an item by ID |
| `get_state` | Get current counter and items state |

## How It Works

### Architecture

```
AI Agent / WebMCP Client
           |
           v
  navigator.modelContext (WebMCP API)
           |
           v
  LiveView Hook (JavaScript)
           |
           v (pushEvent)
  LiveView (Elixir)
           |
           v
     Server State
```

### Key Components

**1. LiveView Hook (`assets/js/app.js`)**

The WebMCP hook registers tools and communicates with LiveView:

```javascript
const WebMCPHook = {
  mounted() {
    // Register tool that calls LiveView
    navigator.modelContext.registerTool({
      name: "increment_counter",
      description: "Increase the counter by 1",
      inputSchema: { type: "object", properties: {} },
      async execute() {
        this.pushEvent("increment", {});
        return {
          content: [{ type: "text", text: "Counter incremented" }]
        };
      }
    });
  }
};
```

**2. LiveView (`lib/webmcp_demo_web/live/counter_live.ex`)**

Handles events from the hook and manages state:

```elixir
def handle_event("increment", _params, socket) do
  new_count = socket.assigns.count + 1
  {:noreply, assign(socket, :count, new_count)}
end
```

**3. Template**

Connects the hook to the LiveView element:

```heex
<div id="webmcp-app" phx-hook="WebMCP">
  <!-- UI content -->
</div>
```

## Project Structure

```
phoenix-liveview/
├── assets/
│   ├── js/
│   │   └── app.js           # WebMCP hook + LiveSocket setup
│   ├── css/
│   │   └── app.css          # Styles
│   ├── package.json         # JS dependencies (@mcp-b/global)
│   └── tailwind.config.js
├── config/                   # Phoenix configuration
├── lib/
│   ├── webmcp_demo/
│   │   └── application.ex   # OTP application
│   └── webmcp_demo_web/
│       ├── components/      # Phoenix components
│       ├── live/
│       │   └── counter_live.ex  # Main LiveView
│       ├── endpoint.ex
│       └── router.ex
├── mix.exs                   # Elixir dependencies
├── package.json              # npm scripts
└── README.md
```

## Key Patterns

### Registering Tools in Hooks

```javascript
// In your LiveView hook
mounted() {
  const self = this;

  navigator.modelContext.registerTool({
    name: "my_tool",
    description: "What it does",
    inputSchema: {
      type: "object",
      properties: {
        param: { type: "string", description: "Parameter" }
      },
      required: ["param"]
    },
    async execute(args) {
      // Push event to LiveView
      self.pushEvent("my_event", { value: args.param });
      return {
        content: [{ type: "text", text: "Done" }]
      };
    }
  });
}
```

### Getting Data Back from LiveView

Use `pushEvent` with a callback for request-response patterns:

```javascript
async execute() {
  return new Promise((resolve) => {
    self.pushEvent("get_data", {}, (reply) => {
      resolve({
        content: [{ type: "text", text: JSON.stringify(reply) }]
      });
    });
  });
}
```

With the LiveView handler using `{:reply, ...}`:

```elixir
def handle_event("get_data", _params, socket) do
  {:reply, {:ok, socket.assigns.data}, socket}
end
```

### Tool Cleanup

Always clean up tools when the hook is destroyed:

```javascript
const WebMCPHook = {
  cleanupFns: [],

  mounted() {
    const cleanup = navigator.modelContext.registerTool({...});
    this.cleanupFns.push(cleanup);
  },

  destroyed() {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
  }
};
```

## Comparison: Phoenix vs Other Frameworks

| Feature | Phoenix LiveView | React | Vanilla JS |
|---------|-----------------|-------|------------|
| State Location | Server | Client | Client |
| State Sync | WebSocket (automatic) | Manual | Manual |
| Tool Registration | LiveView Hook | useWebMCP hook | Direct API |
| Real-time Updates | Built-in | Manual | Manual |
| SEO | Excellent | Requires SSR | N/A |

## Development

```bash
# Start development server with live reload
mix phx.server

# Or run inside IEx for debugging
iex -S mix phx.server

# Format code
mix format

# Check types (if using dialyzer)
mix dialyzer
```

## Learn More

### WebMCP
- [WebMCP Documentation](https://docs.mcp-b.ai)
- [WebMCP Quick Start](https://docs.mcp-b.ai/quickstart)
- [@mcp-b/global Package](https://docs.mcp-b.ai/packages/global)

### Phoenix LiveView
- [Phoenix LiveView Docs](https://hexdocs.pm/phoenix_live_view)
- [LiveView JavaScript Interop](https://hexdocs.pm/phoenix_live_view/js-interop.html)
- [Phoenix Framework](https://phoenixframework.org)

### Model Context Protocol
- [MCP Documentation](https://modelcontextprotocol.io/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## License

MIT
