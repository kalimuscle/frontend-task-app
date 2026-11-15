import { ClipboardList, RefreshCw } from 'lucide-react'
import { getApiErrorMessage } from '../../lib/api/errors'
import type { Task } from '../../lib/api/tasks'
import { TaskRowMenu } from './TaskRowMenu'
import { TaskStatusBadge } from './TaskStatusBadge'

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function TasksTable({
  tasks,
  isPending,
  isError,
  error,
  onRetry,
  assigneeName,
  canDelete,
  onViewTask,
  onEditTask,
  onDeleteTask,
}: {
  tasks: Task[]
  isPending: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  assigneeName: (assigneeId: string) => string | undefined
  canDelete: boolean
  onViewTask: (task: Task) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
}) {
  if (isPending) {
    return (
      <div className="tasks-state" role="status">
        <span className="route-state__indicator" aria-hidden="true" />
        Cargando tus tareas...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="tasks-state tasks-state--error" role="alert">
        <div>
          <strong>No se pudieron cargar las tareas.</strong>
          <span>{getApiErrorMessage(error)}</span>
        </div>
        <button className="button button--quiet" type="button" onClick={onRetry}>
          <RefreshCw size={16} aria-hidden="true" />
          Reintentar
        </button>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="tasks-state tasks-state--empty">
        <ClipboardList size={28} aria-hidden="true" />
        <div>
          <strong>Todavía no hay tareas.</strong>
          <span>Cuando se creen tareas aparecerán en este espacio.</span>
        </div>
      </div>
    )
  }

  return (
    <table className="tasks-table">
      <caption className="visually-hidden">Tareas</caption>
      <thead>
        <tr>
          <th scope="col">Tarea</th>
          <th scope="col">Estado</th>
          <th scope="col">Responsable</th>
          <th scope="col">Actualizada</th>
          <th scope="col" aria-label="Acciones" />
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr className="tasks-table__row" key={task.id}>
            <td className="tasks-table__cell">
              <span className="tasks-table__title">{task.title}</span>
            </td>
            <td className="tasks-table__cell">
              <TaskStatusBadge status={task.status} />
            </td>
            <td className="tasks-table__cell">
              <span className="tasks-table__assignee">
                {assigneeName(task.assigneeId) ?? task.assigneeId}
              </span>
            </td>
            <td className="tasks-table__cell">
              <span className="tasks-table__date">
                {dateFormatter.format(new Date(task.updatedAt))}
              </span>
            </td>
            <td className="tasks-table__cell tasks-table__actions">
              <TaskRowMenu
                task={task}
                canDelete={canDelete}
                onView={onViewTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
