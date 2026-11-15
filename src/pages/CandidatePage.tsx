import { Code2, Layers3, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

const summary =
  'Desarrollador de software con más de 20 años de experiencia diseñando y desarrollando aplicaciones web y móviles, y más de 3 años en el desarrollo de aplicaciones blockchain. Especializado en soluciones de extremo a extremo con MERN, Next.js, React Native, RDBMS y soluciones blockchain con Hardhat, Brownie y Forge. Comprometido con entregar soluciones innovadoras y escalables.'

const skills = [
  {
    label: 'Lenguajes de programación',
    values: [
      'JavaScript',
      'Solidity',
      'Python',
      'TypeScript',
      'PHP',
      'Java',
    ],
  },
  {
    label: 'Frameworks y librerías',
    values: [
      'React',
      'Node.js',
      'Angular',
      'Next.js',
      'Express.js',
      'Ethers.js',
      'Web3.js',
    ],
  },
  {
    label: 'Blockchain',
    values: [
      'Solidity',
      'Forge',
      'Hardhat',
      'Truffle',
      'Brownie',
      'Solmate',
      'OpenZeppelin',
      'PBRMath',
    ],
  },
  {
    label: 'Bases de datos',
    values: [
      'MongoDB',
      'PostgreSQL',
      'MySQL',
      'Redis',
      'SQL Server',
    ],
  },
  {
    label: 'Control de versiones',
    values: ['Git', 'GitHub', 'GitLab'],
  },
  {
    label: 'DevOps y herramientas',
    values: ['Docker', 'Jenkins', 'AWS', 'Azure', 'CI/CD'],
  },
  { label: 'Metodologías ágiles', values: ['Scrum'] },
  { label: 'Agentes de IA', values: ['Codex', 'OpenCode'] },
  { label: 'Inferencia de LLM', values: ['llama.cpp', 'vLLM'] },
]

const experience = [
  {
    role: 'Desarrollador Fullstack',
    company: 'Geocuba',
    period: '09/2007 – 12/2011',
    body: [
      'Como desarrollador full-stack en Geocuba me especialicé en diseñar, desarrollar y desplegar tres tipos de aplicaciones: inicialmente trabajé como desarrollador 3D de simuladores interactivos con OpenGL, creando diseños 3D muy funcionales para estudios y simulaciones de entornos virtuales. Después desarrollé una aplicación web para el sistema interno del Departamento Meteorológico, para llevar el registro y la calibración de instrumentos topogeodésicos, con Laravel. Finalmente desarrollé una aplicación de escritorio en Java para estudios de asentamientos del terreno.',
    ],
    achievements: [
      'El modelo de simulación interactiva 3D pasó a formar parte del portafolio de Geocuba para sus clientes.',
      'El sistema web para el Departamento Meteorológico mejoró la productividad en un 35 % y la disponibilidad de datos para los clientes en más de un 80 %.',
      'La aplicación de asentamientos permitió evaluaciones más precisas de la subsidencia del terreno en el Túnel de La Habana.',
    ],
    tools: ['OpenGL', 'Laravel', 'Java'],
  },
  {
    role: 'Desarrollador Frontend y Móvil',
    company: 'Gmixon',
    period: '02/2012 – 05/2015',
    body: [
      'Gmixon era una empresa con base en Francia, donde me especialicé en desarrollo frontend para clientes franceses, trabajando principalmente con JavaScript, HTML y CSS.',
    ],
    achievements: [
      'Contribuí al desarrollo de una experiencia web inmersiva para el equipo de fútbol francés Paris Saint-Germain (PSG).',
    ],
    tools: ['JavaScript', 'HTML', 'CSS', 'jQuery'],
  },
  {
    role: 'Desarrollador Fullstack',
    company: 'Ninjacuba',
    period: '09/2015 – 11/2019',
    body: [
      'Ninjacuba fue una startup cubana que conectaba a profesionales tecnológicos con empleadores de todo el mundo. Lideré el equipo de desarrollo y establecí la arquitectura de la aplicación web de la empresa, participando en todas las etapas del desarrollo, incluido el modelo de negocio.',
    ],
    achievements: [
      'Ninjacuba ganó el concurso 10x10k como mejor startup tecnológica de Cuba, lo que me permitió conocer en Silicon Valley a desarrolladores de Google, Facebook, Twitter y Uber.',
      'Ninjacuba facilitó el trabajo de más de 15 000 profesionales con clientes de todo el mundo, de los cuales más de 3 600 consecugieron reubicarse en trabajos remotos.',
    ],
    tools: [
      'JavaScript',
      'HTML',
      'CSS',
      'React',
      'GraphQL',
      'AWS',
      'REST API',
      'CI/CD',
      'Bitbucket',
    ],
  },
  {
    role: 'Desarrollador Web3',
    company: 'Clientes múltiples',
    period: '02/2020 – 10/2023',
    body: [
      'Trabajé como desarrollador blockchain para varios clientes, implementando experiencias NFT, servicios de pago con criptomonedas y un proyecto de organización continua. El trabajo de NFT fue para el centro cultural Fábrica de Arte, vinculado con diseñadores gráficos. Desarrollé una pasarela de pagos con criptomonedas para Aeroenvío. Después de formarme en organizaciones continuas y curvas de enlace aumentadas (ABC, Augmented Bonding Curves), implementé un sistema para ayudar a pequeñas y medianas empresas con mecanismos de financiación que protegen el capital de los inversores.',
    ],
    achievements: [
      'El proyecto NFT se presentó en exclusiva en las presentaciones de la Fábrica de Arte.',
      'La pasarela de pagos ofreció a Aeroenvío una nueva forma de pago económica, reduciendo los costes de comisión.',
    ],
    tools: [
      'Forge',
      'Truffle',
      'Hardhat',
      'Solidity',
      'React',
      'Next.js',
      'REST API',
      'Python',
    ],
  },
  {
    role: 'Desarrollador Frontend',
    company: 'Agence',
    period: '01/2024 – 12/2024',
    body: [
      'Agence, una empresa brasileña, me contrató para desarrollar una aplicación de ingeniería civil. Me correspondía crear la propuesta para el cliente y, una vez aceptada, completar la solución frontend.',
    ],
    achievements: [],
    tools: ['Next.js', 'React', 'Tailwind', 'REST API'],
  },
  {
    role: 'Desarrollador Fullstack',
    company: 'Cuban Engineer',
    period: '03/2025 – 05/2026',
    body: [
      'Aquí trabajé principalmente en dos proyectos: un sistema de ticketing para Brascuba y un sistema full-stack para un proyecto llamado Citykleta, que requería una aplicación móvil multiplataforma para consultar la disponibilidad de bicicletas, así como un panel de administración para gestionar el sistema.',
      'En el caso de Brascuba, inicialmente la empresa tenía un proceso muy manual para gestionar las quejas e incidencias de los clientes. Los operarios de campo recogían los comentarios de los clientes mediante una aplicación móvil, a menudo como grabaciones de audio. Después, tenían que revisar manualmente cada grabación, entender el problema, crear el ticket correspondiente y remitirlo al departamento adecuado. El reto principal consistía en automatizar ese proceso sin perder el contexto ni el significado de la queja del cliente.',
    ],
    achievements: [
      'Integré el modelo LFM de Liquid AI en el flujo de gestión de tickets.',
      'Configuré y adapté el modelo para entender transcripciones de audio en español, extraer la información relevante, identificar el tipo de incidencia y determinar qué departamento debía gestionarla.',
      'Implementé un mecanismo de tool-calling que permitía al modelo de IA interactuar directamente con la API backend de la aplicación. Según la decisión del modelo, podía enrutar cada ticket automáticamente al departamento correspondiente.',
    ],
    tools: ['Liquid LFM LLM', 'llama.cpp', 'LangChain'],
  },
  {
    role: 'Desarrollador Fullstack',
    company: 'Freelancer',
    period: '06/2026 – 09/2026',
    body: [
      'Desarrollo de un sistema CRM para gestionar la información de proyectos catastrales para una pequeña empresa con sede en Miami.',
    ],
    achievements: ['Desarrollo totalmente agéntico del proyecto.'],
    tools: [
      'OpenCode',
      'MiniMax M3',
      'DeepSeek v4',
      'Qwen 3.8',
      'Spec Driven (superpowers)',
      'Coolify',
      'Next.js 16',
      'React Email',
    ],
  },
]

export function CandidatePage() {
  usePageTitle('Información del candidato | Tarea')

  return (
    <main className="detail-page" id="contenido" tabIndex={-1}>
      <section className="detail-hero">
        <div className="page-shell detail-hero__grid">
          <div>
            <p className="section-kicker">Información del candidato</p>
            <h1 className="detail-title">Víctor Manuel Moratón Hernández</h1>
            <p className="detail-lead">{summary}</p>

            <ul className="candidate-contact">
              <li>La Habana, Cuba</li>
              <li>
                <a href="mailto:victor.moraton@gmail.com">
                  victor.moraton@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+5358908224">+53 58908224</a>
              </li>
              <li>
                <a
                  href="https://github.com/kalimuscle"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/kalimuscle
                </a>
              </li>
            </ul>
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

      <section
        className="candidate-section candidate-section--canvas"
        aria-labelledby="skills-title"
      >
        <div className="page-shell">
          <p className="section-kicker">Competencias técnicas</p>
          <h2 className="section-title" id="skills-title">
            Stack, herramientas y metodologías.
          </h2>

          <dl className="skill-list">
            {skills.map((skill) => (
              <div className="skill-list__item" key={skill.label}>
                <dt className="skill-list__label">{skill.label}</dt>
                <dd className="skill-list__values">
                  {skill.values.map((value) => (
                    <span className="skill-tag" key={value}>
                      {value}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="candidate-section" aria-labelledby="experience-title">
        <div className="page-shell">
          <p className="section-kicker">Experiencia profesional</p>
          <h2 className="section-title" id="experience-title">
            Más de 20 años construyendo software.
          </h2>

          <ol className="timeline">
            {experience.map((job) => (
              <li className="timeline__item" key={`${job.company}-${job.period}`}>
                <div className="timeline__head">
                  <div>
                    <h3 className="timeline__role">{job.role}</h3>
                    <p className="timeline__company">
                      {job.company} · La Habana, Cuba
                    </p>
                  </div>
                  <span className="timeline__dates">{job.period}</span>
                </div>

                {job.body.map((paragraph) => (
                  <p className="timeline__text" key={paragraph}>
                    {paragraph}
                  </p>
                ))}

                {job.achievements.length > 0 ? (
                  <ul className="timeline__list">
                    {job.achievements.map((achievement) => (
                      <li key={achievement}>{achievement}</li>
                    ))}
                  </ul>
                ) : null}

                <p className="timeline__tools">
                  <strong>Herramientas y tecnologías:</strong> {job.tools.join(', ')}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="candidate-section candidate-section--canvas"
        aria-labelledby="profile-title"
      >
        <div className="page-shell candidate-grid candidate-grid--wide">
          <div className="candidate-block">
            <p className="section-kicker">Educación</p>
            <h2 className="section-title" id="profile-title">
              Formación académica.
            </h2>
            <p className="section-copy">
              Licenciatura en Ingeniería Informática, Universidad Tecnológica
              de Cuba · La Habana, Cuba | 2015.
            </p>
          </div>

          <div className="candidate-block">
            <p className="section-kicker">Proyecto destacado</p>
            <h3 className="candidate-block__title">Ninjacuba</h3>
            <p className="section-copy">
              Plataforma que conectaba a profesionales tecnológicos con
              clientes globales. Rol: arquitecto principal y desarrollador.
            </p>
            <p className="section-copy">
              Ganó el concurso 10x10k como mejor startup tecnológica de Cuba.
              Más de 15 000 profesionales trabajaron con clientes de todo el
              mundo y más de 3 600 consecugieron trabajos remotos.
            </p>
            <p className="timeline__tools">
              <strong>Tecnologías:</strong> JavaScript, HTML, CSS, React,
              GraphQL, AWS, REST API, CI/CD, Bitbucket.
            </p>
          </div>

          <div className="candidate-block">
            <p className="section-kicker">Idiomas</p>
            <h3 className="candidate-block__title">Español e inglés</h3>
            <ul className="candidate-plain-list">
              <li>Español: nativo.</li>
              <li>Inglés: avanzado (B2).</li>
            </ul>
          </div>

          <div className="candidate-block">
            <p className="section-kicker">Intereses y actividades</p>
            <h3 className="candidate-block__title">Divulgación de blockchain</h3>
            <p className="section-copy">
              Miembro activo de la comunidad blockchain en Cuba, dedicado a la
              educación y difusión de esta tecnología. Ofrezco cursos gratuitos
              para formar a colegas y al público en general sobre los
              fundamentos de blockchain, su impacto en la economía global y sus
              beneficios en el contexto cubano. Con estos programas busco que
              las personas comprendan y aprovechen las oportunidades que
              blockchain ofrece, tanto a nivel local como internacional. Mi
              objetivo es promover la adopción de tecnología descentralizada y
              contribuir al desarrollo de un ecosistema blockchain sólido en
              Cuba.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
