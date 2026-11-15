import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskStatusFilter } from './TaskStatusFilter'

describe('TaskStatusFilter', () => {
  it('marca el filtro activo y avisa del cambio', () => {
    const onChange = vi.fn()

    render(<TaskStatusFilter value="all" onChange={onChange} />)

    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: 'En curso' }))

    expect(onChange).toHaveBeenCalledWith('in_progress')
  })

  it('ofrece los cuatro estados de la tarea', () => {
    render(<TaskStatusFilter value="all" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Todas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pendiente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'En curso' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hecha' })).toBeInTheDocument()
  })
})
