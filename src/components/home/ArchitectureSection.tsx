import { Code2, Database, Server } from 'lucide-react'

export function ArchitectureSection() {
  return (
    <section
      className="architecture-section"
      id="arquitectura"
      aria-labelledby="architecture-title"
    >
      <div className="page-shell">
        <div className="architecture-section__intro">
          <p className="section-kicker">Arquitectura objetivo</p>
          <h2 className="section-title" id="architecture-title">
            Una idea simple, ejecutada de extremo a extremo.
          </h2>
          <p className="section-copy">
            El frontend no conoce la base de datos y la API no conoce la
            interfaz. Cada capa tiene una responsabilidad clara, lo que reduce
            acoplamiento y hace que los errores sean más fáciles de entender.
          </p>
        </div>

        <div className="architecture-flow" aria-label="Flujo de la arquitectura">
          <article className="architecture-node">
            <span className="architecture-node__icon" aria-hidden="true">
              <Code2 size={25} />
            </span>
            <p className="architecture-node__layer">Frontend</p>
            <h3>React + TypeScript</h3>
            <p>
              Lista, filtros, formulario validado y estados de carga y error
              visibles.
            </p>
          </article>

          <div className="architecture-connector" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <article className="architecture-node">
            <span className="architecture-node__icon" aria-hidden="true">
              <Server size={25} />
            </span>
            <p className="architecture-node__layer">Backend</p>
            <h3>API REST</h3>
            <p>
              Endpoints para crear, listar y actualizar tareas con validación
              y errores HTTP.
            </p>
          </article>

          <div className="architecture-connector" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <article className="architecture-node">
            <span className="architecture-node__icon" aria-hidden="true">
              <Database size={25} />
            </span>
            <p className="architecture-node__layer">Datos</p>
            <h3>SQLite o PostgreSQL</h3>
            <p>
              Persistencia de tareas con un modelo sencillo y consultas
              verificables.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
