import { Menu } from '@base-ui/react/menu'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSessionQuery, useSignOutMutation } from '../../features/auth/use-auth'
import { useHealthcheck } from '../../features/tasks/use-healthcheck'

type HealthState = 'checking' | 'ok' | 'down'

const healthLabels: Record<HealthState, string> = {
  checking: 'Comprobando…',
  ok: 'Servidor conectado',
  down: 'Sin conexión',
}

const lastCheckFormatter = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function formatUptime(seconds: number | undefined) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) {
    return '—'
  }

  const minutes = Math.floor(seconds / 60)

  if (minutes < 1) {
    return `${Math.floor(seconds)} s`
  }

  if (minutes < 60) {
    return `${minutes} min`
  }

  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
}

export function TasksHeader() {
  const { data: session } = useSessionQuery()
  const health = useHealthcheck()
  const signOut = useSignOutMutation()

  const state: HealthState =
    health.isError || health.failureCount > 0
      ? 'down'
      : health.isPending
        ? 'checking'
        : 'ok'

  const lastCheck = health.dataUpdatedAt
    ? lastCheckFormatter.format(new Date(health.dataUpdatedAt))
    : '—'
  const uptime = formatUptime(health.data?.server?.uptimeSeconds)

  return (
    <header className="tasks-header">
      <div className="tasks-header__inner page-shell">
        <Link className="site-brand" to="/" aria-label="Tarea, ir al inicio">
          <span className="site-brand__mark" aria-hidden="true">
            <Check size={18} strokeWidth={2.5} />
          </span>
          <span className="site-brand__name">Tarea</span>
          <span className="site-brand__context">Prueba técnica</span>
        </Link>

        <div className="tasks-header__account">
          {session ? (
            <div className="tasks-user">
              <span className="tasks-user__avatar" aria-hidden="true">
                {session.user.name.charAt(0).toUpperCase()}
              </span>
              <div className="tasks-user__details">
                <strong className="tasks-user__name">{session.user.name}</strong>
                <span className="tasks-user__email">{session.user.email}</span>
              </div>
              <span className="tasks-user__role">{session.user.role}</span>
            </div>
          ) : null}

          <Menu.Root>
            <Menu.Trigger className="health-pill">
              <span
                className={`health-pill__dot health-pill__dot--${state}`}
                aria-hidden="true"
              />
              <span className="visually-hidden">Estado del servidor</span>
              <span className="health-pill__label" aria-live="polite">
                {healthLabels[state]}
              </span>
            </Menu.Trigger>

            <Menu.Portal>
              <Menu.Positioner>
                <Menu.Popup className="app-menu">
                  <p className="app-menu__meta">
                    Última comprobación: {lastCheck}
                  </p>
                  <p className="app-menu__meta">Tiempo activo: {uptime}</p>
                  <Menu.Separator className="app-menu__separator" />
                  <Menu.Item
                    className="app-menu__item app-menu__item--danger"
                    onClick={() => signOut.mutate()}
                  >
                    Cerrar sesión
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </div>
    </header>
  )
}
