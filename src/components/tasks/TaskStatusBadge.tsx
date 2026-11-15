import type { TaskStatus } from '../../lib/api/tasks'

export const taskStatusLabels: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecha',
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`task-badge task-badge--${status}`}>
      {taskStatusLabels[status]}
    </span>
  )
}
