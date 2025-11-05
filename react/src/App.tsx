import { useState, useEffect } from 'react';
import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';
import './App.css';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  completed: boolean;
  createdAt: Date;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Tool 1: Add Task
  useWebMCP({
    name: 'add_task',
    description: 'Add a new task to the task manager',
    inputSchema: {
      title: z.string().min(1).describe('Task title'),
      description: z.string().describe('Task description (optional)').optional().default(''),
      priority: z.enum(['low', 'medium', 'high']).describe('Task priority level').default('medium'),
      category: z.string().describe('Task category (e.g., work, personal, urgent)').default('general'),
    },
    handler: async ({ title, description, priority, category }) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        description: description || '',
        priority,
        category,
        completed: false,
        createdAt: new Date(),
      };

      setTasks((prev) => [...prev, newTask]);
      showNotification(`Added task: ${title}`, 'success');

      return {
        success: true,
        message: `Task "${title}" added successfully with ${priority} priority`,
        taskId: newTask.id,
      };
    },
  });

  // Tool 2: Complete Task
  useWebMCP({
    name: 'complete_task',
    description: 'Mark a task as completed',
    inputSchema: {
      taskId: z.string().describe('ID of the task to complete'),
    },
    handler: async ({ taskId }) => {
      const task = tasks.find((t) => t.id === taskId);

      if (!task) {
        showNotification('Task not found', 'error');
        return { success: false, message: 'Task not found' };
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
      );
      showNotification(`Completed: ${task.title}`, 'success');

      return {
        success: true,
        message: `Task "${task.title}" marked as completed`,
      };
    },
  });

  // Tool 3: Delete Task
  useWebMCP({
    name: 'delete_task',
    description: 'Delete a task from the task manager',
    inputSchema: {
      taskId: z.string().describe('ID of the task to delete'),
    },
    handler: async ({ taskId }) => {
      const task = tasks.find((t) => t.id === taskId);

      if (!task) {
        showNotification('Task not found', 'error');
        return { success: false, message: 'Task not found' };
      }

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showNotification(`Deleted: ${task.title}`, 'success');

      return {
        success: true,
        message: `Task "${task.title}" deleted`,
      };
    },
  });

  // Tool 4: List Tasks
  useWebMCP({
    name: 'list_tasks',
    description: 'Get a list of all tasks with optional filtering',
    inputSchema: {
      filter: z.enum(['all', 'active', 'completed']).describe('Filter tasks by status').optional().default('all'),
      category: z.string().describe('Filter by category (optional)').optional(),
    },
    handler: async ({ filter, category }) => {
      let filteredTasks = tasks;

      if (filter === 'active') {
        filteredTasks = filteredTasks.filter((t) => !t.completed);
      } else if (filter === 'completed') {
        filteredTasks = filteredTasks.filter((t) => t.completed);
      }

      if (category) {
        filteredTasks = filteredTasks.filter((t) => t.category.toLowerCase() === category.toLowerCase());
      }

      const taskList = filteredTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        category: t.category,
        completed: t.completed,
      }));

      return {
        success: true,
        totalTasks: tasks.length,
        filteredCount: filteredTasks.length,
        tasks: taskList,
      };
    },
  });

  // Tool 5: Update Task Priority
  useWebMCP({
    name: 'update_task_priority',
    description: 'Change the priority level of a task',
    inputSchema: {
      taskId: z.string().describe('ID of the task to update'),
      priority: z.enum(['low', 'medium', 'high']).describe('New priority level'),
    },
    handler: async ({ taskId, priority }) => {
      const task = tasks.find((t) => t.id === taskId);

      if (!task) {
        showNotification('Task not found', 'error');
        return { success: false, message: 'Task not found' };
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, priority } : t))
      );
      showNotification(`Updated priority for: ${task.title}`, 'success');

      return {
        success: true,
        message: `Task "${task.title}" priority updated to ${priority}`,
      };
    },
  });

  // Tool 6: Get Task Stats
  useWebMCP({
    name: 'get_task_stats',
    description: 'Get statistics about tasks',
    inputSchema: {},
    handler: async () => {
      const total = tasks.length;
      const completed = tasks.filter((t) => t.completed).length;
      const active = total - completed;
      const byPriority = {
        high: tasks.filter((t) => t.priority === 'high' && !t.completed).length,
        medium: tasks.filter((t) => t.priority === 'medium' && !t.completed).length,
        low: tasks.filter((t) => t.priority === 'low' && !t.completed).length,
      };

      return {
        success: true,
        stats: {
          total,
          active,
          completed,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          byPriority,
        },
      };
    },
  });

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  useEffect(() => {
    console.log('✅ WebMCP React hooks registered successfully!');
    console.log('🔧 Available tools: add_task, complete_task, delete_task, list_tasks, update_task_priority, get_task_stats');
  }, []);

  return (
    <div className="app">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
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
              <p>This React app uses the <strong>useWebMCP()</strong> hook:</p>
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
                <li><code>add_task</code> - Create new tasks</li>
                <li><code>complete_task</code> - Mark tasks done</li>
                <li><code>delete_task</code> - Remove tasks</li>
                <li><code>list_tasks</code> - View all tasks</li>
                <li><code>update_task_priority</code> - Change priority</li>
                <li><code>get_task_stats</code> - Get statistics</li>
              </ul>
            </div>
          </section>

          <section className="stats-section">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card active">
              <div className="stat-number">{stats.active}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card completed">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </section>

          <section className="filter-section">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All Tasks
            </button>
            <button
              className={filter === 'active' ? 'active' : ''}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={filter === 'completed' ? 'active' : ''}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </section>

          <section className="tasks-section">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks found. Ask AI to add some tasks!</p>
              </div>
            ) : (
              <div className="task-list">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-card ${task.completed ? 'completed' : ''}`}
                  >
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    <div className="task-footer">
                      <span className="category-tag">{task.category}</span>
                      <span className="task-status">
                        {task.completed ? '✅ Completed' : '⏳ Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
