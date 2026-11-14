import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/api/client'
import type { AuthUser } from '../../lib/api/types'
import { clearToasts } from '../../lib/toast-store'
import { ToastViewport } from '../../components/notifications/ToastViewport'
import { AuthDialog } from './AuthDialog'
import { AuthDialogProvider } from './AuthDialogProvider'
import { useAuthDialog } from './auth-dialog-context'

const user: AuthUser = {
  id: 'user-1',
  name: 'Ana Pérez',
  email: 'ana@example.com',
  emailVerified: false,
  image: null,
  createdAt: '2026-11-14T12:00:00.000Z',
  updatedAt: '2026-11-14T12:00:00.000Z',
  role: 'USER',
}

function OpenDialogTrigger() {
  const { openDialog } = useAuthDialog()

  return (
    <button type="button" onClick={() => openDialog('signin')}>
      Abrir acceso
    </button>
  )
}

function LocationProbe() {
  const location = useLocation()

  return <span data-testid="location">{location.pathname}</span>
}

function renderAuthDialog() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <AuthDialogProvider>
          <OpenDialogTrigger />
          <LocationProbe />
          <AuthDialog />
          <ToastViewport />
        </AuthDialogProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AuthDialog', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    clearToasts()
  })

  it('abre un diálogo modal con las pestañas de acceso', () => {
    renderAuthDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Abrir acceso' }))

    expect(
      screen.getByRole('dialog', { name: 'Acceso a tu cuenta' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Crear cuenta' })).toBeInTheDocument()
  })

  it('valida el registro con Zod sin enviar datos inválidos', async () => {
    const post = vi.spyOn(apiClient, 'post')
    renderAuthDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Abrir acceso' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Crear cuenta' }))
    fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }))

    expect(
      await screen.findByText('Escribe un nombre de al menos 2 caracteres.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('La contraseña debe tener al menos 8 caracteres.'),
    ).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it('selecciona USER por defecto y permite enviar ADMIN', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { token: 'session-token', user },
    })
    renderAuthDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Abrir acceso' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Crear cuenta' }))

    const userRole = screen.getByRole('radio', { name: /^USER/ })
    const adminRole = screen.getByRole('radio', { name: /^ADMIN/ })

    expect(userRole).toBeChecked()
    expect(adminRole).not.toBeChecked()

    fireEvent.click(adminRole)
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Ana Pérez' },
    })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'ana@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'correcta-123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }))

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/auth/sign-up/email', {
        name: 'Ana Pérez',
        email: 'ana@example.com',
        password: 'correcta-123',
        role: 'ADMIN',
      })
    })
    expect(await screen.findByText('Cuenta creada correctamente.')).toBeInTheDocument()
  })

  it('permite mostrar la contraseña mediante un botón interno', () => {
    renderAuthDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Abrir acceso' }))

    const password = screen.getByLabelText('Contraseña')
    const toggle = screen.getByRole('button', { name: 'Mostrar contraseña' })

    expect(password).toHaveAttribute('type', 'password')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(toggle)

    expect(password).toHaveAttribute('type', 'text')
    expect(
      screen.getByRole('button', { name: 'Ocultar contraseña' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('inicia sesión, notifica y redirige a tasks', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { token: 'session-token', user },
    })
    renderAuthDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Abrir acceso' }))
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'ana@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'correcta-123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/auth/sign-in/email', {
        email: 'ana@example.com',
        password: 'correcta-123',
      })
    })
    expect(await screen.findByText('Sesión iniciada correctamente.')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/tasks')
    })
  })

  it('muestra en la interfaz el error de autenticación', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new Error('Credenciales incorrectas'),
    )
    renderAuthDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Abrir acceso' }))
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'ana@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'incorrecta' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Credenciales incorrectas',
    )
    expect(screen.getByTestId('location')).toHaveTextContent('/')
  })
})
