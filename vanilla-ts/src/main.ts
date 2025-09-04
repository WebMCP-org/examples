import { setupCounter, updateMood, addTodo, recordThough, setCurrentProject } from './counter.ts';
import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <!-- Header Section -->
  <div style="/* reserve space for fixed status panel */">
    <div style="text-align: center; margin-bottom: 2rem;">
      <h1 style="background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 3rem; margin: 1rem 0;">
        🤖 My AI-Powered Website
      </h1>
      <p style="font-size: 1.2rem; color: #6b7280; margin-bottom: 2rem;">
        Built with MCP-B • AI tools that actually work in your browser
      </p>
    </div>
    
    <!-- How it works section -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
      <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; border: 2px solid #e2e8f0;">
        <h3 style="color: #1e293b; margin-top: 0;">🎯 How This Works</h3>
        <ol style="color: #475569; line-height: 1.6;">
          <li>Install the MCP-B browser extension</li>
          <li>Visit this page (you're here!)</li>
          <li>Open the extension and see my tools</li>
          <li>Try calling them and watch the page update</li>
        </ol>
      </div>
      
      <!-- Tools Section -->
      <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 12px; border: 2px solid #bae6fd;">
        <h3 style="color: #0c4a6e; margin-top: 0;">🛠️ Available Tools</h3>
        <ul style="color: #0369a1; line-height: 1.6; font-size: 0.9rem;">
          <li><strong>updateMood</strong> - Change my mood</li>
          <li><strong>setCurrentProject</strong> - Update what I'm working on</li>
          <li><strong>addTodo</strong> - Add items to my todo list</li>
          <li><strong>recordThought</strong> - Save a thought</li>
          <li><strong>getMyStatus</strong> - Get full status report</li>
        </ul>
      </div>
    </div>

    <!-- Interactive Controls Section -->
    <div style="background: linear-gradient(135deg, #fef3c7, #fef7cd); padding: 2rem; border-radius: 16px; margin: 2rem 0; border: 2px solid #fbbf24; box-shadow: 0 8px 32px rgba(251, 191, 36, 0.2);">
      <h3 style="color: #92400e; margin-top: 0; text-align: center; font-size: 1.5rem;">
        🎮 Try the Interactive Controls
      </h3>
      <p style="text-align: center; color: #78350f; margin-bottom: 2rem; font-size: 0.95rem;">
        These inputs directly call the same functions as the AI tools - watch the status update below!
      </p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <!-- Mood Input -->
        <div style="background: white; padding: 1.25rem; border-radius: 12px; border: 2px solid #fbbf24;">
          <label style="display: block; color: #92400e; font-weight: bold; margin-bottom: 0.5rem;">
            🎭 Update Mood
          </label>
          <div style="display: flex; gap: 0.5rem;">
            <input 
              type="text" 
              id="mood-input" 
              placeholder="e.g., excited, focused, creative"
              style="flex: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem;"
            />
            <button 
              id="mood-btn"
              style="background: #f59e0b; color: white; border: none; padding: 0.75rem 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s;"
              onmouseover="this.style.background='#d97706'"
              onmouseout="this.style.background='#f59e0b'"
            >
              Set
            </button>
          </div>
        </div>

        <!-- Project Input -->
        <div style="background: white; padding: 1.25rem; border-radius: 12px; border: 2px solid #10b981;">
          <label style="display: block; color: #065f46; font-weight: bold; margin-bottom: 0.5rem;">
            🚀 Current Project
          </label>
          <div style="display: flex; gap: 0.5rem;">
            <input 
              type="text" 
              id="project-input" 
              placeholder="What are you working on?"
              style="flex: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem;"
            />
            <button 
              id="project-btn"
              style="background: #10b981; color: white; border: none; padding: 0.75rem 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s;"
              onmouseover="this.style.background='#059669'"
              onmouseout="this.style.background='#10b981'"
            >
              Set
            </button>
          </div>
        </div>

        <!-- Todo Input -->
        <div style="background: white; padding: 1.25rem; border-radius: 12px; border: 2px solid #ef4444;">
          <label style="display: block; color: #991b1b; font-weight: bold; margin-bottom: 0.5rem;">
            📋 Add Todo
          </label>
          <div style="display: flex; gap: 0.5rem;">
            <input 
              type="text" 
              id="todo-input" 
              placeholder="New todo item"
              style="flex: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem;"
            />
            <button 
              id="todo-btn"
              style="background: #ef4444; color: white; border: none; padding: 0.75rem 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s;"
              onmouseover="this.style.background='#dc2626'"
              onmouseout="this.style.background='#ef4444'"
            >
              Add
            </button>
          </div>
        </div>

        <!-- Thought Input -->
        <div style="background: white; padding: 1.25rem; border-radius: 12px; border: 2px solid #8b5cf6;">
          <label style="display: block; color: #581c87; font-weight: bold; margin-bottom: 0.5rem;">
            💭 Record Thought
          </label>
          <div style="display: flex; gap: 0.5rem;">
            <input 
              type="text" 
              id="thought-input" 
              placeholder="What's on your mind?"
              style="flex: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem;"
            />
            <button 
              id="thought-btn"
              style="background: #8b5cf6; color: white; border: none; padding: 0.75rem 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s;"
              onmouseover="this.style.background='#7c3aed'"
              onmouseout="this.style.background='#8b5cf6'"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Counter Section -->
    <div class="card">
      <button id="counter" type="button"></button>
      <p style="margin-top: 1rem; color: #6b7280; font-size: 0.9rem;">
        ↑ Traditional button (click to count) vs AI tools (use extension) ↓
      </p>
    </div>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);

// Add event handlers for the interactive controls immediately (not waiting for DOMContentLoaded)
// Mood input handler
const moodBtn = document.getElementById('mood-btn');
const moodInput = document.getElementById('mood-input') as HTMLInputElement;

moodBtn?.addEventListener('click', () => {
  const mood = moodInput.value.trim();
  if (mood) {
    updateMood(mood);
    moodInput.value = '';
  }
});

moodInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const mood = moodInput.value.trim();
    if (mood) {
      updateMood(mood);
      moodInput.value = '';
    }
  }
});

// Project input handler
const projectBtn = document.getElementById('project-btn');
const projectInput = document.getElementById('project-input') as HTMLInputElement;

projectBtn?.addEventListener('click', () => {
  const project = projectInput.value.trim();
  if (project) {
    setCurrentProject(project);
    projectInput.value = '';
  }
});

projectInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const project = projectInput.value.trim();
    if (project) {
      setCurrentProject(project);
      projectInput.value = '';
    }
  }
});

// Todo input handler
const todoBtn = document.getElementById('todo-btn');
const todoInput = document.getElementById('todo-input') as HTMLInputElement;

todoBtn?.addEventListener('click', () => {
  const todo = todoInput.value.trim();
  if (todo) {
    addTodo(todo);
    todoInput.value = '';
  }
});

todoInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const todo = todoInput.value.trim();
    if (todo) {
      addTodo(todo);
      todoInput.value = '';
    }
  }
});

// Thought input handler
const thoughtBtn = document.getElementById('thought-btn');
const thoughtInput = document.getElementById('thought-input') as HTMLInputElement;

thoughtBtn?.addEventListener('click', () => {
  const thought = thoughtInput.value.trim();
  if (thought) {
    recordThough(thought);
    thoughtInput.value = '';
  }
});

thoughtInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const thought = thoughtInput.value.trim();
    if (thought) {
      recordThough(thought);
      thoughtInput.value = '';
    }
  }
});
