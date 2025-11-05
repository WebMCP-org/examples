/**
 * Type definitions for the shopping cart application
 */

/**
 * Represents an item in the shopping cart
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Notification types for UI feedback
 */
export type NotificationType = 'success' | 'error';
