import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './client'
import { getSession, signIn, signUp } from './auth'

describe('auth API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('envía el registro al endpoint de Better Auth', async () => {
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { token: 'session-token', user: {} } })

    await signUp({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      password: 'correcta-123',
      role: 'ADMIN',
    })

    expect(post).toHaveBeenCalledWith('/auth/sign-up/email', {
      name: 'Ana Pérez',
      email: 'ana@example.com',
      password: 'correcta-123',
      role: 'ADMIN',
    })
  })

  it('envía las credenciales al endpoint de inicio de sesión', async () => {
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { token: 'session-token', user: {} } })

    await signIn({ email: 'ana@example.com', password: 'correcta-123' })

    expect(post).toHaveBeenCalledWith('/auth/sign-in/email', {
      email: 'ana@example.com',
      password: 'correcta-123',
    })
  })

  it('consulta la sesión mediante el endpoint de Better Auth', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: null })

    await getSession()

    expect(get).toHaveBeenCalledWith('/auth/get-session')
  })
})
