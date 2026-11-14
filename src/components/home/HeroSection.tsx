import { TaskBoardPreview } from './TaskBoardPreview'

export function HeroSection() {
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="page-shell hero__grid">
        <div className="hero__copy">
          <p className="hero__kicker">
            <span className="hero__kicker-dot" aria-hidden="true" />
            React + Node.js + TypeScript
          </p>

          <h1 className="hero__title" id="hero-title" tabIndex={-1}>
            Gestión de tareas, de extremo a extremo.
          </h1>

          <p className="hero__lead">
            Este proyecto sirve para aplicar a un trabajo y demostrar cómo
            convierto un requisitos técnico en un producto Full Stack claro,
            validado y listo para revisar.
          </p>

          <div className="hero__actions">
            <a className="button button--primary" href="#prueba">
              Ver qué evaluan
            </a>
            <a className="button button--quiet" href="#arquitectura">
              Cómo se construirá
            </a>
          </div>

          <ul className="hero__proof" aria-label="Pilares del proyecto">
            <li>API REST</li>
            <li>Persistencia real</li>
            <li>Tests en dos capas</li>
          </ul>
        </div>

        <div className="hero__visual">
          <TaskBoardPreview />
          <p className="hero__visual-note">
            Una vista simple para entender qué está pendiente, quién lo tiene
            y en qué estado.
          </p>
        </div>
      </div>
    </section>
  )
}
