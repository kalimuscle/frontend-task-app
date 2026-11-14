import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Homepage', () => {
  it('presenta el proyecto como una candidatura full-stack', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Gestión de tareas, de extremo a extremo.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/este proyecto sirve para aplicar a un trabajo/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/react.*node\.js.*typescript/i),
    ).toBeInTheDocument()
  })

  it('explica el alcance de la prueba técnica', () => {
    render(<App />)

    const challenge = screen.getByRole('region', {
      name: 'En qué consiste la prueba',
    })

    expect(
      within(challenge).getByText(
        'Crear, listar y cambiar el estado de tareas mediante una API REST.',
      ),
    ).toBeInTheDocument()
    expect(
      within(challenge).getByText(
        'Validar los datos y responder con los códigos HTTP correctos.',
      ),
    ).toBeInTheDocument()
    expect(
      within(challenge).getByText(
        'Mostrar estados de carga y error visibles en la interfaz.',
      ),
    ).toBeInTheDocument()
    expect(
      within(challenge).getByText(
        'Al menos 2 tests de backend y 2 de frontend.',
      ),
    ).toBeInTheDocument()
    expect(
      within(challenge).getByText(
        'Documentar la ejecución, decisiones, próximos pasos y uso de la IA.',
      ),
    ).toBeInTheDocument()
  })

  it('ofrece navegación directa y conserva una estructura semántica', () => {
    render(<App />)

    const navigation = screen.getByRole('navigation', { name: 'Principal' })

    expect(navigation).toBeInTheDocument()
    expect(
      within(navigation).getByRole('link', { name: 'Comenzar' }),
    ).toHaveAttribute('href', '/#prueba')
    expect(
      within(navigation).getByRole('link', { name: 'Cómo se construirá' }),
    ).toHaveAttribute('href', '/#arquitectura')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})
