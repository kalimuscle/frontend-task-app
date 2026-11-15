import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, isUnauthorizedError } from './errors'

describe('API errors', () => {
  it('detecta una respuesta 401 del servidor', () => {
    expect(
      isUnauthorizedError({ isAxiosError: true, response: { status: 401 } }),
    ).toBe(true)
  })

  it('no confunde un 403 con una sesión caducada', () => {
    expect(
      isUnauthorizedError({ isAxiosError: true, response: { status: 403 } }),
    ).toBe(false)
  })

  it('traduce al español el código de validación del servidor', () => {
    const error = {
      isAxiosError: true,
      response: { status: 422, data: { code: 'validation-error' } },
    }

    expect(getApiErrorMessage(error)).toBe(
      'Revisa los datos introducidos e inténtalo de nuevo.',
    )
  })
})
