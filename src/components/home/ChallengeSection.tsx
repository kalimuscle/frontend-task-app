import { Check, GitBranch, Timer } from 'lucide-react'

export function ChallengeSection() {
  return (
    <section className="challenge-section" id="prueba" aria-labelledby="challenge-title">
      <div className="page-shell">
        <div className="challenge-section__intro">
          <p className="section-kicker section-kicker--light">El enunciado</p>
          <h2 className="section-title" id="challenge-title">
            En qué consiste la prueba
          </h2>
          <p className="section-copy">
            Una app pequeña de gestión de tareas con backend y frontend, ambos
            en TypeScript. El objetivo es construir un flujo completo y
            explicar con criterio las decisiones tomadas.
          </p>
        </div>

        <div className="challenge-grid">
          <article className="challenge-group">
            <p className="challenge-group__label">Backend</p>
            <h3>Una API con contrato claro</h3>
            <ul className="challenge-list">
              <li>
                <Check size={18} aria-hidden="true" />
                Crear, listar y cambiar el estado de tareas mediante una API
                REST.
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                Validar los datos y responder con los códigos HTTP correctos.
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                Persistir las tareas en SQLite o PostgreSQL.
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                Filtrar las tareas por estado.
              </li>
            </ul>
          </article>

          <article className="challenge-group">
            <p className="challenge-group__label">Frontend</p>
            <h3>Una interfaz conectada a la API</h3>
            <ul className="challenge-list">
              <li>
                <Check size={18} aria-hidden="true" />
                Listar tareas y filtrarlas por estado.
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                Crear tareas con un formulario validado.
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                Cambiar el estado desde la interfaz.
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                Mostrar estados de carga y error visibles en la interfaz.
              </li>
            </ul>
          </article>

          <article className="challenge-group">
            <p className="challenge-group__label">Calidad</p>
            <h3>Software que se puede verificar</h3>
            <ul className="challenge-list">
              <li>
                <Check size={18} aria-hidden="true" />
                Al menos 2 tests de backend y 2 de frontend.
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                Documentar la ejecución, decisiones, próximos pasos y uso de la
                IA.
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                Facilitar el arranque local, idealmente con un solo comando o
                Docker Compose.
              </li>
            </ul>
          </article>
        </div>

        <div className="delivery-panel">
          <div className="delivery-panel__icon" aria-hidden="true">
            <GitBranch size={27} />
          </div>
          <div className="delivery-panel__copy">
            <p>Entrega</p>
            <h3>Un repositorio público, listo para revisar.</h3>
            <span>
              El resultado incluirá el enlace a GitHub, las instrucciones para
              ejecutar el proyecto y el tiempo total de desarrollo.
            </span>
          </div>
          <div className="delivery-panel__meta">
            <span>
              <Timer size={17} aria-hidden="true" />
              Plazo solicitado: 48 horas
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
