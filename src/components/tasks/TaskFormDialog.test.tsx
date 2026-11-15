import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/api/client'
import type { AuthSession } from '../../lib/api/types'
import { TaskFormDialog } from './TaskFormDialog'

const adminSession: AuthSession = {
  session: {
    id: 'session-1',
    token: 'session-token',
    userId: 'admin-1',
    expiresAt: '2026-11-21T12:00:00.000Z',
    ipAddress: null,
    userAgent: null,
    createdAt: '2026-11-14T12:00:00.000Z',
    updatedAt: '2026-11-14T12:00:00.000Z',
  },
  user: {
    id: 'admin-1',
    name: 'Ana Pérez',
    email: 'ana@example.com',
    emailVerified: false,
    image: null,
    createdAt: '2026-11-14T12:00:00.000Z',
    updatedAt: '2026-11-14T12:00:00.000Z',
    role: 'ADMIN',
  },
}

const userSession: AuthSession = {
  ...adminSession,
  user: { ...adminSession.user, id: 'user-1', role: 'USER' },
}

const task = {
  id: 'task-1',
  title: 'Preparar la entrega',
  status: 'pending' as const,
  creatorId: 'admin-1',
  assigneeId: 'user-1',
  createdAt: '2026-11-14T12:00:00.000Z',
  updatedAt: '2026-11-14T12:00:00.000Z',
}

function renderDialog(
  session: AuthSession,
  mode: 'create' | 'edit',
  taskToEdit = task,
) {
  vi.spyOn(apiClient, 'get').mockImplementation((url) => {
    if (url === '/auth/get-session') {
      return Promise.resolve({ data: session })
    }

    if (url === '/users') {
      return Promise.resolve({
        data: [
          {
            id: 'admin-1',
            name: 'Ana Pérez',
            email: 'ana@example.com',
            role: 'USER',
          },
        ],
      })
    }

    return Promise.resolve({ data: [] })
  })

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    <QueryClientProvider client={client}>
      <TaskFormDialog
        open
        mode={mode}
        task={mode === 'edit' ? taskToEdit : undefined}
        onOpenChange={vi.fn()}
      />
    </QueryClientProvider>,
  )
}

describe('TaskFormDialog', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('crea una tarea con el título, el responsable y el estado', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: task })
    renderDialog(adminSession, 'create')

    fireEvent.change(await screen.findByLabelText('Título'), {
      target: { value: 'Preparar la entrega' },
    })
    fireEvent.change(screen.getByLabelText('Estado'), {
      target: { value: 'in_progress' },
    })
    fireEvent.change(await screen.findByLabelText('Responsable'), {
      target: { value: 'admin-1' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/tasks', {
        title: 'Preparar la entrega',
        assigneeId: 'admin-1',
        status: 'in_progress',
      })
    })
  })

  it('permite a un usuario cambiar solo el estado', async () => {
    const patch = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: task })
    renderDialog(userSession, 'edit')

    fireEvent.change(await screen.findByLabelText('Estado'), {
      target: { value: 'done' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(patch).toHaveBeenCalledWith('/tasks/task-1', { status: 'done' })
    })
    expect(screen.queryByLabelText('Responsable')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument()
  })

  it('exige un título antes de enviar', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: task })
    renderDialog(adminSession, 'create')

    fireEvent.click(await screen.findByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Escribe un título.')).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it('ofrece los responsables con su identificador y su nombre', async () => {
    renderDialog(adminSession, 'create')

    const select = await screen.findByLabelText('Responsable')
    await screen.findByRole('option', { name: 'Ana Pérez' })
    const options = within(select).getAllByRole('option')

    expect(
      options.map((option) => [
        (option as HTMLOptionElement).value,
        option.textContent,
      ]),
    ).toEqual([
      ['', 'Selecciona un responsable'],
      ['admin-1', 'Ana Pérez'],
    ])
  })
})
