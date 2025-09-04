import { TabServerTransport } from '@mcp-b/transports';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import z from 'zod';

// Personal state management
interface PersonalState {
  mood: string;
  currentProject: string;
  todoList: string[];
  favoriteColor: string;
  lastThought: string;
  visitCount: number;
}

const personalState: PersonalState = {
  mood: 'excited about MCP-B',
  currentProject: 'Building an AI-powered personal website',
  todoList: ['Learn MCP-B', 'Build cool tools', 'Show off to friends'],
  favoriteColor: '#6366f1',
  lastThought: 'This MCP-B thing is pretty amazing!',
  visitCount: 0,
};

// Show notification when AI calls a tool
function showNotification(message: string, type: 'success' | 'info' = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    transform: translateX(400px);
    transition: transform 0.3s ease;
  `;
  notification.textContent = `🤖 AI Tool Called: ${message}`;

  document.body.appendChild(notification);

  // Slide in
  setTimeout(() => (notification.style.transform = 'translateX(0)'), 50);

  // Slide out and remove
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

function ensureStatusPanel(): HTMLElement {
  let panel = document.getElementById('personal-status');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'personal-status';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      right: 24px;
      transform: translateY(-50%);
      width: 340px;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 2000;
      pointer-events: auto;
      transition: opacity .25s ease, transform .25s ease;
      opacity: 0;
    `;
    document.body.appendChild(panel);
    requestAnimationFrame(() => {
      panel!.style.opacity = '1';
    });
  }
  return panel;
}

// Update page with current state
function updatePersonalStatus() {
  const statusElement = ensureStatusPanel();
  statusElement.style.transform = 'translateY(-50%) scale(0.985)';
  statusElement.style.transition = 'transform 0.25s ease';

  // Build todo list HTML separately (avoid nested template backticks confusion)
  const todosHtml = personalState.todoList
    .map(
      (item) => `
        <li style="margin: 4px 0; padding: 4px 8px; background: #f9fafb; border-radius: 4px;">${item}</li>`
    )
    .join('');

  setTimeout(() => {
    statusElement.innerHTML = `
      <div style="background: linear-gradient(135deg, ${personalState.favoriteColor}20, #ffffff); padding: 20px; border-radius: 12px; margin: 0; border: 2px solid ${personalState.favoriteColor}40; box-shadow: 0 4px 20px ${personalState.favoriteColor}20; box-sizing: border-box;">
        <h3 style="color: ${personalState.favoriteColor}; margin-top: 0;">🤖 My AI Assistant Status</h3>
        <div style="display: grid; gap: 12px;">
          <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid ${personalState.favoriteColor};">
            <strong>Current Mood:</strong> <span style="color: ${personalState.favoriteColor}; font-weight: bold;">${personalState.mood}</span>
          </div>
          <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
            <strong>Working on:</strong> ${personalState.currentProject}
          </div>
          <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <strong>Visits today:</strong> <span style="font-size: 1.2em; font-weight: bold;">${personalState.visitCount}</span>
          </div>
          <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
            <strong>Last thought:</strong> <em>"${personalState.lastThought}"</em>
          </div>
          <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #ef4444;">
            <strong>Todo List (${personalState.todoList.length} items):</strong>
            <ul style="margin: 8px 0 0 0; padding-left: 20px;">${todosHtml}</ul>
          </div>
        </div>
        <div style="margin-top: 16px; text-align: center; font-size: 0.9em; color: #6b7280;">
          🔄 Last updated: ${new Date().toLocaleTimeString()}
        </div>
      </div>`;
    statusElement.style.transform = 'translateY(-50%) scale(1)';
  }, 60);
}

const server = new McpServer(
  {
    name: 'PersonalAIWebsite',
    version: '1.0.0',
  },
  {
    capabilities: { tools: { listChanged: true } },
  }
);

// Basic ping tool
server.tool('ping', () => ({
  content: [{ type: 'text', text: 'pong' }],
}));

function updateMood(mood: string) {
  showNotification(`Updated mood to: ${mood}`);
  personalState.mood = mood;
  updatePersonalStatus();
}

function addTodo(item: string) {
  showNotification(`Added todo: ${item}`);
  personalState.todoList.push(item);
  updatePersonalStatus();
}

function recordThough(thought: string) {
  showNotification(`Recorded new thought`);
  personalState.lastThought = thought;
  updatePersonalStatus();
}

function setCurrentProject(project: string) {
  showNotification(`Updated current project to: ${project}`);
  personalState.currentProject = project;
  updatePersonalStatus();
}

// Export functions for use in main.ts
export { updateMood, addTodo, recordThough, setCurrentProject };

// Personal AI tools
server.tool(
  'updateMood',
  'Update my current mood and see it reflect on the page',
  {
    mood: z.string().describe("Your new mood (e.g., 'excited', 'focused', 'creative')"),
  },
  async ({ mood }) => {
    updateMood(mood);
    return {
      content: [
        { type: 'text', text: `Mood updated to: ${mood}. You can see it reflected on the page!` },
      ],
    };
  }
);

server.tool(
  'addTodo',
  'Add a new item to my todo list',
  {
    item: z.string().describe('Todo item to add'),
  },
  async ({ item }) => {
    addTodo(item);
    return {
      content: [
        {
          type: 'text',
          text: `Added "${item}" to todo list. Total items: ${personalState.todoList.length}`,
        },
      ],
    };
  }
);

server.tool(
  'recordThought',
  'Record my latest thought or insight',
  {
    thought: z.string().describe('Your current thought or insight'),
  },
  async ({ thought }) => {
    recordThough(thought);
    return {
      content: [{ type: 'text', text: `Thought recorded: "${thought}"` }],
    };
  }
);

server.tool('getMyStatus', 'Get a complete overview of my current status', {}, async () => {
  showNotification(`Generated status report`, 'info');
  return {
    content: [
      {
        type: 'text',
        text: `Current Status Report:
🎭 Mood: ${personalState.mood}
🚀 Project: ${personalState.currentProject}  
📋 Todos: ${personalState.todoList.length} items (${personalState.todoList.join(', ')})
🎨 Favorite Color: ${personalState.favoriteColor}
💭 Last Thought: "${personalState.lastThought}"
👀 Visits Today: ${personalState.visitCount}`,
      },
    ],
  };
});

server.tool(
  'setCurrentProject',
  'Update the current project I am working on',
  {
    project: z.string().describe('Name of the current project'),
  },
  async ({ project }) => {
    setCurrentProject(project);
    return {
      content: [{ type: 'text', text: `Current project updated to: ${project}` }],
    };
  }
);

const transport = new TabServerTransport({
  allowedOrigins: ['*'],
});

await server.connect(transport);

// Initialize personal status on page load
function initializePersonalStatus() {
  personalState.visitCount++;
  ensureStatusPanel();

  // Reserve space on the right so content doesn't sit behind panel
  const app = document.querySelector('#app');
  if (app instanceof HTMLElement) {
    app.style.paddingRight = '380px';
  }
  updatePersonalStatus();
}

// Wait for DOM then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePersonalStatus);
} else {
  initializePersonalStatus();
}

export function setupCounter(element: HTMLButtonElement) {
  let counter = 0;
  const setCounter = (count: number) => {
    counter = count;
    element.innerHTML = `count is ${counter}`;
  };
  element.addEventListener('click', () => setCounter(counter + 1));
  setCounter(0);

  server.registerTool('Increment', {}, () => {
    setCounter(counter + 1);
    showNotification(`Counter incremented to ${counter + 1}`);
    return {
      content: [{ type: 'text', text: 'incremented!' }],
    };
  });

  server.registerTool(
    'Increment by x',
    {
      inputSchema: {
        amount: z.number().describe('the amount to increment by (can be negative or postive)'),
      },
    },
    ({ amount }) => {
      setCounter(counter + amount);
      showNotification(
        `Counter ${amount > 0 ? 'incremented' : 'decremented'} by ${Math.abs(amount)} to ${counter + amount}`
      );
      return {
        content: [
          {
            type: 'text',
            text: `counter ${amount > 0 ? 'incremented' : 'decremented'} by ${amount}!`,
          },
        ],
      };
    }
  );
}
