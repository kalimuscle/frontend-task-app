import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { apiClient } from '../../lib/api/client'
import { TasksLayout } from './TasksLayout'

function renderLayout(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <TasksLayout>{children}</TasksLayout>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('TasksLayout', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('conserva el enlace de salto y el pie de página', () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: null })

    renderLayout(<p>Contenido del espacio de trabajo</p>)

    expect(
      screen.getByRole('link', { name: 'Saltar al contenido' }),
    ).toHaveAttribute('href', '#contenido')
    expect(screen.getByText('Contenido del espacio de trabajo')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
