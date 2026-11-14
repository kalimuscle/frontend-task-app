const tasks = [
  {
    title: 'Definir los endpoints de tareas',
    owner: 'Backend',
    status: 'En curso',
    className: 'task-board__item--progress',
  },
  {
    title: 'Preparar el formulario de creación',
    owner: 'Frontend',
    status: 'Pendiente',
    className: 'task-board__item--pending',
  },
  {
    title: 'Modelar la persistencia inicial',
    owner: 'Datos',
    status: 'Pendiente',
    className: 'task-board__item--pending',
  },
  {
    title: 'Cubrir los casos principales',
    owner: 'Calidad',
    status: 'Hecha',
    className: 'task-board__item--done',
  },
] as const

export function TaskBoardPreview() {
  return (
    <figure className="task-board" aria-labelledby="task-board-title">
      <figcaption className="visually-hidden" id="task-board-title">
        Vista previa de un tablero de tareas
      </figcaption>

      <div className="task-board__header">
        <div>
          <p className="task-board__eyebrow">Vista general</p>
          <h2 className="task-board__title">Tareas del equipo</h2>
        </div>
        <span className="task-board__connection">
          <span className="task-board__connection-dot" aria-hidden="true" />
          API conectada
        </span>
      </div>

      <div className="task-board__filters" aria-label="Filtros de estado">
        <span className="task-board__filter task-board__filter--active">
          Todas <strong>6</strong>
        </span>
        <span className="task-board__filter">
          Pendiente <strong>2</strong>
        </span>
        <span className="task-board__filter">
          En curso <strong>3</strong>
        </span>
        <span className="task-board__filter">
          Hecha <strong>1</strong>
        </span>
      </div>

      <ul className="task-board__list">
        {tasks.map((task) => (
          <li className={`task-board__item ${task.className}`} key={task.title}>
            <span className="task-board__check" aria-hidden="true" />
            <span className="task-board__task-copy">
              <strong>{task.title}</strong>
              <span>{task.owner}</span>
            </span>
            <span className="task-board__status">{task.status}</span>
          </li>
        ))}
      </ul>

      <div className="task-board__footer">
        <span>Última sincronización</span>
        <strong>Ahora</strong>
      </div>
    </figure>
  )
}
