import { Code2, Layers3, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export function CandidatePage() {
  usePageTitle('Información del candidato | Tarea')

  return (
    <main className="detail-page" id="contenido" tabIndex={-1}>
      <section className="detail-hero">
        <div className="page-shell detail-hero__grid">
          <div>
            <p className="section-kicker">Información del candidato</p>
            <h1 className="detail-title">
              Un perfil full-stack con foco en producto y calidad.
            </h1>
            <p className="detail-lead">
              Me centro en convertir requisitos claros en software mantenible:
              interfaces que explican lo que ocurre, APIs con contratos sólidos
              y decisiones que pueden revisarse.
            </p>
          </div>

          <aside className="detail-hero__aside" aria-label="Perfil">
            <p>Perfil</p>
            <blockquote>
              Frontend, backend y calidad trabajando como un único producto.
            </blockquote>
          </aside>
        </div>
      </section>

      <section className="candidate-section" aria-labelledby="candidate-title">
        <div className="page-shell candidate-grid">
          <div className="candidate-profile">
            <p className="section-kicker">Cómo trabajo</p>
            <h2 className="section-title" id="candidate-title">
              De la necesidad al software verificable.
            </h2>
            <p className="section-copy">
              Primero entiendo el flujo completo y los estados que importan.
              Después elijo la solución más simple que satisface el requisito,
              defino los contratos entre capas y termino verificando el
              comportamiento real.
            </p>

            <div className="candidate-actions">
              <Link className="button button--primary" to="/tech-stack">
                Conocer el stack
              </Link>
              <Link className="button button--quiet" to="/#prueba">
                Ver la prueba
              </Link>
            </div>
          </div>

          <dl className="candidate-values">
            <div className="candidate-values__item">
              <dt>
                <Code2 size={21} aria-hidden="true" />
                Enfoque técnico
              </dt>
              <dd>
                TypeScript compartido entre frontend y backend, contratos REST
                claros y validación con Zod en los límites del sistema.
              </dd>
            </div>
            <div className="candidate-values__item">
              <dt>
                <Layers3 size={21} aria-hidden="true" />
                Criterio de producto
              </dt>
              <dd>
                Estados de carga, error y vacío visibles; mensajes que explican
                qué ocurrió y cuál es el siguiente paso.
              </dd>
            </div>
            <div className="candidate-values__item">
              <dt>
                <UsersRound size={21} aria-hidden="true" />
                Comunicación
              </dt>
              <dd>
                Decisiones documentadas, README útil y explicación de los
                límites, las alternativas y los próximos pasos.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  )
}
