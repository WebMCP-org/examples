/**
 * UI rendering and notification functions
 */

import type { CartItem, NotificationType } from '../types';
import { calculateCartTotal, calculateItemCount } from './cart';

/**
 * Update the shopping cart UI with current items
 *
 * @param cart - Current cart items to display
 */
export function renderCartUI(cart: CartItem[]): void {
  const cartList = document.getElementById('cart-list');
  const cartTotal = document.getElementById('cart-total');
  const cartCount = document.getElementById('cart-count');

  if (!cartList || !cartTotal || !cartCount) return;

  if (cart.length === 0) {
    cartList.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    cartTotal.textContent = '0.00';
    cartCount.textContent = '0';
    return;
  }

  cartList.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <div class="item-info">
          <strong>${item.name}</strong>
          <span class="item-price">$${item.price.toFixed(2)} × ${item.quantity}</span>
        </div>
        <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `
    )
    .join('');

  const total = calculateCartTotal(cart);
  const itemCount = calculateItemCount(cart);

  cartTotal.textContent = total.toFixed(2);
  cartCount.textContent = itemCount.toString();
}

/**
 * Display a temporary notification to the user
 *
 * @param message - Message to display
 * @param type - Type of notification (success or error)
 */
export function showNotification(message: string, type: NotificationType = 'success'): void {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Initialize the application HTML structure
 *
 * @param rootElement - Root DOM element to render into
 */
export function initializeApp(rootElement: HTMLElement): void {
  rootElement.innerHTML = `
    <div class="container">
      <header>
        <h1>🛒 Smart Shopping Cart</h1>
        <p class="subtitle">AI-powered shopping with WebMCP</p>
      </header>

      <div class="content">
        <section class="info-card">
          <h2>🤖 How This Works</h2>
          <p>This demo uses the <strong>new WebMCP API</strong>:</p>
          <ul>
            <li>Install the MCP-B browser extension</li>
            <li>Open the extension to see available tools</li>
            <li>Ask AI to add items, clear cart, or get totals</li>
            <li>Watch the page update in real-time!</li>
          </ul>
        </section>

        <section class="tools-card">
          <h2>🛠️ Available Tools</h2>
          <ul>
            <li><code>add_to_cart</code> - Add items to your cart</li>
            <li><code>remove_from_cart</code> - Remove items by ID</li>
            <li><code>get_cart</code> - View current cart contents</li>
            <li><code>clear_cart</code> - Empty the entire cart</li>
            <li><code>get_cart_total</code> - Get the total price</li>
          </ul>
        </section>

        <section class="cart-card">
          <h2>🛍️ Your Cart <span class="badge" id="cart-count">0</span></h2>
          <div id="cart-list">
            <p class="empty-cart">Your cart is empty</p>
          </div>
          <div class="cart-footer">
            <strong>Total:</strong>
            <span class="total">$<span id="cart-total">0.00</span></span>
          </div>
        </section>
      </div>

      <footer>
        <p>Built with <a href="https://docs.mcp-b.ai" target="_blank">WebMCP</a> • Modern API • Zero MCP SDK Boilerplate</p>
      </footer>
    </div>
  `;
}
