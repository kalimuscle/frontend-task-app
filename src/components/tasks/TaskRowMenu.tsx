import { Menu } from '@base-ui/react/menu'
import { MoreVertical } from 'lucide-react'
import type { Task } from '../../lib/api/tasks'

export function TaskRowMenu({
  task,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: {
  task: Task
  canDelete: boolean
  onView: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className="tasks-table__actions-button"
        aria-label={`Acciones de la tarea ${task.title}`}
      >
        <MoreVertical size={18} aria-hidden="true" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup className="app-menu">
            <Menu.Item className="app-menu__item" onClick={() => onView(task)}>
              Ver tarea
            </Menu.Item>
            <Menu.Item className="app-menu__item" onClick={() => onEdit(task)}>
              Editar
            </Menu.Item>
            {canDelete ? (
              <Menu.Item
                className="app-menu__item app-menu__item--danger"
                onClick={() => onDelete(task)}
              >
                Eliminar
              </Menu.Item>
            ) : null}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
