/**
 * WebMCP tool registrations for task management
 *
 * This component registers all WebMCP tools for AI interaction with the task manager.
 * Tools are automatically registered when the component mounts and unregistered on unmount.
 */

import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';
import type { Task, TaskFilter, NotificationType } from '../types';
import {
  createTask,
  updateTaskCompletion,
  updateTaskPriority,
  removeTask,
  filterTasks,
  calculateTaskStats,
} from '../lib/tasks';

interface TaskWebMCPToolsProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  showNotification: (message: string, type?: NotificationType) => void;
}

/**
 * Component that registers WebMCP tools for task management
 *
 * @param props - Component properties
 * @param props.tasks - Current tasks array
 * @param props.setTasks - State setter for tasks
 * @param props.showNotification - Function to show UI notifications
 */
export function TaskWebMCPTools({ tasks, setTasks, showNotification }: TaskWebMCPToolsProps) {
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
      const newTask = createTask({ title, description, priority, category });
      setTasks((prev) => [...prev, newTask]);
      showNotification(`Added task: ${title}`, 'success');

      return {
        success: true,
        message: `Task "${title}" added successfully with ${priority} priority`,
        taskId: newTask.id,
      };
    },
  });

  useWebMCP({
    name: 'complete_task',
    description: 'Mark a task as completed',
    inputSchema: {
      taskId: z.string().describe('ID of the task to complete'),
    },
    handler: async ({ taskId }) => {
      const [updatedTasks, task] = updateTaskCompletion(tasks, taskId, true);

      if (!task) {
        showNotification('Task not found', 'error');
        return { success: false, message: 'Task not found' };
      }

      setTasks(updatedTasks);
      showNotification(`Completed: ${task.title}`, 'success');

      return {
        success: true,
        message: `Task "${task.title}" marked as completed`,
      };
    },
  });

  useWebMCP({
    name: 'delete_task',
    description: 'Delete a task from the task manager',
    inputSchema: {
      taskId: z.string().describe('ID of the task to delete'),
    },
    handler: async ({ taskId }) => {
      const [updatedTasks, task] = removeTask(tasks, taskId);

      if (!task) {
        showNotification('Task not found', 'error');
        return { success: false, message: 'Task not found' };
      }

      setTasks(updatedTasks);
      showNotification(`Deleted: ${task.title}`, 'success');

      return {
        success: true,
        message: `Task "${task.title}" deleted`,
      };
    },
  });

  useWebMCP({
    name: 'list_tasks',
    description: 'Get a list of all tasks with optional filtering',
    inputSchema: {
      filter: z.enum(['all', 'active', 'completed']).describe('Filter tasks by status').optional().default('all'),
      category: z.string().describe('Filter by category (optional)').optional(),
    },
    handler: async ({ filter, category }) => {
      const filteredTaskList = filterTasks(tasks, filter as TaskFilter, category);

      const taskList = filteredTaskList.map((t) => ({
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
        filteredCount: filteredTaskList.length,
        tasks: taskList,
      };
    },
  });

  useWebMCP({
    name: 'update_task_priority',
    description: 'Change the priority level of a task',
    inputSchema: {
      taskId: z.string().describe('ID of the task to update'),
      priority: z.enum(['low', 'medium', 'high']).describe('New priority level'),
    },
    handler: async ({ taskId, priority }) => {
      const [updatedTasks, task] = updateTaskPriority(tasks, taskId, priority);

      if (!task) {
        showNotification('Task not found', 'error');
        return { success: false, message: 'Task not found' };
      }

      setTasks(updatedTasks);
      showNotification(`Updated priority for: ${task.title}`, 'success');

      return {
        success: true,
        message: `Task "${task.title}" priority updated to ${priority}`,
      };
    },
  });

  useWebMCP({
    name: 'get_task_stats',
    description: 'Get statistics about tasks',
    inputSchema: {},
    handler: async () => {
      const stats = calculateTaskStats(tasks);

      return {
        success: true,
        stats,
      };
    },
  });

  return null;
}
