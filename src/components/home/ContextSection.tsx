import { Boxes, FileCheck2, ShieldCheck } from 'lucide-react'

export function ContextSection() {
  return (
    <section className="context-section" id="reto" aria-labelledby="context-title">
      <div className="page-shell context-section__grid">
        <div className="context-section__statement">
          <p className="section-kicker">El contexto</p>
          <h2 className="section-title" id="context-title">
            No se trata solo de construir una pantalla.
          </h2>
          <p className="section-copy">
            La prueba pide una aplicación completa: una interfaz que converse
            con una API, datos que sobrevivan a cada ejecución y decisiones
            técnicas que puedan explicarse. Este proyecto documenta ese
            recorrido, no solo el resultado final.
          </p>
        </div>

        <ul className="principle-list" aria-label="Qué demuestra el proyecto">
          <li className="principle-list__item">
            <span className="principle-list__icon" aria-hidden="true">
              <Boxes size={22} />
            </span>
            <div>
              <h3>Pensamiento de producto</h3>
              <p>
                Una solución pequeña, pero con decisiones coherentes de
                extremo a extremo.
              </p>
            </div>
          </li>
          <li className="principle-list__item">
            <span className="principle-list__icon" aria-hidden="true">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h3>Calidad verificable</h3>
              <p>
                Validación, errores correctos y pruebas que cubran los caminos
                importantes.
              </p>
            </div>
          </li>
          <li className="principle-list__item">
            <span className="principle-list__icon" aria-hidden="true">
              <FileCheck2 size={22} />
            </span>
            <div>
              <h3>Decisiones explicadas</h3>
              <p>
                Un README que documente los criterios, los límites y el uso de
                IA durante el desarrollo.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  )
}
