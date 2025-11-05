/**
 * TaskFilter component for filtering tasks
 */

import type { TaskFilter } from '../types';

interface TaskFilterProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

/**
 * Renders filter buttons for task list
 *
 * @param props - Component properties
 * @param props.filter - Current filter setting
 * @param props.onFilterChange - Callback when filter changes
 */
export function TaskFilterButtons({ filter, onFilterChange }: TaskFilterProps) {
  return (
    <section className="filter-section">
      <button
        className={filter === 'all' ? 'active' : ''}
        onClick={() => onFilterChange('all')}
      >
        All Tasks
      </button>
      <button
        className={filter === 'active' ? 'active' : ''}
        onClick={() => onFilterChange('active')}
      >
        Active
      </button>
      <button
        className={filter === 'completed' ? 'active' : ''}
        onClick={() => onFilterChange('completed')}
      >
        Completed
      </button>
    </section>
  );
}
