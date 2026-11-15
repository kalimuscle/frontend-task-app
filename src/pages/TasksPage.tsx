import { useState } from 'react'
import { Plus } from 'lucide-react'
import { TaskConfirmDialog } from '../components/tasks/TaskConfirmDialog'
import { TaskDetailDialog } from '../components/tasks/TaskDetailDialog'
import { TaskFormDialog } from '../components/tasks/TaskFormDialog'
import {
  TaskStatusFilter,
  type TaskStatusFilterValue,
} from '../components/tasks/TaskStatusFilter'
import { TasksTable } from '../components/tasks/TasksTable'
import { useSessionQuery } from '../features/auth/use-auth'
import { useDeleteTask, useTasks } from '../features/tasks/use-tasks'
import { useUsers } from '../features/tasks/use-users'
import { usePageTitle } from '../hooks/usePageTitle'
import { getApiErrorMessage } from '../lib/api/errors'
import type { Task } from '../lib/api/tasks'
import { notifyToast } from '../lib/toast-store'

export function TasksPage() {
  usePageTitle('Tus tareas | Tarea')
  const { data: session } = useSessionQuery()
  const isAdmin = session?.user.role === 'ADMIN'

  const [status, setStatus] = useState<TaskStatusFilterValue>('all')
  const [viewedTask, setViewedTask] = useState<Task | null>(null)
  const [editedTask, setEditedTask] = useState<Task | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const tasksQuery = useTasks(status === 'all' ? undefined : status)
  const usersQuery = useUsers({ enabled: isAdmin === true })
  const deleteTask = useDeleteTask()

  const tasks = tasksQuery.data?.items ?? []
  const total = tasksQuery.data?.pagination.total ?? 0

  const assigneeName = (assigneeId: string) => {
    const known = Array.isArray(usersQuery.data)
      ? usersQuery.data.find((user) => user.id === assigneeId)
      : undefined

    if (known) {
      return known.name
    }

    return assigneeId === session?.user.id ? session.user.name : undefined
  }

  const handleDelete = async () => {
    if (!deletingTask) {
      return
    }

    try {
      await deleteTask.mutateAsync(deletingTask.id)
      notifyToast({
        tone: 'success',
        title: 'Tarea eliminada.',
        message: 'La tarea ya no está en la lista.',
      })
      setDeletingTask(null)
    } catch (error) {
      notifyToast({
        tone: 'error',
        title: 'No se pudo eliminar la tarea.',
        message: getApiErrorMessage(error),
      })
    }
  }

  return (
    <main className="tasks-page" id="contenido" tabIndex={-1}>
      <section className="tasks-hero">
        <div className="page-shell tasks-hero__inner">
          <div>
            {/* <p className="section-kicker">Área privada</p>
            <h1>Tus tareas</h1>
            <p>
              Gestiona el trabajo del equipo, consulta estados y mantén cada
              responsabilidad visible.
            </p> */}
          </div>

          {isAdmin ? (
            <button
              className="button button--primary"
              type="button"
              onClick={() => setIsCreating(true)}
            >
              <Plus size={16} aria-hidden="true" />
              Crear Tarea
            </button>
          ) : null}
        </div>
      </section>

      <section className="tasks-section" aria-labelledby="tasks-list-title">
        <div className="page-shell">
          <div className="tasks-section__header">
            <div>
              <p className="section-kicker">Panel de trabajo</p>
              <h2 id="tasks-list-title">Tareas del equipo</h2>
              <TaskStatusFilter value={status} onChange={setStatus} />
            </div>
            {tasksQuery.data ? (
              <span className="tasks-count">
                {total} {total === 1 ? 'tarea' : 'tareas'}
              </span>
            ) : null}
          </div>

          <TasksTable
            tasks={tasks}
            isPending={tasksQuery.isPending}
            isError={tasksQuery.isError}
            error={tasksQuery.error}
            onRetry={() => void tasksQuery.refetch()}
            assigneeName={assigneeName}
            canDelete={isAdmin}
            onViewTask={setViewedTask}
            onEditTask={setEditedTask}
            onDeleteTask={setDeletingTask}
          />

          {total > tasks.length ? (
            <p className="tasks-note">
              Mostrando las primeras {tasks.length} tareas.
            </p>
          ) : null}
        </div>
      </section>

      <TaskDetailDialog
        open={viewedTask !== null}
        task={viewedTask ?? undefined}
        assigneeName={
          viewedTask ? assigneeName(viewedTask.assigneeId) : undefined
        }
        onOpenChange={(open) => {
          if (!open) {
            setViewedTask(null)
          }
        }}
      />

      <TaskFormDialog
        open={isCreating || editedTask !== null}
        mode={editedTask !== null ? 'edit' : 'create'}
        task={editedTask ?? undefined}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false)
            setEditedTask(null)
          }
        }}
      />

      <TaskConfirmDialog
        open={deletingTask !== null}
        task={deletingTask ?? undefined}
        isPending={deleteTask.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTask(null)
          }
        }}
        onConfirm={() => void handleDelete()}
      />
    </main>
  )
}
