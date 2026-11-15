import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { Task } from '../../lib/api/tasks'

export function TaskConfirmDialog({
  open,
  task,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean
  task?: Task
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
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
      aria-labelledby="task-confirm-title"
      onClose={() => onOpenChange(false)}
    >
      <div className="task-dialog__surface">
        {open && task ? (
          <>
            <header className="task-dialog__header">
              <p className="task-dialog__eyebrow">Confirmación</p>
              <h2 id="task-confirm-title">Eliminar la tarea</h2>
              <p>
                Vas a eliminar «{task.title}». Esta acción no se puede deshacer.
              </p>
            </header>

            <div className="task-dialog__actions">
              <button
                className="button button--quiet"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </button>
              <button
                className="button button--danger"
                type="button"
                disabled={isPending}
                onClick={onConfirm}
              >
                {isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>

            <form method="dialog" className="task-dialog__close-form">
              <button
                className="task-dialog__close"
                type="submit"
                aria-label="Cerrar la confirmación"
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
