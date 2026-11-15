import type { TaskStatus } from '../../lib/api/tasks'
import { taskStatusLabels } from './TaskStatusBadge'

export type TaskStatusFilterValue = TaskStatus | 'all'

const options: Array<{ value: TaskStatusFilterValue; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: taskStatusLabels.pending },
  { value: 'in_progress', label: taskStatusLabels.in_progress },
  { value: 'done', label: taskStatusLabels.done },
]

export function TaskStatusFilter({
  value,
  onChange,
  counts,
}: {
  value: TaskStatusFilterValue
  onChange: (value: TaskStatusFilterValue) => void
  counts?: Partial<Record<TaskStatusFilterValue, number>>
}) {
  return (
    <div className="tasks-filters" role="group" aria-label="Filtrar por estado">
      {options.map((option) => {
        const isActive = value === option.value
        const count = counts?.[option.value]
        const hasCount = typeof count === 'number'

        return (
          <button
            key={option.value}
            type="button"
            className={isActive ? 'tasks-filter tasks-filter--active' : 'tasks-filter'}
            aria-pressed={isActive}
            aria-label={hasCount ? `${option.label}, ${count}` : undefined}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {hasCount ? (
              <span className="tasks-filter__count" aria-hidden="true">
                {' '}
                {count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
