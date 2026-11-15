import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { Task } from '../../lib/api/tasks'
import { TaskStatusBadge } from './TaskStatusBadge'

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function TaskDetailDialog({
  open,
  task,
  assigneeName,
  onOpenChange,
}: {
  open: boolean
  task?: Task
  assigneeName?: string
  onOpenChange: (open: boolean) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal()
      } else {
        dialog.setAttribute('open', '')
      }
    }

    if (!open && dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close()
      } else {
        dialog.removeAttribute('open')
      }
    }
  }, [open])

  return (
    <dialog
      className="task-dialog"
      ref={dialogRef}
      aria-labelledby="task-detail-title"
      onClose={() => onOpenChange(false)}
    >
      <div className="task-dialog__surface">
        {open && task ? (
          <>
            <header className="task-dialog__header">
              <p className="task-dialog__eyebrow">Detalle</p>
              <h2 id="task-detail-title">Detalle de la tarea</h2>
              <p>Los datos guardados de esta tarea.</p>
            </header>

            <dl className="task-dialog__grid">
              <dt>Título</dt>
              <dd>{task.title}</dd>

              <dt>Estado</dt>
              <dd>
                <TaskStatusBadge status={task.status} />
              </dd>

              <dt>Responsable</dt>
              <dd>{assigneeName ?? task.assigneeId}</dd>

              <dt>Creada</dt>
              <dd>{dateFormatter.format(new Date(task.createdAt))}</dd>

              <dt>Actualizada</dt>
              <dd>{dateFormatter.format(new Date(task.updatedAt))}</dd>

              <dt>Identificador</dt>
              <dd>
                <code className="task-dialog__id">{task.id}</code>
              </dd>
            </dl>

            <div className="task-dialog__actions">
              <button
                className="button button--quiet"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cerrar
              </button>
            </div>

            <form method="dialog" className="task-dialog__close-form">
              <button
                className="task-dialog__close"
                type="submit"
                aria-label="Cerrar el detalle"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </form>
          </>
        ) : null}
      </div>
    </dialog>
  )
}
