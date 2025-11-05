/**
 * UI utility functions
 */

import type { TaskPriority } from '../types';

/**
 * Get the color associated with a priority level
 *
 * @param priority - Task priority level
 * @returns Hex color code
 */
export function getPriorityColor(priority: TaskPriority): string {
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
}
