# Contributing Guide for AI Agents

This guide outlines the development standards and best practices for AI assistants contributing to this codebase. Our philosophy prioritizes type safety, single source of truth, modularity, and clean, self-documenting code.

## Core Principles

### 0. Adhere to the principles of working with legacy codebases

* Deeply investigate and understand existing code before making changes.
* Adhere to existing coding styles and patterns.
* Minimize changes to working code; prioritize stability.
* Read documentation, check that it is accurate, and update it if it is not

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
- Use strict TypeScript settings (already configured in tsconfig files)
- Leverage type inference but annotate function signatures
- Use Zod for runtime validation (already used in WebMCP tool schemas)

**Verify types:** Run `pnpm typecheck` before committing.

### 2. Single Source of Truth

**Never duplicate information - always reference the canonical source.**

✅ **Good:**
```typescript
/**
 * WebMCP tool names
 * See: src/main.ts for tool implementations
 */
export const TOOL_NAMES = ['add_to_cart', 'remove_from_cart'] as const;
```

❌ **Bad:**
```typescript
// Duplicating tool list that already exists in main.ts
export const TOOL_NAMES = ['add_to_cart', 'remove_from_cart'];
```

**Guidelines:**
- Configuration lives in one place (e.g., `vite.config.ts`)
- Constants are exported from a single module and imported elsewhere
- Types are defined once and shared via imports
- Documentation references other docs rather than duplicating content

**This applies to documentation too:**
- README.md has the example overview
- AGENTS.md links to other documentation (not duplicating it)
- Package-specific docs stay in their directories

### 3. Modularity

**Write small, focused, reusable modules with clear boundaries.**

✅ **Good:**
```typescript
// src/lib/cart.ts - Pure cart logic
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// src/App.tsx - UI component
import { calculateTotal } from './lib/cart';

export function App() {
  const total = calculateTotal(cartItems);
  // Render UI
}
```

❌ **Bad:**
```typescript
// Everything in one file
export function App() {
  // Cart logic mixed with UI
  const calculateTotal = () => { /* ... */ };
  // Render UI
}
```

**Guidelines:**
- One responsibility per file/function
- Separate concerns: logic, UI, types
- Components should be composable and testable
- Pure functions for business logic
- Side effects isolated to specific modules

**Recommended file organization:**
```
src/
├── lib/              # Pure utility functions
├── types/            # Shared TypeScript types
├── components/       # React components (React examples only)
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

### 4. Code Cleanliness

**Code should be self-documenting. Use JSDoc for public APIs, not inline comments.**

✅ **Good:**
```typescript
/**
 * Register a WebMCP tool that adds items to the shopping cart
 *
 * @param productId - Unique identifier for the product
 * @param quantity - Number of items to add (must be positive)
 * @returns Tool result with updated cart state
 *
 * @example
 * ```ts
 * useWebMCP({
 *   name: "add_to_cart",
 *   description: "Add item to shopping cart",
 *   inputSchema: {
 *     productId: z.string(),
 *     quantity: z.number().positive()
 *   },
 *   handler: async ({ productId, quantity }) => ({ success: true })
 * });
 * ```
 */
export function addToCart(productId: string, quantity: number) {
  // Implementation
}
```

❌ **Bad:**
```typescript
export function addToCart(productId: string, quantity: number) {
  // First we check if the product exists
  const product = products.find(p => p.id === productId);

  // Then we add it to the cart
  cart.push({ product, quantity });

  // Finally we save the cart
  saveCart(cart);
}
```

**Guidelines:**
- Write clear function/variable names instead of comments
- Use JSDoc for all exported functions, classes, and types
- Include `@param`, `@returns`, and `@example` in JSDoc
- No inline comments explaining "what" - code should be clear
- Only use inline comments for "why" if truly necessary (rare)
- Keep functions small and focused (easier to understand without comments)

**JSDoc best practices:**
- Document the interface, not the implementation
- Include examples for complex APIs
- Link to related documentation: `@see src/main.ts`
- Keep it concise but complete

## Practical Guidelines

### Adding New Examples

**Before creating a new example:**
1. Check if it fits better as an enhancement to an existing example
2. Ensure it demonstrates a unique WebMCP use case
3. Review existing patterns in `/vanilla` and `/react` directories
4. Identify where types, logic, and UI should live

**When creating a new example:**
1. Define TypeScript types/interfaces first
2. Write pure logic functions (testable)
3. Create UI components that use the logic
4. Add JSDoc to public APIs
5. Create comprehensive README.md
6. Use the modern WebMCP API (`@mcp-b/global` or `@mcp-b/react-webmcp`)
7. Never use deprecated APIs from `/relegated`

**After creating the example:**
```bash
cd your-example
pnpm typecheck  # Verify types
pnpm lint       # Check code quality
pnpm build      # Ensure builds succeed
```

### Modifying Existing Examples

**Follow the existing patterns:**
- If file uses named exports, continue using named exports
- If types are in a separate file, add new types there
- Match the JSDoc style of the module
- Maintain the same level of abstraction

**Don't refactor unnecessarily:**
- If code works and follows these principles, leave it
- Only refactor if fixing a bug or adding a feature
- Refactoring should improve clarity, not just change style

### Documentation Updates

**When documentation needs updating:**
- Update the canonical source (e.g., example's README.md)
- AGENTS.md should only link, never duplicate
- Keep documentation close to code when possible
- Update CHANGELOG.md for significant changes

## Code Review Checklist

Before submitting changes, verify:

- [ ] **Type safety**: No `any`, all types are explicit
- [ ] **No duplication**: Information lives in one place
- [ ] **Modularity**: Functions/components have single responsibility
- [ ] **Clean code**: JSDoc on public APIs, no inline comments explaining "what"
- [ ] **Lint & typecheck pass**: `pnpm typecheck` and `pnpm lint` succeed with no errors
- [ ] **Build succeeds**: `pnpm build` completes without errors
- [ ] **Tested with MCP-B extension**: All tools register and work correctly
- [ ] **Documentation updated**: README and inline docs are current
- [ ] **Follows patterns**: Matches existing code style and structure
- [ ] **Modern API**: Uses `@mcp-b/global` or `@mcp-b/react-webmcp`, NOT deprecated packages

## Common Patterns

### WebMCP Tool Registration - Vanilla

```typescript
/**
 * Register a tool with WebMCP
 * Tool executes pure business logic from lib/ modules
 */
import '@mcp-b/global';

navigator.modelContext.registerTool({
  name: 'tool_name',
  description: 'Clear description of what this tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: 'Parameter description' }
    },
    required: ['param']
  },
  async execute(args) {
    // Call pure functions from lib/
    const result = await processData(args.param);
    return {
      content: [{ type: 'text', text: result }]
    };
  }
});
```

### WebMCP Hook Usage - React

```typescript
/**
 * Register a tool that can be called by the AI
 * The tool is automatically unregistered when component unmounts
 */
import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';

function App() {
  const [state, setState] = useState<State>(initialState);

  useWebMCP({
    name: "tool_name",
    description: "What the tool does",
    inputSchema: {
      param: z.string().describe('Parameter description')
    },
    handler: async ({ param }) => {
      // Type-safe params from Zod schema
      // Can access and modify React state
      setState(prev => updateState(prev, param));
      return { success: true, result: 'Done!' };
    }
  });

  return <div>{/* UI */}</div>;
}
```

### React Component Structure

```typescript
/**
 * Task manager component with WebMCP integration
 * Manages task state and registers MCP tools for AI interaction
 */
export function TaskManager() {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);

  // Logic (can be extracted to lib/ if complex)
  const completedCount = tasks.filter(t => t.completed).length;

  // WebMCP integration
  useWebMCP({
    name: 'add_task',
    handler: async ({ title }) => {
      const newTask = { id: crypto.randomUUID(), title, completed: false };
      setTasks(prev => [...prev, newTask]);
      return { success: true, taskId: newTask.id };
    }
  });

  // Render
  return <div>{/* UI */}</div>;
}
```

### Error Handling

```typescript
/**
 * Handle tool execution errors gracefully
 * Always return valid response even on error
 */
useWebMCP({
  name: 'risky_operation',
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

### Type Definitions

```typescript
/**
 * Define types once, import everywhere
 * Keep types close to their usage
 */

// src/types/cart.ts
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'CLEAR_CART' };

// Import in other files
import type { CartItem, CartAction } from './types/cart';
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

### Testing

Manual testing with MCP-B extension is required:

1. Install the [MCP-B Chrome Extension](https://chromewebstore.google.com/detail/mcp-b/fkhbffeojcfadbkpldmbjlbfocgknjlj)
2. Run your example (`pnpm dev`)
3. Open the extension and verify tools are registered
4. Test each tool through the AI interface
5. Verify UI updates correctly
6. Test error cases (invalid inputs, network errors, etc.)

### Pull Request Process

1. **Fork the repository** and create a branch from `main`
2. **Make your changes** following the guidelines above
3. **Test thoroughly** using the MCP-B extension
4. **Update documentation** if you're changing functionality
5. **Run quality checks**: `pnpm typecheck && pnpm lint && pnpm build`
6. **Submit a pull request** using the PR template

## Example Structure

Each example should follow this structure:

```
example-name/
├── README.md           # What it demonstrates, how to run
├── package.json        # Dependencies (@mcp-b/* packages)
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript config (strict mode)
├── index.html          # HTML entry point
└── src/
    ├── main.tsx        # Application entry point
    ├── App.tsx         # Main app component
    ├── types/          # TypeScript type definitions
    │   └── index.ts
    └── lib/            # Pure utility functions (optional)
        └── utils.ts
```

## Resources

### Primary Documentation
- [README.md](./README.md) - Repository overview
- [AGENTS.md](./AGENTS.md) - Navigation hub for AI agents
- [CHANGELOG.md](./CHANGELOG.md) - Version history

### WebMCP Documentation
- [WebMCP Documentation](https://docs.mcp-b.ai)
- [Quick Start Guide](https://docs.mcp-b.ai/quickstart)
- [React WebMCP Package](https://docs.mcp-b.ai/packages/react-webmcp)
- [Core Package](https://docs.mcp-b.ai/packages/core)

### External Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Zod Documentation](https://zod.dev/)

## Questions?

If you're unsure about a pattern or approach:
1. Check existing examples for similar patterns
2. Review the [vanilla](./vanilla/) or [react](./react/) examples
3. Check [WebMCP documentation](https://docs.mcp-b.ai)
4. When in doubt, prioritize clarity and type safety

---

**Remember**: These principles exist to make the examples clear, maintainable, and educational. When followed consistently, they help developers learn WebMCP best practices.
