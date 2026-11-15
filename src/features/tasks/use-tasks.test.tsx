import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { apiClient } from '../../lib/api/client'
import type { AuthSession } from '../../lib/api/types'
import { useTasks } from './use-tasks'

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

const emptyPage = {
  items: [],
  pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
  }
}

describe('useTasks', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('pide las tareas con el límite máximo y sin filtro', async () => {
    const get = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data: emptyPage })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    renderHook(() => useTasks(), { wrapper: createWrapper(client) })

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/tasks', {
        params: { page: 1, limit: 100 },
      })
    })
  })

  it('pide las tareas filtradas por estado', async () => {
    const get = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data: emptyPage })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    renderHook(() => useTasks('done'), { wrapper: createWrapper(client) })

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/tasks', {
        params: { page: 1, limit: 100, status: 'done' },
      })
    })
  })

  it('cierra la sesión cuando el servidor responde 401', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue({
      isAxiosError: true,
      response: { status: 401 },
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    client.setQueryData(['session'], session)

    renderHook(() => useTasks(), { wrapper: createWrapper(client) })

    await waitFor(() => {
      expect(client.getQueryData(['session'])).toBeUndefined()
    })
  })
})
