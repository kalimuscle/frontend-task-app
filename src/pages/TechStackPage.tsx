import { Monitor, Server } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

const frontendStack = [
  {
    label: 'Base',
    items: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
  },
  {
    label: 'Tooling y testing',
    items: ['Vitest', 'Testing Library', 'jest-dom'],
  },
  {
    label: 'Formularios',
    items: ['TanStack Form'],
  },
  {
    label: 'Tablas',
    items: ['TanStack Table'],
  },
  {
    label: 'Validación',
    items: ['Zod'],
  },
  {
    label: 'Autenticación',
    items: ['Better Auth'],
  },
  {
    label: 'Peticiones y estado',
    items: ['Axios', 'TanStack Query'],
  },
] as const

const backendStack = [
  {
    label: 'Runtime y framework',
    items: ['Node.js', 'Express'],
  },
  {
    label: 'API',
    items: ['REST'],
  },
  {
    label: 'ORM',
    items: ['Drizzle'],
  },
  {
    label: 'Base de datos',
    items: ['SQLite'],
  },
  {
    label: 'Autenticación',
    items: ['Better Auth'],
  },
  {
    label: 'Validación',
    items: ['Zod'],
  },
  {
    label: 'Testing',
    items: ['Jest', 'Supertest'],
  },
] as const

export function TechStackPage() {
  usePageTitle('Tech Stack | Tarea')

  return (
    <main className="detail-page" id="contenido" tabIndex={-1}>
      <section className="detail-hero">
        <div className="page-shell detail-hero__grid">
          <div>
            <p className="section-kicker">Tech stack</p>
            <h1 className="detail-title">
              Herramientas elegidas para construir con criterio.
            </h1>
            <p className="detail-lead">
              Cada tecnología cubre una necesidad concreta. El stack mantiene
              TypeScript de extremo a extremo y prioriza contratos claros,
              validación y feedback rápido durante el desarrollo.
            </p>
          </div>

          <aside className="detail-hero__aside" aria-label="Criterio del stack">
            <p>Principio de selección</p>
            <blockquote>
              Menos herramientas redundantes, más responsabilidad sobre cada
              decisión.
            </blockquote>
          </aside>
        </div>
      </section>

      <section className="stack-section" aria-labelledby="stack-title">
        <div className="page-shell">
          <div className="stack-section__intro">
            <p className="section-kicker">Dos capas, un mismo lenguaje</p>
            <h2 className="section-title" id="stack-title">
              El stack completo de la aplicación.
            </h2>
          </div>

          <div className="stack-columns">
            <article className="stack-panel stack-panel--frontend">
              <header className="stack-panel__header">
                <span className="stack-panel__icon" aria-hidden="true">
                  <Monitor size={25} />
                </span>
                <div>
                  <p>Interfaz</p>
                  <h3>Frontend</h3>
                </div>
              </header>

              <p className="stack-panel__intro">
                Estado remoto, formularios, tablas y una experiencia de usuario
                con estados de carga y error visibles.
              </p>

              <dl className="stack-list">
                {frontendStack.map((group) => (
                  <div className="stack-list__row" key={group.label}>
                    <dt>{group.label}</dt>
                    <dd>
                      <ul className="stack-tags">
                        {group.items.map((item) => (
                          <li className="stack-tag" key={item}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="stack-panel stack-panel--backend">
              <header className="stack-panel__header">
                <span className="stack-panel__icon" aria-hidden="true">
                  <Server size={25} />
                </span>
                <div>
                  <p>Servidor</p>
                  <h3>Backend</h3>
                </div>
              </header>

              <p className="stack-panel__intro">
                Una API Express con persistencia real, autenticación,
                validación compartida y pruebas de integración.
              </p>

              <dl className="stack-list">
                {backendStack.map((group) => (
                  <div className="stack-list__row" key={group.label}>
                    <dt>{group.label}</dt>
                    <dd>
                      <ul className="stack-tags">
                        {group.items.map((item) => (
                          <li className="stack-tag" key={item}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
