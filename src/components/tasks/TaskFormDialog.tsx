import { useForm } from '@tanstack/react-form'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useSessionQuery } from '../../features/auth/use-auth'
import { focusFirstInvalidField, getValidationMessage } from '../../features/auth/form-utils'
import { useCreateTask, useUpdateTask } from '../../features/tasks/use-tasks'
import { getApiErrorMessage } from '../../lib/api/errors'
import type { Task, TaskStatus } from '../../lib/api/tasks'
import { taskFormSchema } from '../../lib/schemas/tasks'
import { notifyToast } from '../../lib/toast-store'
import { AssigneeCombobox } from './AssigneeCombobox'
import { taskStatusLabels } from './TaskStatusBadge'

const statusOptions: TaskStatus[] = ['pending', 'in_progress', 'done']

export function TaskFormDialog({
  open,
  mode,
  task,
  onOpenChange,
}: {
  open: boolean
  mode: 'create' | 'edit'
  task?: Task
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
      aria-labelledby="task-form-title"
      onClose={() => onOpenChange(false)}
    >
      <div className="task-dialog__surface">
        {open ? (
          <TaskFormBody mode={mode} task={task} onOpenChange={onOpenChange} />
        ) : null}
      </div>
    </dialog>
  )
}

function TaskFormBody({
  mode,
  task,
  onOpenChange,
}: {
  mode: 'create' | 'edit'
  task?: Task
  onOpenChange: (open: boolean) => void
}) {
  const { data: session } = useSessionQuery()
  const isAdmin = session?.user.role === 'ADMIN'
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      title: task?.title ?? '',
      status: task?.status ?? 'pending',
      assigneeId: task?.assigneeId ?? '',
    },
    validators: {
      onSubmit: taskFormSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null)

      try {
        if (mode === 'create') {
          await createTask.mutateAsync({
            title: value.title,
            assigneeId: value.assigneeId,
            status: value.status,
          })
        } else {
          await updateTask.mutateAsync({
            id: task?.id ?? '',
            input: isAdmin
              ? {
                  title: value.title,
                  status: value.status,
                  assigneeId: value.assigneeId,
                }
              : { status: value.status },
          })
        }

        notifyToast({
          tone: 'success',
          title: mode === 'create' ? 'Tarea creada.' : 'Tarea actualizada.',
          message:
            mode === 'create'
              ? 'La tarea ya está en la tabla.'
              : 'Los cambios se han guardado.',
        })
        onOpenChange(false)
      } catch (error) {
        setServerError(getApiErrorMessage(error))
      }
    },
    onSubmitInvalid: ({ formApi }) => {
      focusFirstInvalidField('task-form', formApi.getAllErrors().fields)
    },
  })

  const isPending = createTask.isPending || updateTask.isPending

  return (
    <>
      <header className="task-dialog__header">
        <p className="task-dialog__eyebrow">
          {mode === 'create' ? 'Nueva tarea' : 'Editar tarea'}
        </p>
        <h2 id="task-form-title">
          {mode === 'create' ? 'Crear una tarea' : 'Modifica la tarea'}
        </h2>
        <p>
          {isAdmin
            ? 'Define el título, el estado y el responsable de la tarea.'
            : 'Puedes cambiar el estado de la tarea que tienes asignada.'}
        </p>
      </header>

      <form
        className="task-form"
        data-auth-form="task-form"
        action="/api/tasks"
        method="post"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        {serverError ? (
          <div className="task-form__error" role="alert">
            {serverError}
          </div>
        ) : null}

        {isAdmin ? (
          <form.Field
            name="title"
            validators={{ onBlur: taskFormSchema.shape.title }}
          >
            {(field) => {
              const errorMessage = getValidationMessage(
                field.state.meta.errors[0],
              )

              return (
                <div className="task-field">
                  <label htmlFor="task-title">Título</label>
                  <input
                    id="task-title"
                    name="title"
                    type="text"
                    autoComplete="off"
                    maxLength={200}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={errorMessage ? 'true' : 'false'}
                    aria-describedby={
                      errorMessage ? 'task-title-error' : undefined
                    }
                    required
                  />
                  {errorMessage ? (
                    <p className="task-field__error" id="task-title-error">
                      {errorMessage}
                    </p>
                  ) : null}
                </div>
              )
            }}
          </form.Field>
        ) : (
          <div className="task-field">
            <span className="task-field__label">Título</span>
            <p className="task-form__readonly">{task?.title}</p>
          </div>
        )}

        <form.Field name="status">
          {(field) => (
            <div className="task-field">
              <label htmlFor="task-status">Estado</label>
              <select
                id="task-status"
                name="status"
                value={field.state.value}
                onChange={(event) =>
                  field.handleChange(event.target.value as TaskStatus)
                }
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {taskStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>

        {isAdmin ? (
          <form.Field name="assigneeId">
            {(field) => {
              const errorMessage = getValidationMessage(
                field.state.meta.errors[0],
              )

              return (
                <div className="task-field">
                  <AssigneeCombobox
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                  {errorMessage ? (
                    <p className="task-field__error">{errorMessage}</p>
                  ) : null}
                </div>
              )
            }}
          </form.Field>
        ) : null}

        <div className="task-dialog__actions">
          <button
            className="button button--quiet"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </button>
          <button
            className="button button--primary"
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>

      <form method="dialog" className="task-dialog__close-form">
        <button
          className="task-dialog__close"
          type="submit"
          aria-label="Cerrar el formulario"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </form>
    </>
  )
}
