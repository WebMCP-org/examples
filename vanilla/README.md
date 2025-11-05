# Vanilla JavaScript WebMCP Example

A modern shopping cart application demonstrating the **new WebMCP API** with vanilla TypeScript.

## ✨ What's New

This example uses the **simplified WebMCP API** introduced in 2024:

- ✅ Uses `navigator.modelContext.registerTool()` - no MCP SDK required
- ✅ Simple JSON schema validation
- ✅ Zero boilerplate compared to legacy examples
- ✅ Just install `@mcp-b/global` and start coding

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Then open your browser and install the [MCP-B extension](https://github.com/WebMCP-org/WebMCP) to interact with the tools.

## 🛠️ Available Tools

This example exposes 5 AI-callable tools:

1. **add_to_cart** - Add products to the shopping cart
2. **remove_from_cart** - Remove items by product ID
3. **get_cart** - View current cart contents
4. **clear_cart** - Empty the entire cart
5. **get_cart_total** - Get the total price

## 📖 How It Works

The new API is incredibly simple:

```typescript
import '@mcp-b/global';

navigator.modelContext.registerTool({
  name: 'add_to_cart',
  description: 'Add a product to the shopping cart',
  inputSchema: {
    type: 'object',
    properties: {
      productId: { type: 'string', description: 'Unique product ID' },
      name: { type: 'string', description: 'Product name' },
      price: { type: 'number', description: 'Product price in USD' },
    },
    required: ['productId', 'name', 'price'],
  },
  async execute(args) {
    // Your logic here
    return {
      content: [{ type: 'text', text: 'Success!' }],
    };
  },
});
```

## 🆚 Old API vs New API

**Old API** (deprecated):
```typescript
import { TabServerTransport } from '@mcp-b/transports';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// ... lots of boilerplate
```

**New API** (recommended):
```typescript
import '@mcp-b/global';
navigator.modelContext.registerTool({ ... });
```

## 📚 Learn More

- [WebMCP Documentation](https://docs.mcp-b.ai)
- [WebMCP Quickstart](https://docs.mcp-b.ai/quickstart)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 📝 License

MIT
