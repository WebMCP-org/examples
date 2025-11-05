import '@mcp-b/global';
import './style.css';

// Shopping cart state
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

let cart: CartItem[] = [];

// UI Functions
function updateCartUI() {
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

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartTotal.textContent = total.toFixed(2);
  cartCount.textContent = itemCount.toString();
}

function showNotification(message: string, type: 'success' | 'error' = 'success') {
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

// Initialize UI
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
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

// Register WebMCP Tools using the new API
// Tool 1: Add to Cart
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

    // Check if item already exists
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      showNotification(`Updated ${name} quantity to ${existingItem.quantity}`, 'success');
    } else {
      cart.push({ id: productId, name, price, quantity });
      showNotification(`Added ${name} to cart`, 'success');
    }

    updateCartUI();

    return {
      content: [
        {
          type: 'text',
          text: `Successfully added ${quantity}x ${name} ($${price.toFixed(2)}) to cart. Total items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}`,
        },
      ],
    };
  },
});

// Tool 2: Remove from Cart
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
    const itemIndex = cart.findIndex((item) => item.id === productId);

    if (itemIndex === -1) {
      showNotification('Product not found in cart', 'error');
      return {
        content: [{ type: 'text', text: `Product ${productId} not found in cart` }],
      };
    }

    const removedItem = cart.splice(itemIndex, 1)[0];
    showNotification(`Removed ${removedItem.name} from cart`, 'success');
    updateCartUI();

    return {
      content: [{ type: 'text', text: `Removed ${removedItem.name} from cart` }],
    };
  },
});

// Tool 3: Get Cart
navigator.modelContext.registerTool({
  name: 'get_cart',
  description: 'Get the current shopping cart contents',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async execute() {
    if (cart.length === 0) {
      return {
        content: [{ type: 'text', text: 'Cart is empty' }],
      };
    }

    const cartSummary = cart
      .map((item) => `- ${item.name}: $${item.price.toFixed(2)} × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      content: [
        {
          type: 'text',
          text: `Shopping Cart:\n${cartSummary}\n\nTotal: $${total.toFixed(2)}`,
        },
      ],
    };
  },
});

// Tool 4: Clear Cart
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
    updateCartUI();
    showNotification('Cart cleared', 'success');

    return {
      content: [{ type: 'text', text: `Cleared ${itemCount} items from cart` }],
    };
  },
});

// Tool 5: Get Cart Total
navigator.modelContext.registerTool({
  name: 'get_cart_total',
  description: 'Get the total price of all items in the cart',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async execute() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
console.log('🔧 Available tools: add_to_cart, remove_from_cart, get_cart, clear_cart, get_cart_total');
