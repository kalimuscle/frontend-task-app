import axios from 'axios'

const knownErrorMessages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'El correo o la contraseña no son correctos.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'Ya existe una cuenta con este correo electrónico.',
  INVALID_ORIGIN: 'El origen de la solicitud no está autorizado.',
  MISSING_OR_NULL_ORIGIN: 'No se pudo validar el origen de la solicitud.',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres.',
  PASSWORD_TOO_LONG: 'La contraseña no puede superar 128 caracteres.',
  VALIDATION_ERROR: 'Revisa los datos introducidos e inténtalo de nuevo.',
  authentication-required: 'Debes iniciar sesión para continuar.',
  forbidden: 'No tienes permisos para realizar esta acción.',
  'rate-limit-exceeded': 'Demasiados intentos. Espera unos minutos.',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data

    if (isRecord(data)) {
      const code = typeof data.code === 'string' ? data.code : undefined
      const message =
        typeof data.message === 'string'
          ? data.message
          : typeof data.detail === 'string'
            ? data.detail
            : typeof data.title === 'string'
              ? data.title
              : undefined

      if (code && knownErrorMessages[code]) {
        return knownErrorMessages[code]
      }

      if (message) {
        return message
      }
    }

    if (error.code === 'ERR_NETWORK') {
      return 'No se pudo conectar con el servidor. Comprueba que esté disponible.'
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Se produjo un error inesperado. Inténtalo de nuevo.'
}
