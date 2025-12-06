/**
 * Phoenix LiveView + WebMCP Integration
 *
 * Demonstrates integrating WebMCP with Phoenix LiveView using JavaScript hooks.
 * Tools registered here expose server-side LiveView state to AI agents.
 *
 * @see https://docs.mcp-b.ai/packages/global - WebMCP global polyfill
 * @see https://hexdocs.pm/phoenix_live_view/js-interop.html - LiveView JS interop
 */

import "@mcp-b/global";
import { Socket } from "phoenix";
import { LiveSocket } from "phoenix_live_view";

/**
 * WebMCP Hook for Phoenix LiveView
 *
 * Registers WebMCP tools on mount, cleans up on destroy.
 * Each tool uses `this.pushEvent()` to communicate with the LiveView process.
 */
const WebMCPHook = {
  /** @type {Array<() => void>} Cleanup functions for registered tools */
  cleanupFns: [],

  mounted() {
    this.registerTools();
  },

  destroyed() {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  },

  /**
   * Register all WebMCP tools.
   * Each tool calls `this.pushEvent()` to send events to LiveView.
   */
  registerTools() {
    const hook = this;

    // Counter tools
    this.registerTool({
      name: "increment_counter",
      description: "Increase the counter by 1",
      inputSchema: { type: "object", properties: {} },
      async execute() {
        hook.pushEvent("increment", {});
        return { content: [{ type: "text", text: "Counter incremented" }] };
      },
    });

    this.registerTool({
      name: "decrement_counter",
      description: "Decrease the counter by 1 (minimum 0)",
      inputSchema: { type: "object", properties: {} },
      async execute() {
        hook.pushEvent("decrement", {});
        return { content: [{ type: "text", text: "Counter decremented" }] };
      },
    });

    this.registerTool({
      name: "set_counter",
      description: "Set the counter to a specific value",
      inputSchema: {
        type: "object",
        properties: {
          value: { type: "number", description: "Value to set (must be >= 0)" },
        },
        required: ["value"],
      },
      async execute({ value }) {
        if (value < 0) {
          return { content: [{ type: "text", text: "Error: Value must be >= 0" }] };
        }
        hook.pushEvent("set_count", { value });
        return { content: [{ type: "text", text: `Counter set to ${value}` }] };
      },
    });

    // Item management tools
    this.registerTool({
      name: "add_item",
      description: "Add a new item to the list",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the item to add" },
        },
        required: ["name"],
      },
      async execute({ name }) {
        if (!name?.trim()) {
          return { content: [{ type: "text", text: "Error: Name required" }] };
        }
        hook.pushEvent("add_item", { name: name.trim() });
        return { content: [{ type: "text", text: `Added: ${name}` }] };
      },
    });

    this.registerTool({
      name: "remove_item",
      description: "Remove an item from the list by its ID",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "number", description: "ID of the item to remove" },
        },
        required: ["id"],
      },
      async execute({ id }) {
        hook.pushEvent("remove_item", { id });
        return { content: [{ type: "text", text: `Removed item ${id}` }] };
      },
    });

    // State query tool (uses reply callback for synchronous response)
    this.registerTool({
      name: "get_state",
      description: "Get current counter value and all items",
      inputSchema: { type: "object", properties: {} },
      async execute() {
        return new Promise((resolve) => {
          hook.pushEvent("get_state", {}, (reply) => {
            if (reply?.count !== undefined) {
              const { count, items, item_count, last_action } = reply;
              const itemList = items.length
                ? items.map((i) => `  - ${i.name} (ID: ${i.id})`).join("\n")
                : "  (none)";
              resolve({
                content: [{
                  type: "text",
                  text: `Counter: ${count}\nItems (${item_count}):\n${itemList}\nLast action: ${last_action || "none"}`,
                }],
              });
            } else {
              resolve({ content: [{ type: "text", text: "Error fetching state" }] });
            }
          });
        });
      },
    });
  },

  /** Register a tool and track cleanup function */
  registerTool(config) {
    const cleanup = navigator.modelContext.registerTool(config);
    if (cleanup) this.cleanupFns.push(cleanup);
  },
};

// Hooks registry - add WebMCP hook for LiveView elements with phx-hook="WebMCP"
const Hooks = { WebMCP: WebMCPHook };

// Initialize Phoenix LiveSocket with WebMCP hooks
const csrfToken = document.querySelector("meta[name='csrf-token']").content;
const liveSocket = new LiveSocket("/live", Socket, {
  longPollFallbackMs: 2500,
  params: { _csrf_token: csrfToken },
  hooks: Hooks,
});

liveSocket.connect();
window.liveSocket = liveSocket;
