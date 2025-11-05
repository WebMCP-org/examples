# WebMCP Examples

Modern example implementations demonstrating how to use **WebMCP** (Model Context Protocol for Browsers) with the latest simplified APIs.

## 🚀 Quick Start

Each example is self-contained with its own dependencies. To run an example:

```bash
cd vanilla  # or react
pnpm install
pnpm dev
```

## ✨ Current Examples (New API)

These examples use the **modern WebMCP API** introduced in 2024 - simple, clean, and minimal boilerplate.

### 🟨 vanilla - Vanilla JavaScript/TypeScript Example

**Location:** `/vanilla`

A shopping cart application demonstrating the core WebMCP API with vanilla TypeScript.

**Features:**
- Uses `navigator.modelContext.registerTool()` - the new simplified API
- JSON schema validation
- Real-time UI updates
- 5 AI-callable tools (add to cart, remove, get cart, clear, get total)

**Key Technologies:**
- `@mcp-b/global` - Core WebMCP library
- Vite + TypeScript
- Zero MCP SDK dependencies

**Learn:** Perfect starting point for understanding WebMCP fundamentals.

---

### ⚛️ react - React Hooks Example

**Location:** `/react`

A task management application showcasing React integration with the `useWebMCP()` hook.

**Features:**
- Uses `useWebMCP()` hook from `@mcp-b/react-webmcp`
- Zod schema validation with type safety
- Automatic cleanup on unmount
- 6 AI-callable tools (task CRUD operations + stats)
- Beautiful responsive UI with real-time updates

**Key Technologies:**
- `@mcp-b/react-webmcp` - React hooks for WebMCP
- `@mcp-b/global` - Core library
- Zod - Type-safe validation
- React 18 + TypeScript + Vite

**Learn:** How to integrate WebMCP with React applications using modern hooks.

---

## 🔧 API Overview

### Vanilla JavaScript API

```typescript
import '@mcp-b/global';

navigator.modelContext.registerTool({
  name: 'my_tool',
  description: 'What this tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: 'Parameter description' }
    },
    required: ['param']
  },
  async execute(args) {
    // Your logic here
    return {
      content: [{ type: 'text', text: 'Result' }]
    };
  }
});
```

### React Hooks API

```tsx
import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';

function App() {
  useWebMCP({
    name: 'my_tool',
    description: 'What this tool does',
    inputSchema: {
      param: z.string().describe('Parameter description')
    },
    handler: async ({ param }) => {
      // Your logic here with React state
      return { success: true, result: 'Done!' };
    }
  });

  return <div>Your UI</div>;
}
```

---

## 📦 Installation Methods

**For build-based projects (recommended):**

```bash
# Vanilla JavaScript/TypeScript
pnpm add @mcp-b/global

# React
pnpm add @mcp-b/react-webmcp @mcp-b/global zod
```

**For no-build projects:**

```html
<script src="https://unpkg.com/@mcp-b/global@latest/dist/index.iife.js"></script>
```

---

## 📚 Legacy Examples (Deprecated)

**Location:** `/relegated`

These examples use the older MCP SDK API and are kept for reference only.

**⚠️ Warning:** Do not use these as starting points for new projects. They use the legacy `@modelcontextprotocol/sdk` with `McpServer` and `TabServerTransport`, which requires significantly more boilerplate.

**What's inside:**
- `vanilla-ts` - Original TypeScript example
- `login` - Authentication example
- `script-tag` - Legacy implementation
- `mcp-b-startup` - Complex React Flow workspace
- `extension-connector` - Chrome extension
- `reactFlowVoiceAgent` - Voice agent

See `/relegated/README.md` for more details.

---

## 🎯 Key Differences: New vs Old API

| Feature | New API | Old API (Deprecated) |
|---------|---------|---------------------|
| **Installation** | `@mcp-b/global` or `@mcp-b/react-webmcp` | `@modelcontextprotocol/sdk` + `@mcp-b/transports` |
| **Setup** | Single import | Server + Transport + Connection |
| **Vanilla API** | `navigator.modelContext.registerTool()` | `new McpServer()` + complex setup |
| **React API** | `useWebMCP()` hook | Manual tool registration |
| **Validation** | JSON schema or Zod | Complex Zod with custom wrapper |
| **Return Format** | Simple objects (React) or MCP format (Vanilla) | Always MCP content format |
| **Boilerplate** | Minimal | Significant |
| **Learning Curve** | Easy | Moderate to Hard |

---

## 🛠️ Prerequisites

- **Node.js** 18 or higher
- **pnpm** package manager (or npm/yarn)
- **Chrome browser** with [MCP-B extension](https://github.com/WebMCP-org/WebMCP)

---

## 🤖 How It Works

1. Install the MCP-B browser extension
2. Run one of the example projects (`pnpm dev`)
3. Open the extension to discover available tools
4. Use AI (ChatGPT, Claude, etc.) to interact with your website's tools
5. Watch the page update in real-time as AI calls your tools

WebMCP enables AI assistants to interact with websites through **APIs instead of screen automation**, providing a more reliable and powerful integration.

---

## 📖 Documentation

- [WebMCP Documentation](https://docs.mcp-b.ai)
- [Quickstart Guide](https://docs.mcp-b.ai/quickstart)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Main Repository](https://github.com/WebMCP-org/WebMCP)

---

## 🤝 Contributing

These examples are part of the WebMCP project. Contributions are welcome!

---

## 📄 License

MIT

---

**Built with ❤️ by the WebMCP community**
