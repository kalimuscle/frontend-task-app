import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Página no encontrada | Tarea')

  return (
    <main className="not-found-page" id="contenido" tabIndex={-1}>
      <div className="page-shell not-found-page__inner">
        <p className="section-kicker">Error 404</p>
        <h1>Esta página no forma parte del proyecto.</h1>
        <p>La ruta solicitada no existe. Puedes volver a la portada.</p>
        <Link className="button button--primary" to="/">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
