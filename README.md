<div align="center">

# WebMCP Examples

**Modern example implementations demonstrating Model Context Protocol for Browsers**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-18+-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org)

[Quick Start](#quick-start) • [Examples](#examples) • [API Overview](#api-overview) • [Docs](#documentation)

</div>

---

## What This Does

WebMCP (Model Context Protocol for Browsers) enables AI assistants to interact with web applications through registered tools instead of screen automation. This repository provides production-ready examples using the modern WebMCP API.

**Flow:**
1. Web application registers tools using `navigator.modelContext.registerTool()`
2. AI assistant discovers available tools through the MCP-B browser extension
3. AI invokes tools to interact with the application
4. Application updates in real-time based on AI commands

This pattern works for any web application: e-commerce, task management, data visualization, configuration UIs, and more.

## Quick Start

### Run Existing Examples

```bash
# Clone the repository
git clone https://github.com/WebMCP-org/examples.git
cd examples

# Choose an example
cd vanilla  # or react

# Install and run
pnpm install
pnpm dev
```

### Requirements

- Node.js 18 or higher
- pnpm package manager (or npm/yarn)
- Chrome browser with [MCP-B extension](https://github.com/WebMCP-org/WebMCP)

## Examples

### Vanilla JavaScript Example

**Location:** `/vanilla`

A shopping cart application demonstrating core WebMCP functionality with vanilla TypeScript.

**Features:**
- Uses `navigator.modelContext.registerTool()` - simplified API
- JSON schema validation
- Real-time UI updates
- 5 AI-callable tools (add to cart, remove, get cart, clear, get total)

**Tech:** Vite, TypeScript, `@mcp-b/global`

[→ Documentation](./vanilla/README.md)

---

### React Example

**Location:** `/react`

A task management application showcasing React integration with the `useWebMCP()` hook.

**Features:**
- Uses `useWebMCP()` hook from `@mcp-b/react-webmcp`
- Zod schema validation with type safety
- Automatic cleanup on component unmount
- 6 AI-callable tools (task CRUD operations + stats)
- Responsive UI with real-time updates

**Tech:** React 18, TypeScript, Vite, Zod, `@mcp-b/react-webmcp`, `@mcp-b/global`

[→ Documentation](./react/README.md)

---

### Legacy Examples (Deprecated)

**Location:** `/relegated`

These examples use the older MCP SDK API and are kept for reference only. Do not use these as starting points for new projects. They use the legacy `@modelcontextprotocol/sdk` with `McpServer` and `TabServerTransport`, requiring significantly more boilerplate.

**Deprecated examples:**
- `vanilla-ts` - Original TypeScript example
- `login` - Authentication example
- `script-tag` - Legacy implementation
- `mcp-b-startup` - Complex React Flow workspace
- `extension-connector` - Chrome extension
- `reactFlowVoiceAgent` - Voice agent

[→ Legacy Documentation](./relegated/README.md)

## API Overview

### Vanilla JavaScript API

The modern WebMCP API provides a simple way to register tools:

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

For React applications, use the `useWebMCP` hook for automatic lifecycle management:

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

### Installation Methods

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

## Architecture

### API Comparison: New vs Legacy

| Feature | Modern API | Legacy API (Deprecated) |
|---------|-----------|------------------------|
| **Installation** | `@mcp-b/global` or `@mcp-b/react-webmcp` | `@modelcontextprotocol/sdk` + `@mcp-b/transports` |
| **Setup** | Single import | Server + Transport + Connection |
| **Vanilla API** | `navigator.modelContext.registerTool()` | `new McpServer()` + complex setup |
| **React API** | `useWebMCP()` hook | Manual tool registration |
| **Validation** | JSON schema or Zod | Complex Zod with custom wrapper |
| **Return Format** | Simple objects (React) or MCP format (Vanilla) | Always MCP content format |
| **Boilerplate** | Minimal | Significant |
| **Learning Curve** | Easy | Moderate to Hard |

### How It Works

1. Install the MCP-B browser extension
2. Run one of the example projects (`pnpm dev`)
3. Open the extension to discover available tools
4. Use AI (ChatGPT, Claude, etc.) to interact with your website's tools
5. Watch the page update in real-time as AI calls your tools

WebMCP enables AI assistants to interact with websites through APIs instead of screen automation, providing more reliable and powerful integration.

## Commands

```bash
# Development (per example)
cd vanilla  # or react
pnpm dev                    # Run development server
pnpm build                  # Build for production
pnpm preview                # Preview production build
```

## Documentation

### Getting Started
- [AGENTS.md](./AGENTS.md) - Navigation hub for AI agents
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development standards and guidelines
- [CHANGELOG.md](./CHANGELOG.md) - Version history and changes

### Community
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community standards

### Example Documentation
- [Vanilla Example](./vanilla/README.md) - Vanilla JavaScript implementation
- [React Example](./react/README.md) - React with hooks implementation
- [Legacy Examples](./relegated/README.md) - Deprecated implementations

## Tech Stack

- **Package Manager:** pnpm
- **Build Tool:** Vite 6
- **Language:** TypeScript 5.6
- **WebMCP Core:** @mcp-b/global
- **React Integration:** @mcp-b/react-webmcp
- **Validation:** JSON Schema, Zod

## Contributing

Fork, experiment, report issues, submit improvements.

**Before contributing:**
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) for development standards and best practices
- Check [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for community guidelines
- Review existing examples to understand patterns

**For AI Agents:**
- Start with [AGENTS.md](./AGENTS.md) for quick navigation
- Follow TypeScript strict mode and modern WebMCP API patterns
- Test all changes with the MCP-B Chrome Extension

**Quick contribution steps:**
1. Fork the repository
2. Create a feature branch
3. Make your changes following [CONTRIBUTING.md](./CONTRIBUTING.md)
4. Test thoroughly (typecheck, lint, build, manual testing)
5. Submit a pull request

## Resources

### MCP-B (WebMCP / Bidirectional Tools)

**Documentation:**
- [MCP-B Documentation](https://docs.mcp-b.ai/introduction) - Getting started with WebMCP
- [Quick Start](https://docs.mcp-b.ai/quickstart) - Get WebMCP running in minutes
- [Core Concepts](https://docs.mcp-b.ai/concepts) - Architecture and system design
- [Examples](https://docs.mcp-b.ai/examples) - Ready-to-use implementations

**NPM Packages:**
- [`@mcp-b/react-webmcp`](https://www.npmjs.com/package/@mcp-b/react-webmcp) - React hooks for WebMCP ([docs](https://docs.mcp-b.ai/packages/react-webmcp))
- [`@mcp-b/transports`](https://www.npmjs.com/package/@mcp-b/transports) - Transport layer implementations ([docs](https://docs.mcp-b.ai/packages/transports))
- [`@mcp-b/core`](https://www.npmjs.com/package/@mcp-b/core) - Core WebMCP functionality ([docs](https://docs.mcp-b.ai/packages/core))
- [`@mcp-b/global`](https://www.npmjs.com/package/@mcp-b/global) - Global WebMCP polyfill ([docs](https://docs.mcp-b.ai/packages/global))
- [All Packages](https://github.com/WebMCP-org/npm-packages) - Complete package repository

**Live Demos & Tools:**
- [mcp-b.ai](https://mcp-b.ai) - Interactive examples
- [MCP-B Chrome Extension](https://chromewebstore.google.com/detail/mcp-b/fkhbffeojcfadbkpldmbjlbfocgknjlj) - Test tools in your browser

**Specification:**
- [WebMCP Specification](https://github.com/webmachinelearning/webmcp) - W3C Web Machine Learning Community Group
- [WebMCP Explainer](https://github.com/webmachinelearning/webmcp/blob/main/docs/explainer.md) - Technical proposal and API details

### Model Context Protocol
- [MCP Documentation](https://modelcontextprotocol.io/) - Official protocol documentation
- [MCP Specification](https://spec.modelcontextprotocol.io/) - Technical specification
- [MCP GitHub](https://github.com/modelcontextprotocol/modelcontextprotocol) - Specification repository

### Development Tools
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vite.dev/) - Next generation frontend tooling
- [Zod](https://zod.dev/) - TypeScript-first schema validation

## License

MIT

---

Built by the WebMCP community
