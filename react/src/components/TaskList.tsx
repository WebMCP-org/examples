/**
 * TaskList component for displaying tasks
 */

import type { Task } from '../types';
import { getPriorityColor } from '../lib/ui';

interface TaskListProps {
  tasks: Task[];
}

/**
 * Renders a list of tasks with their details
 *
 * @param props - Component properties
 * @param props.tasks - Array of tasks to display
 */
export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks found. Ask AI to add some tasks!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
          <div className="task-header">
            <h3>{task.title}</h3>
            <span
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            >
              {task.priority}
            </span>
          </div>
          {task.description && <p className="task-description">{task.description}</p>}
          <div className="task-footer">
            <span className="category-tag">{task.category}</span>
            <span className="task-status">{task.completed ? '✅ Completed' : '⏳ Active'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
