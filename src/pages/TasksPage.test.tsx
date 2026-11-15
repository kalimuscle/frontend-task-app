import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { apiClient } from '../lib/api/client'
import type { AuthSession } from '../lib/api/types'
import { queryClient } from '../lib/query-client'

const session: AuthSession = {
  session: {
    id: 'session-1',
    token: 'session-token',
    userId: 'user-1',
    expiresAt: '2026-11-21T12:00:00.000Z',
    ipAddress: null,
    userAgent: null,
    createdAt: '2026-11-14T12:00:00.000Z',
    updatedAt: '2026-11-14T12:00:00.000Z',
  },
  user: {
    id: 'user-1',
    name: 'Ana Pérez',
    email: 'ana@example.com',
    emailVerified: false,
    image: null,
    createdAt: '2026-11-14T12:00:00.000Z',
    updatedAt: '2026-11-14T12:00:00.000Z',
    role: 'USER',
  },
}

const adminSession: AuthSession = {
  ...session,
  user: { ...session.user, id: 'admin-1', role: 'ADMIN' },
}

const healthReport = {
  status: 'ok',
  server: {
    status: 'up',
    uptimeSeconds: 120,
    timestamp: '2026-11-14T12:00:00.000Z',
  },
  database: { status: 'up', latencyMs: 0.42 },
}

const tasksPage = {
  items: [
    {
      id: 'task-1',
      title: 'Preparar la entrega',
      status: 'in_progress',
      creatorId: 'admin-1',
      assigneeId: 'user-1',
      createdAt: '2026-11-14T12:00:00.000Z',
      updatedAt: '2026-11-14T12:00:00.000Z',
    },
  ],
  pagination: {
    page: 1,
    limit: 100,
    total: 1,
    totalPages: 1,
  },
}

function renderAt(path: string) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

function mockApi(activeSession: AuthSession = session) {
  return vi.spyOn(apiClient, 'get').mockImplementation((url) => {
    if (url === '/auth/get-session') {
      return Promise.resolve({ data: activeSession })
    }

    if (url === '/healthcheck') {
      return Promise.resolve({ data: healthReport })
    }

    if (url === '/users') {
      return Promise.resolve({ data: [] })
    }

    if (url === '/tasks') {
      return Promise.resolve({ data: tasksPage })
    }

    return Promise.reject(new Error(`Unexpected request: ${String(url)}`))
  })
}

describe('TasksPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    queryClient.clear()
    window.history.pushState({}, '', '/')
  })

  it('redirige a la portada y abre el acceso si no hay sesión', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: null })

    renderAt('/tasks')

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/auth/get-session')
    })
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Gestión de tareas, de extremo a extremo.',
      }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('dialog', { name: 'Acceso a tu cuenta' }),
    ).toBeInTheDocument()
  })

  it('completa el login iniciado desde una ruta protegida', async () => {
    let sessionChecks = 0
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        sessionChecks += 1

        if (sessionChecks === 1) {
          return Promise.resolve({ data: null })
        }

        return new Promise((resolve) => {
          window.setTimeout(() => resolve({ data: session }), 300)
        })
      }

      if (url === '/healthcheck') {
        return Promise.resolve({ data: healthReport })
      }

      if (url === '/users') {
        return Promise.resolve({ data: [] })
      }

      return Promise.resolve({
        data: {
          items: [],
          pagination: {
            page: 1,
            limit: 100,
            total: 0,
            totalPages: 0,
          },
        },
      })
    })
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { token: 'session-token', user: session.user },
    })

    renderAt('/tasks')

    expect(
      await screen.findByRole('dialog', { name: 'Acceso a tu cuenta' }),
    ).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'ana@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'correcta-123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Tus tareas' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('dialog', { name: 'Acceso a tu cuenta' }),
    ).not.toBeInTheDocument()
    expect(post).toHaveBeenCalledWith('/auth/sign-in/email', {
      email: 'ana@example.com',
      password: 'correcta-123',
    })
  })

  it('muestra las tareas cuando la sesión es válida', async () => {
    const get = mockApi()

    renderAt('/tasks')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Tus tareas' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Preparar la entrega')).toBeInTheDocument()
    expect(
      within(screen.getByRole('main')).getByText('Ana Pérez'),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('table')).getByText('En curso'),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/tasks', {
        params: { page: 1, limit: 100 },
      })
    })
    expect(
      screen.queryByRole('dialog', { name: 'Acceso a tu cuenta' }),
    ).not.toBeInTheDocument()
  })

  it('oculta el enlace de volver arriba en el pie de página', async () => {
    mockApi()

    renderAt('/tasks')

    await screen.findByRole('heading', { level: 1, name: 'Tus tareas' })

    expect(
      screen.queryByRole('link', { name: 'Volver arriba' }),
    ).not.toBeInTheDocument()
  })

  it('filtra las tareas por estado', async () => {
    const get = mockApi()

    renderAt('/tasks')

    await screen.findByRole('heading', { level: 1, name: 'Tus tareas' })
    fireEvent.click(screen.getByRole('button', { name: 'En curso' }))

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/tasks', {
        params: { page: 1, limit: 100, status: 'in_progress' },
      })
    })
  })

  it('oculta las acciones de administrador a un usuario', async () => {
    mockApi()

    renderAt('/tasks')

    await screen.findByText('Preparar la entrega')

    expect(
      screen.queryByRole('button', { name: 'Crear Tarea' }),
    ).not.toBeInTheDocument()

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

  it('ofrece las acciones de administrador a un administrador', async () => {
    mockApi(adminSession)

    renderAt('/tasks')

    await screen.findByText('Preparar la entrega')

    expect(
      screen.getByRole('button', { name: 'Crear Tarea' }),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Acciones de la tarea Preparar la entrega',
      }),
    )

    expect(
      await screen.findByRole('menuitem', { name: 'Eliminar' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Crear Tarea' }))

    expect(await screen.findByLabelText('Responsable')).toBeInTheDocument()
  })
})
