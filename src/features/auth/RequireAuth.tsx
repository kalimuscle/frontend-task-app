import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../lib/api/errors'
import { useSessionQuery } from './use-auth'

interface RequireAuthProps {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { data, error, isError, isPending, refetch } = useSessionQuery()

  if (isPending) {
    return (
      <main className="route-state" id="contenido" tabIndex={-1}>
        <div className="page-shell route-state__inner" role="status">
          <span className="route-state__indicator" aria-hidden="true" />
          <p>Comprobando tu sesión...</p>
        </div>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="route-state" id="contenido" tabIndex={-1}>
        <div className="page-shell route-state__inner">
          <p className="route-state__eyebrow">Error de sesión</p>
          <h1>No pudimos comprobar tu acceso.</h1>
          <p role="alert">{getApiErrorMessage(error)}</p>
          <button
            className="button button--primary"
            type="button"
            onClick={() => void refetch()}
          >
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  if (!data) {
    return <Navigate to="/" replace state={{ openAuth: true }} />
  }

  return children
}
