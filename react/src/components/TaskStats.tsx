/**
 * TaskStats component for displaying task statistics
 */

import type { TaskStats } from '../types';

interface TaskStatsProps {
  stats: TaskStats;
}

/**
 * Displays statistics about tasks in card format
 *
 * @param props - Component properties
 * @param props.stats - Task statistics object
 */
export function TaskStatsDisplay({ stats }: TaskStatsProps) {
  return (
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
  );
}
