## FOR AI AGENTS

Welcome! This document helps you navigate the WebMCP Examples repository efficiently.

**Start here:** [CONTRIBUTING.md](./CONTRIBUTING.md) - Development standards and best practices

## Quick Navigation

### Project Overview
- **[README.md](./README.md)** - What these examples demonstrate, quick start guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute new examples or improve existing ones

### Current Examples (Modern WebMCP API)

#### Vanilla JavaScript/TypeScript
- **[vanilla/README.md](./vanilla/README.md)** - Shopping cart example using `@mcp-b/global`
- **Location**: `/vanilla`
- **Key file**: `vanilla/src/main.ts` - Entry point with WebMCP tool registration
- **API used**: `navigator.modelContext.registerTool()`

#### React + TypeScript
- **[react/README.md](./react/README.md)** - Task manager using `@mcp-b/react-webmcp`
- **Location**: `/react`
- **Key file**: `react/src/App.tsx` - React component with `useWebMCP` hooks
- **API used**: `useWebMCP()` hook

### Legacy Examples (Deprecated - DO NOT USE)
- **[relegated/README.md](./relegated/README.md)** - Old examples using deprecated MCP SDK
- **Warning**: These use the legacy `@modelcontextprotocol/sdk` API
- **Status**: Kept for reference only, not recommended for new projects

### Documentation
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** - Community standards
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes

## Common Development Tasks

### Running an Example

```bash
# Navigate to the example
cd vanilla  # or react

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Adding a New Example

1. **Check existing examples** first to avoid duplication
2. **Choose the right location**:
   - `/vanilla` for pure TypeScript/JavaScript
   - `/react` for React-based examples
3. **Create self-contained directory** with:
   - `README.md` - Documentation
   - `package.json` - Dependencies
   - `src/` - Source code
   - `vite.config.ts` - Build config
4. **Use modern WebMCP API**:
   - Vanilla: `@mcp-b/global` package
   - React: `@mcp-b/react-webmcp` package
5. **Follow patterns** in existing examples
6. **Document thoroughly** - explain what WebMCP concepts are demonstrated

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Code Quality

```bash
# Type-check
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build
```

## Key Patterns

### Modern WebMCP Tool Registration

**Vanilla TypeScript:**
```typescript
import '@mcp-b/global';

navigator.modelContext.registerTool({
  name: 'my_tool',
  description: 'What this tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: 'Description' }
    }
  },
  async execute(args) {
    return {
      content: [{ type: 'text', text: 'Result' }]
    };
  }
});
```

**React with Hooks:**
```tsx
import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';

useWebMCP({
  name: 'my_tool',
  description: 'What this tool does',
  inputSchema: {
    param: z.string().describe('Description')
  },
  handler: async ({ param }) => {
    return { success: true };
  }
});
```

## File Locations

### Example Structure

Each example follows this structure:
```
example-name/
├── README.md          # What it demonstrates, how to run
├── package.json       # Dependencies (@mcp-b/* packages)
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript config
├── index.html         # HTML entry point
└── src/
    ├── main.ts(x)     # Application entry point
    └── ...            # Additional source files
```

### Key Files by Example

**Vanilla Example:**
- Entry: `vanilla/src/main.ts`
- Config: `vanilla/vite.config.ts`
- Types: `vanilla/src/types.ts`

**React Example:**
- Entry: `react/src/main.tsx`
- Root: `react/src/App.tsx`
- Config: `react/vite.config.ts`

## WebMCP Package Documentation

- **[@mcp-b/global](https://docs.mcp-b.ai/packages/global)** - Core WebMCP polyfill for vanilla JS
- **[@mcp-b/react-webmcp](https://docs.mcp-b.ai/packages/react-webmcp)** - React hooks for WebMCP
- **[@mcp-b/transports](https://docs.mcp-b.ai/packages/transports)** - Transport layer (used internally)
- **[@mcp-b/core](https://docs.mcp-b.ai/packages/core)** - Core functionality (used internally)

## External Resources

### WebMCP Documentation
- [WebMCP Introduction](https://docs.mcp-b.ai/introduction) - What is WebMCP
- [Quick Start](https://docs.mcp-b.ai/quickstart) - Get started in 2 minutes
- [Concepts](https://docs.mcp-b.ai/concepts) - Core concepts explained
- [Examples](https://docs.mcp-b.ai/examples) - Additional examples

### MCP Resources
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP overview
- [MCP Specification](https://spec.modelcontextprotocol.io/) - Protocol spec
- [MCP UI Resources](https://mcpui.dev/guide/introduction) - UI resource types

### Tools
- [MCP-B Chrome Extension](https://chromewebstore.google.com/detail/mcp-b/fkhbffeojcfadbkpldmbjlbfocgknjlj) - Required for testing

## Prerequisites

- **Node.js**: 18 or higher (see `.nvmrc`)
- **pnpm**: Package manager
- **MCP-B Extension**: Chrome extension for testing WebMCP tools
- **Browser**: Chrome or Chromium-based browser

## Workflow for AI Agents

When working on this repository:

1. **Understand the context**:
   - Read [README.md](./README.md) for project overview
   - Check [CONTRIBUTING.md](./CONTRIBUTING.md) for standards
   - Review existing examples for patterns

2. **Make changes**:
   - Follow TypeScript strict mode
   - Use modern WebMCP API (never deprecated SDK)
   - Document all public APIs with JSDoc
   - Keep code self-documenting

3. **Quality checks**:
   - Run `pnpm typecheck` - must pass
   - Run `pnpm lint` - must pass
   - Run `pnpm build` - must succeed
   - Test manually with MCP-B extension

4. **Documentation**:
   - Update README if changing functionality
   - Add comments explaining WebMCP concepts
   - Include examples in JSDoc

## Important Notes

- **Never use deprecated APIs** from `/relegated` - these are for reference only
- **Always use the latest packages**: `@mcp-b/global` and `@mcp-b/react-webmcp`
- **Follow the single source of truth principle** - don't duplicate information
- **Keep examples simple** - focus on demonstrating one concept clearly
- **Test with the extension** - every example must work with MCP-B Chrome Extension

## Questions?

- Check [docs.mcp-b.ai](https://docs.mcp-b.ai) for WebMCP documentation
- Review existing examples for patterns
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines
- Open a GitHub issue if you need help

---

**Remember**: This file is a navigation hub. Detailed information lives in linked documentation to maintain a single source of truth.
