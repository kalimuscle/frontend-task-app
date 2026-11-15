import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { TasksTable } from './TasksTable'

const task = {
  id: 'task-1',
  title: 'Preparar la entrega',
  status: 'in_progress' as const,
  creatorId: 'admin-1',
  assigneeId: 'user-1',
  createdAt: '2026-11-14T12:00:00.000Z',
  updatedAt: '2026-11-14T12:00:00.000Z',
}

function renderTable(
  overrides: Partial<ComponentProps<typeof TasksTable>> = {},
) {
  const props = {
    tasks: [task],
    isPending: false,
    isError: false,
    error: null,
    onRetry: vi.fn(),
    assigneeName: () => 'Ana Pérez',
    canDelete: true,
    onViewTask: vi.fn(),
    onEditTask: vi.fn(),
    onDeleteTask: vi.fn(),
    ...overrides,
  }

  render(<TasksTable {...props} />)

  return props
}

describe('TasksTable', () => {
  it('muestra una fila por tarea con su estado y su responsable', () => {
    renderTable()

    expect(screen.getByText('Preparar la entrega')).toBeInTheDocument()
    expect(screen.getByText('En curso')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
  })

  it('muestra el identificador del responsable cuando no se conoce su nombre', () => {
    renderTable({ assigneeName: () => undefined })

    expect(screen.getByText('user-1')).toBeInTheDocument()
  })

  it('ofrece las tres acciones de la fila a un administrador', async () => {
    const props = renderTable()
    const triggerName = 'Acciones de la tarea Preparar la entrega'

    fireEvent.click(screen.getByRole('button', { name: triggerName }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Ver tarea' }))
    expect(props.onViewTask).toHaveBeenCalledWith(task)

    fireEvent.click(screen.getByRole('button', { name: triggerName }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Editar' }))
    expect(props.onEditTask).toHaveBeenCalledWith(task)

    fireEvent.click(screen.getByRole('button', { name: triggerName }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Eliminar' }))
    expect(props.onDeleteTask).toHaveBeenCalledWith(task)
  })

  it('oculta la eliminación a un usuario que no es administrador', async () => {
    renderTable({ canDelete: false })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Acciones de la tarea Preparar la entrega',
      }),
    )

    expect(
      await screen.findByRole('menuitem', { name: 'Ver tarea' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: 'Eliminar' }),
    ).not.toBeInTheDocument()
  })

  it('muestra el estado vacío cuando no hay tareas', () => {
    renderTable({ tasks: [] })

    expect(screen.getByText('Todavía no hay tareas.')).toBeInTheDocument()
  })

  it('muestra el error y permite reintentar', () => {
    const props = renderTable({
      isError: true,
      error: {
        isAxiosError: true,
        response: { status: 500, data: { detail: 'Fallo' } },
      },
    })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(props.onRetry).toHaveBeenCalled()
  })
})
