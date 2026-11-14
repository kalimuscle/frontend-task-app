import { ArrowUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomeFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__inner">
        <div>
          <p className="site-footer__brand">Tarea</p>
          <p className="site-footer__copy">
            Prueba técnica de una aplicación de gestión de tareas en React y
            Node.js.
          </p>
        </div>
        <Link className="site-footer__top" to="/#inicio">
          Volver arriba
          <ArrowUp size={16} aria-hidden="true" />
        </Link>
      </div>
    </footer>
  )
}
