# Changelog

All notable changes to the WebMCP Examples repository will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- CONTRIBUTING.md with development standards and best practices
- AGENTS.md navigation hub for AI agents
- CODE_OF_CONDUCT.md with community standards
- CHANGELOG.md for tracking project changes
- .nvmrc for Node.js version specification
- GitHub issue templates (bug report, feature request)
- GitHub pull request template
- GitHub CI workflow for automated quality checks

## [2.0.0] - 2024-11-04

### Added
- Modern WebMCP examples using new simplified API
- **Vanilla TypeScript example** (`/vanilla`)
  - Shopping cart application
  - Uses `@mcp-b/global` package
  - Demonstrates `navigator.modelContext.registerTool()` API
  - 5 AI-callable tools for cart management
- **React TypeScript example** (`/react`)
  - Task management application
  - Uses `@mcp-b/react-webmcp` package
  - Demonstrates `useWebMCP()` hook
  - 6 AI-callable tools for task CRUD operations
  - Zod schema validation
- Updated README with clear distinction between new and legacy APIs
- API comparison table showing new vs deprecated approaches

### Changed
- Moved legacy examples to `/relegated` directory
- Updated documentation to emphasize modern API usage
- Reorganized repository structure for clarity

### Deprecated
- Legacy examples in `/relegated` now marked as deprecated
- Old MCP SDK approach (`@modelcontextprotocol/sdk`) no longer recommended
- `McpServer` and `TabServerTransport` patterns obsolete

## [1.0.0] - 2024-01-15

### Added
- Initial release of WebMCP examples
- Examples using `@modelcontextprotocol/sdk`
- `vanilla-ts` - TypeScript example
- `login` - Authentication example
- `script-tag` - Script tag implementation
- `mcp-b-startup` - Complex React Flow workspace
- `extension-connector` - Chrome extension integration
- `reactFlowVoiceAgent` - Voice agent example
- Basic documentation and setup instructions

## Technology Stack

### Current (v2.0.0+)
- **Core**: `@mcp-b/global`, `@mcp-b/react-webmcp`
- **Framework**: React 18+, TypeScript 5+
- **Build**: Vite 7+
- **Validation**: Zod (for React examples)
- **Package Manager**: pnpm

### Legacy (v1.0.0, deprecated)
- **Core**: `@modelcontextprotocol/sdk`, `@mcp-b/transports`
- **Build**: Vite, TypeScript
- **Additional**: React Flow, various UI libraries

## Migration Guide

### From v1.0.0 to v2.0.0

If you're using examples from `/relegated`, consider migrating to the modern API:

**Before (Legacy API):**
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TabServerTransport } from '@mcp-b/transports';

const server = new McpServer({ name: 'my-app' });
const transport = new TabServerTransport();
await server.connect(transport);

server.tool('my_tool', 'Description', schema, handler);
```

**After (Modern API):**
```typescript
import '@mcp-b/global';

navigator.modelContext.registerTool({
  name: 'my_tool',
  description: 'Description',
  inputSchema: schema,
  execute: handler
});
```

For React applications:
```tsx
import { useWebMCP } from '@mcp-b/react-webmcp';

useWebMCP({
  name: 'my_tool',
  description: 'Description',
  inputSchema: zodSchema,
  handler: async (params) => { /* ... */ }
});
```

See the [vanilla](./vanilla/) and [react](./react/) examples for complete implementations.

## Upcoming

### Planned for Future Releases
- Additional example applications
- Vue.js example using WebMCP
- Svelte example using WebMCP
- Advanced patterns (multi-tool coordination, state persistence)
- Testing guide for WebMCP tools
- Performance optimization examples
- SSR/SSG compatibility examples

## Links

- [WebMCP Documentation](https://docs.mcp-b.ai)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [GitHub Repository](https://github.com/WebMCP-org/examples)

---

For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).
