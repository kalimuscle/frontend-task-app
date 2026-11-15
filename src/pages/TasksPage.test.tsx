import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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

function renderAt(path: string) {
  window.history.pushState({}, '', path)
  return render(<App />)
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
    const get = vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        sessionChecks += 1

        if (sessionChecks === 1) {
          return Promise.resolve({ data: null })
        }

        return new Promise((resolve) => {
          window.setTimeout(() => resolve({ data: session }), 300)
        })
      }

      return Promise.resolve({
        data: {
          items: [],
          pagination: {
            page: 1,
            limit: 20,
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
    const get = vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }

      if (url === '/tasks') {
        return Promise.resolve({
          data: {
            items: [
              {
                id: 'task-1',
                title: 'Preparar la entrega',
                status: 'in_progress',
                assigneeId: 'user-1',
                createdAt: '2026-11-14T12:00:00.000Z',
                updatedAt: '2026-11-14T12:00:00.000Z',
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
            },
          },
        })
      }

      return Promise.reject(new Error(`Unexpected request: ${String(url)}`))
    })

    renderAt('/tasks')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Tus tareas' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Preparar la entrega')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('En curso')).toBeInTheDocument()
    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/tasks')
    })
    expect(
      screen.queryByRole('dialog', { name: 'Acceso a tu cuenta' }),
    ).not.toBeInTheDocument()
  })
})
