export function getValidationMessage(error: unknown) {
  if (error === undefined || error === null) {
    return undefined
  }

  if (typeof error === 'string') {
    return error
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return 'Revisa este campo.'
}
