export function focusFirstInvalidField(
  formId: string,
  fields: Record<string, { errors: unknown[] }>,
) {
  const firstInvalidField = Object.entries(fields).find(
    ([, field]) => field.errors.length > 0,
  )

  if (!firstInvalidField) {
    return
  }

  const field = document.querySelector<HTMLElement>(
    `[data-auth-form="${formId}"] [name="${firstInvalidField[0]}"]`,
  )

  field?.focus()
}

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
