/**
 * Type definitions for the task management application
 */

/**
 * Priority levels for tasks
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Filter options for task list
 */
export type TaskFilter = 'all' | 'active' | 'completed';

/**
 * Notification types for UI feedback
 */
export type NotificationType = 'success' | 'error';

/**
 * Represents a task in the task manager
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  category: string;
  completed: boolean;
  createdAt: Date;
}

/**
 * Statistics about tasks
 */
export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  completionRate: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Notification state
 */
export interface Notification {
  message: string;
  type: NotificationType;
}
