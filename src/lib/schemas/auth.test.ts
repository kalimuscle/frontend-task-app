import { describe, expect, it } from 'vitest'
import { signInSchema, signUpSchema } from './auth'

describe('auth schemas', () => {
  it('acepta un registro válido con rol ADMIN', () => {
    const result = signUpSchema.safeParse({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      password: 'correcta-123',
      role: 'ADMIN',
    })

    expect(result.success).toBe(true)
  })

  it('rechaza contraseñas de menos de ocho caracteres', () => {
    const result = signUpSchema.safeParse({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      password: 'corta',
      role: 'USER',
    })

    expect(result.success).toBe(false)
  })

  it('exige email y contraseña para iniciar sesión', () => {
    expect(signInSchema.safeParse({ email: '', password: '' }).success).toBe(
      false,
    )
  })
})
