import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskDetailDialog } from './TaskDetailDialog'

const task = {
  id: 'task-1',
  title: 'Preparar la entrega',
  status: 'in_progress' as const,
  creatorId: 'admin-1',
  assigneeId: 'user-1',
  createdAt: '2026-11-14T12:00:00.000Z',
  updatedAt: '2026-11-14T12:00:00.000Z',
}

describe('TaskDetailDialog', () => {
  it('muestra los datos de la tarea sin controles editables', () => {
    render(
      <TaskDetailDialog
        open
        task={task}
        assigneeName="Ana Pérez"
        onOpenChange={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('dialog', { name: 'Detalle de la tarea' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Preparar la entrega')).toBeInTheDocument()
    expect(screen.getByText('En curso')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Guardar' }),
    ).not.toBeInTheDocument()
  })

  it('muestra el identificador del responsable cuando no se conoce su nombre', () => {
    render(<TaskDetailDialog open task={task} onOpenChange={vi.fn()} />)

    expect(screen.getByText('user-1')).toBeInTheDocument()
  })
})
