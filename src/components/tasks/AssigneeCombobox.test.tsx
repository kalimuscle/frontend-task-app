import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/api/client'
import { AssigneeCombobox } from './AssigneeCombobox'

const users = [
  { id: 'user-2', name: 'Luis Gómez', email: 'luis@example.com', role: 'USER' },
  { id: 'user-1', name: 'Ana Pérez', email: 'ana@example.com', role: 'USER' },
]

function renderCombobox(onChange = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  render(
    <QueryClientProvider client={client}>
      <AssigneeCombobox value="" onChange={onChange} />
    </QueryClientProvider>,
  )

  return onChange
}

describe('AssigneeCombobox', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lista los usuarios ordenados por nombre y filtra al buscar', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: users })

    renderCombobox()

    const input = screen.getByRole('combobox', { name: 'Responsable' })
    fireEvent.mouseDown(input)

    const options = await screen.findAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual([
      'Ana Pérez',
      'Luis Gómez',
    ])

    fireEvent.change(input, { target: { value: 'luis' } })

    await waitFor(() => {
      expect(
        screen.queryByRole('option', { name: 'Ana Pérez' }),
      ).not.toBeInTheDocument()
    })
    expect(screen.getByRole('option', { name: 'Luis Gómez' })).toBeInTheDocument()
  })

  it('avisa del responsable elegido', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: users })
    const onChange = renderCombobox()

    const input = screen.getByRole('combobox', { name: 'Responsable' })
    fireEvent.mouseDown(input)
    fireEvent.click(await screen.findByRole('option', { name: 'Luis Gómez' }))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('user-2')
    })
  })

  it('degrada a un campo de texto cuando el servidor no lista los usuarios', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    })

    renderCombobox()

    expect(
      await screen.findByText(
        /El listado de usuarios no está disponible en el servidor/,
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Responsable')).toHaveAttribute('type', 'text')
  })
})
