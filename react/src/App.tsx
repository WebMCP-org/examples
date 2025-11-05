/**
 * Task Manager Application with WebMCP Integration
 *
 * This application demonstrates the useWebMCP() hook from @mcp-b/react-webmcp.
 * Business logic is separated into pure functions in lib/ modules.
 *
 * @see https://docs.mcp-b.ai/packages/react-webmcp
 */

import { useState, useEffect } from 'react';
import './App.css';
import type { Task, TaskFilter, Notification } from './types';
import { filterTasks, calculateTaskStats } from './lib/tasks';
import { TaskWebMCPTools } from './components/TaskWebMCPTools';
import { TaskStatsDisplay } from './components/TaskStats';
import { TaskFilterButtons } from './components/TaskFilter';
import { TaskList } from './components/TaskList';

/**
 * Main application component
 *
 * Manages task state and provides UI for task management with AI integration
 */
function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: Notification['type'] = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredTasks = filterTasks(tasks, filter);
  const stats = calculateTaskStats(tasks);

  useEffect(() => {
    console.log('✅ WebMCP React hooks registered successfully!');
    console.log(
      '🔧 Available tools: add_task, complete_task, delete_task, list_tasks, update_task_priority, get_task_stats'
    );
  }, []);

  return (
    <div className="app">
      <TaskWebMCPTools tasks={tasks} setTasks={setTasks} showNotification={showNotification} />

      {notification && (
        <div className={`notification ${notification.type}`}>{notification.message}</div>
      )}

      <div className="container">
        <header className="header">
          <h1>📋 Smart Task Manager</h1>
          <p className="subtitle">AI-powered task management with React + WebMCP</p>
        </header>

        <div className="content">
          <section className="info-section">
            <div className="info-card">
              <h2>🤖 How This Works</h2>
              <p>
                This React app uses the <strong>useWebMCP()</strong> hook:
              </p>
              <ul>
                <li>Install the MCP-B browser extension</li>
                <li>Open the extension to see 6 available tools</li>
                <li>Ask AI to manage your tasks</li>
                <li>Watch React state update in real-time!</li>
              </ul>
            </div>

            <div className="tools-card">
              <h2>🛠️ Available Tools</h2>
              <ul>
                <li>
                  <code>add_task</code> - Create new tasks
                </li>
                <li>
                  <code>complete_task</code> - Mark tasks done
                </li>
                <li>
                  <code>delete_task</code> - Remove tasks
                </li>
                <li>
                  <code>list_tasks</code> - View all tasks
                </li>
                <li>
                  <code>update_task_priority</code> - Change priority
                </li>
                <li>
                  <code>get_task_stats</code> - Get statistics
                </li>
              </ul>
            </div>
          </section>

          <TaskStatsDisplay stats={stats} />

          <TaskFilterButtons filter={filter} onFilterChange={setFilter} />

          <section className="tasks-section">
            <TaskList tasks={filteredTasks} />
          </section>
        </div>

        <footer className="footer">
          <p>
            Built with{' '}
            <a href="https://docs.mcp-b.ai" target="_blank" rel="noopener noreferrer">
              WebMCP
            </a>{' '}
            • React Hooks • Zod Validation
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
