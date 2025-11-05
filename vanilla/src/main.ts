/**
 * Shopping cart application with WebMCP integration
 *
 * This application demonstrates the modern WebMCP API using vanilla TypeScript.
 * All business logic is separated into pure functions in lib/ modules.
 *
 * @see https://docs.mcp-b.ai/packages/global
 */

import '@mcp-b/global';
import './style.css';
import type { CartItem } from './types';
import {
  addItemToCart,
  removeItemFromCart,
  calculateItemCount,
  formatCartSummary,
} from './lib/cart';
import { renderCartUI, showNotification, initializeApp } from './lib/ui';

let cart: CartItem[] = [];

const appElement = document.querySelector<HTMLDivElement>('#app');
if (appElement) {
  initializeApp(appElement);
}

/**
 * WebMCP Tool: Add to Cart
 *
 * Adds a product to the shopping cart or updates quantity if it exists
 */
navigator.modelContext.registerTool({
  name: 'add_to_cart',
  description: 'Add a product to the shopping cart',
  inputSchema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        description: 'Unique product ID',
      },
      name: {
        type: 'string',
        description: 'Product name',
      },
      price: {
        type: 'number',
        description: 'Product price in USD',
      },
      quantity: {
        type: 'number',
        description: 'Quantity to add (default: 1)',
      },
    },
    required: ['productId', 'name', 'price'],
  },
  async execute(args) {
    const { productId, name, price, quantity = 1 } = args;
    const existingItem = cart.find((item) => item.id === productId);

    cart = addItemToCart(cart, { id: productId, name, price, quantity });

    if (existingItem) {
      const updatedItem = cart.find((item) => item.id === productId);
      showNotification(
        `Updated ${name} quantity to ${updatedItem?.quantity}`,
        'success'
      );
    } else {
      showNotification(`Added ${name} to cart`, 'success');
    }

    renderCartUI(cart);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully added ${quantity}x ${name} ($${price.toFixed(
            2
          )}) to cart. Total items: ${calculateItemCount(cart)}`,
        },
      ],
    };
  },
});

/**
 * WebMCP Tool: Remove from Cart
 *
 * Removes a product from the shopping cart by ID
 */
navigator.modelContext.registerTool({
  name: 'remove_from_cart',
  description: 'Remove a product from the shopping cart',
  inputSchema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        description: 'Product ID to remove',
      },
    },
    required: ['productId'],
  },
  async execute(args) {
    const { productId } = args;
    const [updatedCart, removedItem] = removeItemFromCart(cart, productId);

    if (!removedItem) {
      showNotification('Product not found in cart', 'error');
      return {
        content: [{ type: 'text', text: `Product ${productId} not found in cart` }],
      };
    }

    cart = updatedCart;
    showNotification(`Removed ${removedItem.name} from cart`, 'success');
    renderCartUI(cart);

    return {
      content: [{ type: 'text', text: `Removed ${removedItem.name} from cart` }],
    };
  },
});

/**
 * WebMCP Tool: Get Cart
 *
 * Returns the current shopping cart contents in a formatted string
 */
navigator.modelContext.registerTool({
  name: 'get_cart',
  description: 'Get the current shopping cart contents',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async execute() {
    return {
      content: [
        {
          type: 'text',
          text: formatCartSummary(cart),
        },
      ],
    };
  },
});

/**
 * WebMCP Tool: Clear Cart
 *
 * Removes all items from the shopping cart
 */
navigator.modelContext.registerTool({
  name: 'clear_cart',
  description: 'Remove all items from the shopping cart',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async execute() {
    const itemCount = cart.length;
    cart = [];
    renderCartUI(cart);
    showNotification('Cart cleared', 'success');

    return {
      content: [{ type: 'text', text: `Cleared ${itemCount} items from cart` }],
    };
  },
});

/**
 * WebMCP Tool: Get Cart Total
 *
 * Returns the total price and item count for the current cart
 */
navigator.modelContext.registerTool({
  name: 'get_cart_total',
  description: 'Get the total price of all items in the cart',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async execute() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = calculateItemCount(cart);

    return {
      content: [
        {
          type: 'text',
          text: `Cart total: $${total.toFixed(2)} (${itemCount} items)`,
        },
      ],
    };
  },
});

console.log('✅ WebMCP tools registered successfully!');
console.log(
  '🔧 Available tools: add_to_cart, remove_from_cart, get_cart, clear_cart, get_cart_total'
);
