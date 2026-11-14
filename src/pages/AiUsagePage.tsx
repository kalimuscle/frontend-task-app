import { Bot, Cpu, ExternalLink } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

const methods = [
  {
    name: 'obra/superpowers',
    href: 'https://github.com/obra/superpowers',
    description:
      'Skills especializadas y una metodología de desarrollo de software que estructura el trabajo desde la exploración hasta la verificación.',
    type: 'Skills y metodología',
  },
  {
    name: 'autoskills',
    href: 'https://www.autoskills.sh/',
    description:
      'Detecta automáticamente el stack tecnológico e instala las skills más adecuados para el proyecto.',
    type: 'Detección de stack',
  },
  {
    name: 'modern-web-guidance',
    href: 'https://github.com/GoogleChrome/modern-web-guidance',
    description:
      'Guía actualizada por Google con prácticas modernas para interfaces, accesibilidad, rendimiento y APIs web.',
    type: 'Guías web modernas',
  },
] as const

export function AiUsagePage() {
  usePageTitle('Uso de la IA | Tarea')

  return (
    <main className="detail-page" id="contenido" tabIndex={-1}>
      <section className="detail-hero detail-hero--dark">
        <div className="page-shell detail-hero__grid">
          <div>
            <p className="section-kicker section-kicker--light">Uso de la IA</p>
            <h1 className="detail-title">
              La IA acelera el trabajo; el criterio sigue siendo humano.
            </h1>
            <p className="detail-lead">
              Se utilizó un coding agent como collaborator para explorar el
              proyecto, implementar cambios y acelerar verificaciones. Cada
              resultado se revisó antes de darlo por terminado.
            </p>
          </div>

          <aside className="detail-hero__aside" aria-label="Principio de uso de IA">
            <p>Criterio de uso</p>
            <blockquote>
              La IA propone y ejecuta; la persona define, valida y decide.
            </blockquote>
          </aside>
        </div>
      </section>

      <section className="ai-summary" aria-labelledby="ai-summary-title">
        <div className="page-shell">
          <div className="ai-summary__intro">
            <p className="section-kicker">Herramientas principales</p>
            <h2 className="section-title" id="ai-summary-title">
              Un agente especializado y un modelo potente.
            </h2>
          </div>

          <div className="ai-tool-grid">
            <article className="ai-tool ai-tool--primary">
              <span className="ai-tool__icon" aria-hidden="true">
                <Bot size={27} />
              </span>
              <p>Coding agent CLI</p>
              <h3>OpenCode</h3>
              <span>
                El agente exploró el código, planificó el trabajo y colaboró
                en la implementación de la aplicación.
              </span>
            </article>

            <article className="ai-tool">
              <span className="ai-tool__icon" aria-hidden="true">
                <Cpu size={27} />
              </span>
              <p>Modelo utilizado</p>
              <h3>MiniMax M3</h3>
              <span>
                Se encargó de redactar, explicar, proponer y refinar el código
                junto con el agente.
              </span>
            </article>
          </div>
        </div>
      </section>

      <section className="method-section" aria-labelledby="method-title">
        <div className="page-shell">
          <div className="method-section__intro">
            <p className="section-kicker">Contexto especializado</p>
            <h2 className="section-title" id="method-title">
              Skills y metodologías aplicadas.
            </h2>
            <p className="section-copy">
              Estas herramientas aportaron contexto, disciplina y prácticas
              concretas. No sustituyen las decisiones técnicas: las orientan y
              ayudan a verificarlas.
            </p>
          </div>

          <ul className="method-list">
            {methods.map((method) => (
              <li className="method-list__item" key={method.name}>
                <div className="method-list__copy">
                  <p>{method.type}</p>
                  <h3>
                    <a href={method.href} target="_blank" rel="noopener noreferrer">
                      {method.name}
                      <ExternalLink size={18} aria-hidden="true" />
                      <span className="visually-hidden">
                        {' '}
                        (abre en una pestaña nueva)
                      </span>
                    </a>
                  </h3>
                  <span>{method.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
