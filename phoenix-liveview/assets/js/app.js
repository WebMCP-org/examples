/**
 * Phoenix LiveView + WebMCP Integration
 *
 * This file demonstrates how to integrate WebMCP with Phoenix LiveView
 * using JavaScript hooks to expose server-side state to AI agents.
 *
 * @see https://docs.mcp-b.ai/packages/global
 * @see https://hexdocs.pm/phoenix_live_view/js-interop.html
 */

import "@mcp-b/global";
import { Socket } from "phoenix";
import { LiveSocket } from "phoenix_live_view";

/**
 * WebMCP Hook for Phoenix LiveView
 *
 * This hook registers WebMCP tools that communicate with LiveView.
 * Tools are registered on mount and cleaned up on destroy.
 */
const WebMCPHook = {
  /**
   * Registered tool cleanup functions
   * @type {Array<() => void>}
   */
  cleanupFns: [],

  /**
   * Called when the LiveView element is mounted
   * Registers all WebMCP tools
   */
  mounted() {
    console.log("WebMCP Hook mounted - registering tools...");

    this.registerTools();

    console.log("WebMCP tools registered successfully!");
    console.log(
      "Available tools: increment_counter, decrement_counter, set_counter, add_item, remove_item, get_state"
    );
  },

  /**
   * Called when the LiveView element is destroyed
   * Cleans up all registered tools
   */
  destroyed() {
    console.log("WebMCP Hook destroyed - cleaning up tools...");
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
  },

  /**
   * Register all WebMCP tools
   * Each tool communicates with LiveView via pushEvent/pushEventTo
   */
  registerTools() {
    const self = this;

    // Tool: Increment Counter
    this.registerTool({
      name: "increment_counter",
      description: "Increase the counter by 1",
      inputSchema: {
        type: "object",
        properties: {},
      },
      async execute() {
        self.pushEvent("increment", {});
        return {
          content: [{ type: "text", text: "Counter incremented by 1" }],
        };
      },
    });

    // Tool: Decrement Counter
    this.registerTool({
      name: "decrement_counter",
      description: "Decrease the counter by 1 (minimum 0)",
      inputSchema: {
        type: "object",
        properties: {},
      },
      async execute() {
        self.pushEvent("decrement", {});
        return {
          content: [
            { type: "text", text: "Counter decremented by 1 (minimum 0)" },
          ],
        };
      },
    });

    // Tool: Set Counter
    this.registerTool({
      name: "set_counter",
      description: "Set the counter to a specific value",
      inputSchema: {
        type: "object",
        properties: {
          value: {
            type: "number",
            description: "The value to set the counter to (must be >= 0)",
          },
        },
        required: ["value"],
      },
      async execute(args) {
        const { value } = args;
        if (value < 0) {
          return {
            content: [{ type: "text", text: "Error: Value must be >= 0" }],
          };
        }
        self.pushEvent("set_count", { value });
        return {
          content: [{ type: "text", text: `Counter set to ${value}` }],
        };
      },
    });

    // Tool: Add Item
    this.registerTool({
      name: "add_item",
      description: "Add a new item to the list",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the item to add",
          },
        },
        required: ["name"],
      },
      async execute(args) {
        const { name } = args;
        if (!name || name.trim() === "") {
          return {
            content: [{ type: "text", text: "Error: Item name cannot be empty" }],
          };
        }
        self.pushEvent("add_item", { name: name.trim() });
        return {
          content: [{ type: "text", text: `Added item: ${name}` }],
        };
      },
    });

    // Tool: Remove Item
    this.registerTool({
      name: "remove_item",
      description: "Remove an item from the list by its ID",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "The ID of the item to remove",
          },
        },
        required: ["id"],
      },
      async execute(args) {
        const { id } = args;
        self.pushEvent("remove_item", { id });
        return {
          content: [{ type: "text", text: `Removed item with ID: ${id}` }],
        };
      },
    });

    // Tool: Get State
    this.registerTool({
      name: "get_state",
      description:
        "Get the current state including counter value and all items in the list",
      inputSchema: {
        type: "object",
        properties: {},
      },
      async execute() {
        return new Promise((resolve) => {
          self.pushEvent("get_state", {}, (reply) => {
            if (reply && reply.ok) {
              const state = reply.ok;
              const itemList =
                state.items.length > 0
                  ? state.items.map((i) => `  - ${i.name} (ID: ${i.id})`).join("\n")
                  : "  (no items)";

              resolve({
                content: [
                  {
                    type: "text",
                    text: `Current State:\n- Counter: ${state.count}\n- Items (${state.item_count}):\n${itemList}\n- Last action: ${state.last_action || "none"}`,
                  },
                ],
              });
            } else {
              resolve({
                content: [{ type: "text", text: "Error: Could not fetch state" }],
              });
            }
          });
        });
      },
    });
  },

  /**
   * Helper to register a tool and track its cleanup function
   * @param {object} toolConfig - Tool configuration for registerTool
   */
  registerTool(toolConfig) {
    const cleanup = navigator.modelContext.registerTool(toolConfig);
    if (typeof cleanup === "function") {
      this.cleanupFns.push(cleanup);
    }
  },
};

// LiveView Hooks
const Hooks = {
  WebMCP: WebMCPHook,
};

// Initialize LiveSocket with hooks
const csrfToken = document
  .querySelector("meta[name='csrf-token']")
  .getAttribute("content");

const liveSocket = new LiveSocket("/live", Socket, {
  longPollFallbackMs: 2500,
  params: { _csrf_token: csrfToken },
  hooks: Hooks,
});

// Connect when page loads
liveSocket.connect();

// Expose for debugging
window.liveSocket = liveSocket;
