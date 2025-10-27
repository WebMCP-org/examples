// Type declarations for window.mcp
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

declare global {
  interface Window {
    mcp: McpServer;
  }
}

import { z } from 'zod';

let counter = 0;
let counterElement: HTMLButtonElement | null = null;

const setCounter = (count: number) => {
  counter = count;
  if (counterElement) {
    counterElement.innerHTML = `count is ${counter}`;
  }
};

export async function setupCounter(element: HTMLButtonElement) {
  counterElement = element;

  // Initialize the counter display
  setCounter(0);

  // Add click handler for the button
  element.addEventListener('click', () => setCounter(counter + 1));

  // Wait for window.mcp to be available
  if (!window.mcp) {
    console.warn('window.mcp not available yet, waiting...');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Register MCP tools using the global polyfill
  window.mcp.registerTool(
    'incrementCounter',
    {
      title: 'Increment Counter',
      description: 'Increment the counter by a specified amount',
      inputSchema: {
        amount: z.number().optional().default(1).describe('Amount to increment by'),
      },
    },
    async ({ amount = 1 }) => {
      const newCount = counter + amount;
      setCounter(newCount);

      return {
        content: [
          {
            type: 'text',
            text: `Incremented counter by ${amount} to ${newCount}`,
          },
        ],
      };
    }
  );

  window.mcp.registerTool(
    'setCounter',
    {
      title: 'Set Counter',
      description: 'Set the counter to a specific value',
      inputSchema: {
        value: z.string().describe('Value to set the counter to'),
      },
    },
    async ({ value }) => {
      setCounter(parseInt(value));

      return {
        content: [
          {
            type: 'text',
            text: `Set counter to ${value}`,
          },
        ],
      };
    }
  );

  window.mcp.registerTool(
    'getCounter',
    {
      title: 'Get Counter',
      description: 'Get the current counter value',
    },
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: `Current counter value is ${counter}`,
          },
        ],
      };
    }
  );

  console.log('MCP tools registered successfully!');
}

// Export functions for interactive controls
export function updateMood(mood: string) {
  console.log('Mood updated to:', mood);
}

export function addTodo(todo: string) {
  console.log('Todo added:', todo);
}

export function recordThough(thought: string) {
  console.log('Thought recorded:', thought);
}

export function setCurrentProject(project: string) {
  console.log('Project set to:', project);
}

export function incrementCounter(amount: number) {
  setCounter(counter + amount);
}
