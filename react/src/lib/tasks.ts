/**
 * Pure business logic functions for task management
 */

import type { Task, TaskFilter, TaskStats } from '../types';

/**
 * Filter tasks based on completion status and optional category
 *
 * @param tasks - Array of all tasks
 * @param filter - Filter type (all, active, completed)
 * @param category - Optional category filter
 * @returns Filtered array of tasks
 */
export function filterTasks(
  tasks: Task[],
  filter: TaskFilter,
  category?: string
): Task[] {
  let filtered = tasks;

  if (filter === 'active') {
    filtered = filtered.filter((t) => !t.completed);
  } else if (filter === 'completed') {
    filtered = filtered.filter((t) => t.completed);
  }

  if (category) {
    filtered = filtered.filter(
      (t) => t.category.toLowerCase() === category.toLowerCase()
    );
  }

  return filtered;
}

/**
 * Calculate statistics about tasks
 *
 * @param tasks - Array of all tasks
 * @returns Task statistics object
 */
export function calculateTaskStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;

  return {
    total,
    active,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    byPriority: {
      high: tasks.filter((t) => t.priority === 'high' && !t.completed).length,
      medium: tasks.filter((t) => t.priority === 'medium' && !t.completed).length,
      low: tasks.filter((t) => t.priority === 'low' && !t.completed).length,
    },
  };
}

/**
 * Create a new task with default values
 *
 * @param params - Task parameters
 * @returns New task object
 */
export function createTask(params: {
  title: string;
  description?: string;
  priority?: Task['priority'];
  category?: string;
}): Task {
  return {
    id: crypto.randomUUID(),
    title: params.title,
    description: params.description || '',
    priority: params.priority || 'medium',
    category: params.category || 'general',
    completed: false,
    createdAt: new Date(),
  };
}

/**
 * Update a task's completion status
 *
 * @param tasks - Array of all tasks
 * @param taskId - ID of task to update
 * @param completed - New completion status
 * @returns Tuple of [updated tasks array, found task or null]
 */
export function updateTaskCompletion(
  tasks: Task[],
  taskId: string,
  completed: boolean
): [Task[], Task | null] {
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return [tasks, null];
  }

  const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, completed } : t));

  return [updatedTasks, task];
}

/**
 * Update a task's priority
 *
 * @param tasks - Array of all tasks
 * @param taskId - ID of task to update
 * @param priority - New priority level
 * @returns Tuple of [updated tasks array, found task or null]
 */
export function updateTaskPriority(
  tasks: Task[],
  taskId: string,
  priority: Task['priority']
): [Task[], Task | null] {
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return [tasks, null];
  }

  const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, priority } : t));

  return [updatedTasks, task];
}

/**
 * Remove a task by ID
 *
 * @param tasks - Array of all tasks
 * @param taskId - ID of task to remove
 * @returns Tuple of [updated tasks array, removed task or null]
 */
export function removeTask(tasks: Task[], taskId: string): [Task[], Task | null] {
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return [tasks, null];
  }

  const updatedTasks = tasks.filter((t) => t.id !== taskId);

  return [updatedTasks, task];
}
