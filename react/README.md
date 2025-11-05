# React WebMCP Example

A modern task management application demonstrating the **new WebMCP API** with React hooks and Zod validation.

## ✨ What's New

This example uses the **simplified WebMCP React hooks** introduced in 2024:

- ✅ Uses `useWebMCP()` hook from `@mcp-b/react-webmcp`
- ✅ Automatic Zod schema validation
- ✅ React state management built-in
- ✅ Type-safe with TypeScript
- ✅ Zero MCP SDK boilerplate

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Then open your browser and install the [MCP-B extension](https://github.com/WebMCP-org/WebMCP) to interact with the tools.

## 🛠️ Available Tools

This example exposes 6 AI-callable tools:

1. **add_task** - Create new tasks with priority and category
2. **complete_task** - Mark tasks as completed
3. **delete_task** - Remove tasks by ID
4. **list_tasks** - Get filtered list of tasks
5. **update_task_priority** - Change task priority level
6. **get_task_stats** - Get task statistics and analytics

## 📖 How It Works

The React hook makes tool registration incredibly simple:

```tsx
import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';

function App() {
  const [tasks, setTasks] = useState([]);

  useWebMCP({
    name: 'add_task',
    description: 'Add a new task to the task manager',
    inputSchema: {
      title: z.string().min(1).describe('Task title'),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
    },
    handler: async ({ title, priority }) => {
      // Your logic here with React state
      setTasks((prev) => [...prev, { title, priority }]);

      return { success: true, message: 'Task added!' };
    },
  });

  return <div>Your React UI</div>;
}
```

## 🎯 Key Features

- **Zod Validation**: Type-safe schema validation with helpful error messages
- **React Integration**: Seamless state updates via hooks
- **Auto Cleanup**: Tools automatically unregister on component unmount
- **Simple Returns**: Return plain objects (no MCP content wrapping needed)

## 🆚 Old API vs New API

**Old API** (deprecated):
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// Complex setup with server, transport, tool registration...
```

**New API** (recommended):
```tsx
import { useWebMCP } from '@mcp-b/react-webmcp';
useWebMCP({ name, inputSchema, handler });
```

## 🔧 How Zod Schemas Work

The `inputSchema` uses Zod objects instead of JSON schema:

```tsx
inputSchema: {
  title: z.string().min(1).describe('Task title'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tags: z.array(z.string()).optional(),
}
```

This provides:
- Automatic type inference
- Runtime validation
- Better error messages
- Type safety throughout

## 📚 Learn More

- [WebMCP Documentation](https://docs.mcp-b.ai)
- [WebMCP Quickstart](https://docs.mcp-b.ai/quickstart)
- [Zod Documentation](https://zod.dev)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 📝 License

MIT
