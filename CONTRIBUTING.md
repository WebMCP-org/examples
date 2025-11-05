# Contributing to WebMCP Examples

Thank you for your interest in contributing to the WebMCP Examples repository! This guide outlines development standards and best practices.

## Core Principles

### 1. Type Safety First

**Always leverage TypeScript's type system fully:**

✅ **Good:**
```typescript
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

function addTask(task: Task): void {
  // Implementation
}
```

❌ **Bad:**
```typescript
function addTask(task: any) {
  // Implementation
}
```

**Guidelines:**
- Never use `any` - use `unknown` if type is truly unknown, then narrow it
- Prefer union types over enums for string constants
- Use strict TypeScript settings
- Leverage type inference but annotate function signatures
- Use Zod for runtime validation with WebMCP schemas

### 2. Single Source of Truth

**Never duplicate information - always reference the canonical source.**

✅ **Good:**
```typescript
/**
 * WebMCP tool registration
 * See: https://docs.mcp-b.ai/packages/react-webmcp
 */
export const TOOLS = ['add_to_cart', 'remove_from_cart'] as const;
```

❌ **Bad:**
```typescript
// Duplicating tool definitions that exist elsewhere
export const TOOLS = ['add_to_cart', 'remove_from_cart'];
```

### 3. Clean, Self-Documenting Code

**Code should be self-documenting. Use JSDoc for public APIs.**

✅ **Good:**
```typescript
/**
 * Register a WebMCP tool that adds items to the shopping cart
 *
 * @param item - Product to add to cart
 * @returns Tool result with updated cart state
 *
 * @example
 * ```ts
 * useWebMCP({
 *   name: "add_to_cart",
 *   description: "Add item to shopping cart",
 *   inputSchema: { productId: z.string() },
 *   handler: async ({ productId }) => ({ success: true })
 * });
 * ```
 */
```

## Project Structure

Each example should be self-contained:

```
examples/
├── vanilla/          # Vanilla TypeScript examples
│   ├── src/
│   ├── package.json
│   └── README.md
├── react/            # React + TypeScript examples
│   ├── src/
│   ├── package.json
│   └── README.md
└── relegated/        # Legacy examples (deprecated)
```

## Adding New Examples

**Before creating a new example:**

1. Check if it fits better as an enhancement to an existing example
2. Ensure it demonstrates a unique WebMCP use case
3. Review existing patterns in `/vanilla` and `/react` directories

**When creating a new example:**

1. Create a dedicated directory under the appropriate category
2. Include a comprehensive README.md explaining:
   - What the example demonstrates
   - How to run it
   - Key WebMCP concepts used
   - Prerequisites
3. Use the modern WebMCP API (`@mcp-b/global` or `@mcp-b/react-webmcp`)
4. Never use deprecated APIs from `/relegated`
5. Include clear comments explaining WebMCP-specific code
6. Add JSDoc to all exported functions and components

**Example structure:**
```
new-example/
├── README.md           # What it does, how to run
├── package.json        # Dependencies
├── vite.config.ts      # Build configuration
├── tsconfig.json       # TypeScript config
├── index.html          # Entry point (for Vite)
└── src/
    ├── main.ts(x)      # Application entry
    └── ...             # Other source files
```

## Code Style

### WebMCP Tool Registration

**Vanilla JavaScript/TypeScript:**
```typescript
import '@mcp-b/global';

navigator.modelContext.registerTool({
  name: 'my_tool',
  description: 'Clear description of what this does',
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

**React with Hooks:**
```tsx
import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';

function App() {
  useWebMCP({
    name: 'my_tool',
    description: 'Clear description of what this does',
    inputSchema: {
      param: z.string().describe('Parameter description')
    },
    handler: async ({ param }) => {
      // Type-safe params from Zod schema
      // Can access React state here
      return { success: true, result: 'Done!' };
    }
  });

  return <div>Your UI</div>;
}
```

### Error Handling

Always handle errors gracefully in WebMCP tools:

```typescript
useWebMCP({
  name: 'my_tool',
  handler: async (params) => {
    try {
      const result = await performOperation(params);
      return { success: true, data: result };
    } catch (error) {
      console.error('Tool execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});
```

## Development Workflow

### Setting Up

```bash
# Clone the repository
git clone https://github.com/WebMCP-org/examples.git
cd examples

# Navigate to the example you want to work on
cd vanilla  # or react

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Before Submitting Changes

```bash
# Type-check your code
pnpm typecheck

# Lint your code
pnpm lint

# Build to ensure no errors
pnpm build
```

### Testing

Manual testing is required:
1. Install the [MCP-B Chrome Extension](https://chromewebstore.google.com/detail/mcp-b/fkhbffeojcfadbkpldmbjlbfocgknjlj)
2. Run your example (`pnpm dev`)
3. Open the extension and verify tools are registered
4. Test each tool through the AI interface
5. Verify UI updates correctly
6. Test error cases

## Documentation

### README Requirements

Each example must have a README.md with:

1. **Title and description** - What it demonstrates
2. **Features** - Key capabilities shown
3. **Prerequisites** - Required tools/extensions
4. **Installation** - How to install dependencies
5. **Usage** - How to run and use the example
6. **WebMCP Integration** - Explanation of WebMCP usage
7. **Key Files** - Brief overview of important files
8. **Learn More** - Links to relevant documentation

### Code Comments

- Use JSDoc for all exported functions, types, and components
- Include `@param`, `@returns`, and `@example` tags
- Add inline comments only for complex logic that needs explanation
- Keep comments concise and up-to-date

## Pull Request Process

1. **Fork the repository** and create a branch from `main`
2. **Make your changes** following the guidelines above
3. **Test thoroughly** using the MCP-B extension
4. **Update documentation** if you're changing functionality
5. **Run quality checks**: `pnpm typecheck && pnpm lint && pnpm build`
6. **Submit a pull request** with:
   - Clear description of changes
   - Why the change is needed
   - How to test it
   - Screenshots/demos if applicable

## Common Patterns

### State Management in React Examples

```tsx
function App() {
  const [items, setItems] = useState<Item[]>([]);

  // Register tools that modify state
  useWebMCP({
    name: 'add_item',
    handler: async ({ item }) => {
      setItems(prev => [...prev, item]);
      return { success: true, count: items.length + 1 };
    }
  });

  return <ItemList items={items} />;
}
```

### JSON Schema vs Zod

- **Vanilla examples**: Use JSON Schema for `inputSchema`
- **React examples**: Use Zod for type-safe validation
- Always include descriptions for all parameters

### Tool Naming

- Use lowercase with underscores: `add_to_cart`, not `addToCart`
- Be descriptive: `get_cart_total`, not `get_total`
- Follow MCP naming conventions

## Resources

### WebMCP Documentation
- [WebMCP Documentation](https://docs.mcp-b.ai)
- [Quick Start Guide](https://docs.mcp-b.ai/quickstart)
- [React WebMCP Package](https://docs.mcp-b.ai/packages/react-webmcp)
- [Core Package](https://docs.mcp-b.ai/packages/core)

### MCP Resources
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## Getting Help

- **Documentation**: Check [docs.mcp-b.ai](https://docs.mcp-b.ai)
- **Issues**: Open a GitHub issue with the bug/feature template
- **Discussions**: Use GitHub Discussions for questions

## Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to WebMCP Examples!** Your contributions help the community learn and build better AI-integrated applications.
