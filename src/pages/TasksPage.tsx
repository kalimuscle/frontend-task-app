import { ClipboardList, RefreshCw } from 'lucide-react'
import { getApiErrorMessage } from '../lib/api/errors'
import type { TaskStatus } from '../lib/api/tasks'
import { useSessionQuery } from '../features/auth/use-auth'
import { useTasks } from '../features/tasks/use-tasks'
import { usePageTitle } from '../hooks/usePageTitle'

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecha',
}

export function TasksPage() {
  usePageTitle('Tus tareas | Tarea')
  const { data: session } = useSessionQuery()
  const tasksQuery = useTasks()

  return (
    <main className="tasks-page" id="contenido" tabIndex={-1}>
      <section className="tasks-hero">
        <div className="page-shell tasks-hero__inner">
          <div>
            <p className="section-kicker">Área privada</p>
            <h1>Tus tareas</h1>
            <p>
              Gestiona el trabajo del equipo, consulta estados y mantén cada
              responsabilidad visible.
            </p>
          </div>

          {session ? (
            <div className="tasks-profile">
              <span className="tasks-profile__avatar" aria-hidden="true">
                {session.user.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <strong>{session.user.name}</strong>
                <span>{session.user.email}</span>
                <small>{session.user.role}</small>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="tasks-section" aria-labelledby="tasks-list-title">
        <div className="page-shell">
          <div className="tasks-section__header">
            <div>
              <p className="section-kicker">Panel de trabajo</p>
              <h2 id="tasks-list-title">Tareas del equipo</h2>
            </div>
            {tasksQuery.data ? (
              <span className="tasks-count">
                {tasksQuery.data.pagination.total}{' '}
                {tasksQuery.data.pagination.total === 1 ? 'tarea' : 'tareas'}
              </span>
            ) : null}
          </div>

          {tasksQuery.isPending ? (
            <div className="tasks-state" role="status">
              <span className="route-state__indicator" aria-hidden="true" />
              Cargando tus tareas...
            </div>
          ) : null}

          {tasksQuery.isError ? (
            <div className="tasks-state tasks-state--error" role="alert">
              <div>
                <strong>No se pudieron cargar las tareas.</strong>
                <span>{getApiErrorMessage(tasksQuery.error)}</span>
              </div>
              <button
                className="button button--quiet"
                type="button"
                onClick={() => void tasksQuery.refetch()}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Reintentar
              </button>
            </div>
          ) : null}

          {tasksQuery.data?.items.length === 0 ? (
            <div className="tasks-state tasks-state--empty">
              <ClipboardList size={28} aria-hidden="true" />
              <div>
                <strong>Todavía no hay tareas.</strong>
                <span>Cuando se creen tareas aparecerán en este espacio.</span>
              </div>
            </div>
          ) : null}

          {tasksQuery.data && tasksQuery.data.items.length > 0 ? (
            <ul className="tasks-list">
              {tasksQuery.data.items.map((task) => (
                <li className="tasks-list__item" key={task.id}>
                  <span
                    className={`tasks-list__status tasks-list__status--${task.status}`}
                    aria-hidden="true"
                  />
                  <div className="tasks-list__copy">
                    <strong>{task.title}</strong>
                    <span>Responsable: {task.assigneeId}</span>
                  </div>
                  <span className="tasks-list__label">
                    {statusLabels[task.status]}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </main>
  )
}
