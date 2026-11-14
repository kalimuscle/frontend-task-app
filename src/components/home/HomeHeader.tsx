import { Check } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

const pageLinkClass = ({ isActive }: { isActive: boolean }) =>
  `site-nav__link${isActive ? ' site-nav__link--active' : ''}`

export function HomeHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner page-shell">
        <Link className="site-brand" to="/" aria-label="Tarea, ir al inicio">
          <span className="site-brand__mark" aria-hidden="true">
            <Check size={18} strokeWidth={2.5} />
          </span>
          <span className="site-brand__name">Tarea</span>
          <span className="site-brand__context">Prueba técnica</span>
        </Link>

        <nav className="site-nav" aria-label="Principal">
          <ul className="site-nav__list">
            <li>
              <Link className="site-nav__link" to="/#reto">
                El reto
              </Link>
            </li>
            <li>
              <Link className="site-nav__link" to="/#arquitectura">
                Cómo se construirá
              </Link>
            </li>
            <li>
              <NavLink className={pageLinkClass} to="/tech-stack">
                Tech Stack
              </NavLink>
            </li>
            <li>
              <NavLink className={pageLinkClass} to="/uso-de-la-ia">
                Uso de la IA
              </NavLink>
            </li>
            <li>
              <NavLink className={pageLinkClass} to="/candidato">
                Candidato
              </NavLink>
            </li>
            <li>
              <Link className="site-nav__link site-nav__link--accent" to="/#prueba">
                Comenzar
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
