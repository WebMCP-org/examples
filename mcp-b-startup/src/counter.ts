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

  // Wait for navigator.modelContext to be available
  if (!navigator.modelContext) {
    console.warn('navigator.modelContext not available yet, waiting...');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Register MCP tools using the global polyfill
  navigator.modelContext.registerTool({
    name: 'incrementCounter',
    description: 'Increment the counter by a specified amount',
    inputSchema: {
      amount: z.number().optional().default(1).describe('Amount to increment by'),
    },
    async execute({ amount = 1 }) {
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
  });

  navigator.modelContext.registerTool({
    name: 'setCounter',
    description: 'Set the counter to a specific value',
    inputSchema: {
      value: z.string().describe('Value to set the counter to'),
    },
    async execute({ value }) {
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
  });

  navigator.modelContext.registerTool({
    name: 'getCounter',
    description: 'Get the current counter value',
    inputSchema: {},
    async execute() {
      return {
        content: [
          {
            type: 'text',
            text: `Current counter value is ${counter}`,
          },
        ],
      };
    }
  });

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
