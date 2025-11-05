/**
 * Pure business logic functions for shopping cart operations
 */

import type { CartItem } from '../types';

/**
 * Calculate the total price of items in the cart
 *
 * @param items - Array of cart items
 * @returns Total price in USD
 *
 * @example
 * ```ts
 * const total = calculateCartTotal([
 *   { id: '1', name: 'Apple', price: 1.99, quantity: 3 },
 *   { id: '2', name: 'Banana', price: 0.99, quantity: 5 }
 * ]);
 * // returns 10.92
 * ```
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Calculate the total number of items in the cart
 *
 * @param items - Array of cart items
 * @returns Total quantity of all items
 */
export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Add an item to the cart or update quantity if it already exists
 *
 * @param cart - Current cart items
 * @param item - Item to add
 * @returns Updated cart array
 */
export function addItemToCart(
  cart: CartItem[],
  item: Omit<CartItem, 'id'> & { id: string; quantity?: number }
): CartItem[] {
  const { id, name, price, quantity = 1 } = item;
  const existingItemIndex = cart.findIndex((cartItem) => cartItem.id === id);

  if (existingItemIndex !== -1) {
    const updated = [...cart];
    updated[existingItemIndex] = {
      ...updated[existingItemIndex],
      quantity: updated[existingItemIndex].quantity + quantity,
    };
    return updated;
  }

  return [...cart, { id, name, price, quantity }];
}

/**
 * Remove an item from the cart by ID
 *
 * @param cart - Current cart items
 * @param productId - ID of the product to remove
 * @returns Tuple of [updated cart, removed item or null]
 */
export function removeItemFromCart(
  cart: CartItem[],
  productId: string
): [CartItem[], CartItem | null] {
  const itemIndex = cart.findIndex((item) => item.id === productId);

  if (itemIndex === -1) {
    return [cart, null];
  }

  const removedItem = cart[itemIndex];
  const updatedCart = cart.filter((_, index) => index !== itemIndex);

  return [updatedCart, removedItem];
}

/**
 * Format cart items for display
 *
 * @param items - Array of cart items
 * @returns Formatted string representation of cart
 */
export function formatCartSummary(items: CartItem[]): string {
  if (items.length === 0) {
    return 'Cart is empty';
  }

  const itemList = items
    .map(
      (item) =>
        `- ${item.name}: $${item.price.toFixed(2)} × ${item.quantity} = $${(
          item.price * item.quantity
        ).toFixed(2)}`
    )
    .join('\n');

  const total = calculateCartTotal(items);

  return `Shopping Cart:\n${itemList}\n\nTotal: $${total.toFixed(2)}`;
}
