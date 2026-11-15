import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/api/client'
import type { AuthSession } from '../../lib/api/types'
import { TasksHeader } from './TasksHeader'

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
    role: 'ADMIN',
  },
}

const healthy = {
  status: 'ok',
  server: { status: 'up', uptimeSeconds: 120, timestamp: '2026-11-14T12:00:00.000Z' },
  database: { status: 'up', latencyMs: 0.42 },
}

function renderHeader() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <TasksHeader />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('TasksHeader', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('muestra los datos del usuario conectado y su rol', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }
      return Promise.resolve({ data: healthy })
    })

    renderHeader()

    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })

  it('no muestra los enlaces de navegación del sitio', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }
      return Promise.resolve({ data: healthy })
    })

    renderHeader()

    await screen.findByText('Ana Pérez')

    expect(screen.queryByRole('link', { name: 'Tech Stack' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Uso de la IA' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Comenzar' })).not.toBeInTheDocument()
  })

  it('muestra el estado de conexión del servidor', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }
      return Promise.resolve({ data: healthy })
    })

    renderHeader()

    expect(await screen.findByText('Servidor conectado')).toBeInTheDocument()
  })

  it('avisa cuando el servidor no responde y permite cerrar sesión igualmente', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }
      return Promise.reject(new Error('Servidor caído'))
    })

    renderHeader()

    expect(await screen.findByText('Sin conexión')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Estado del servidor/ }))

    expect(
      await screen.findByRole('menuitem', { name: 'Cerrar sesión' }),
    ).toBeInTheDocument()
  })

  it('cierra la sesión en el servidor', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }
      return Promise.resolve({ data: healthy })
    })
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { success: true } })

    renderHeader()

    await screen.findByText('Ana Pérez')
    fireEvent.click(screen.getByRole('button', { name: /Estado del servidor/ }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Cerrar sesión' }))

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/auth/sign-out')
    })
  })
})
