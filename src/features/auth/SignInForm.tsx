import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { getApiErrorMessage } from '../../lib/api/errors'
import { signInSchema } from '../../lib/schemas/auth'
import { getValidationMessage } from './form-utils'
import { PasswordInput } from './PasswordInput'
import { useSignInMutation } from './use-auth'

export function SignInForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const mutation = useSignInMutation()
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null)

      try {
        await mutation.mutateAsync(value)
      } catch (error) {
        setServerError(getApiErrorMessage(error))
      }
    },
    onSubmitInvalid: ({ formApi }) => {
      const { fields } = formApi.getAllErrors()
      const firstInvalidField = Object.entries(fields).find(
        ([, field]) => field.errors.length > 0,
      )

      if (firstInvalidField) {
        document.getElementById(firstInvalidField[0])?.focus()
      }
    },
  })

  return (
    <form
      className="auth-form"
      action="/api/auth/sign-in/email"
      method="post"
      noValidate
      aria-labelledby="sign-in-title"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div className="auth-form__heading">
        <h3 id="sign-in-title">Inicia sesión</h3>
        <p>Accede a tus tareas con tu correo y contraseña.</p>
      </div>

      {serverError ? (
        <div className="auth-form__server-error" role="alert">
          {serverError}
        </div>
      ) : null}

      <form.Field
        name="email"
        validators={{ onBlur: signInSchema.shape.email }}
      >
        {(field) => {
          const errorMessage = getValidationMessage(
            field.state.meta.errors[0],
          )

          return (
            <div className="auth-field">
              <label htmlFor="sign-in-email">Correo electrónico</label>
              <input
                id="sign-in-email"
                name="email"
                type="email"
                autoComplete="username"
                inputMode="email"
                enterKeyHint="next"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={errorMessage ? 'true' : 'false'}
                aria-describedby={errorMessage ? 'sign-in-email-error' : undefined}
                required
              />
              {errorMessage ? (
                <p className="auth-field__error" id="sign-in-email-error">
                  {errorMessage}
                </p>
              ) : null}
            </div>
          )
        }}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onBlur: signInSchema.shape.password }}
      >
        {(field) => {
          const errorMessage = getValidationMessage(
            field.state.meta.errors[0],
          )

          return (
            <PasswordInput
              id="sign-in-password"
              name="password"
              value={field.state.value}
              autoComplete="current-password"
              errorMessage={errorMessage}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
            />
          )
        }}
      </form.Field>

      <button
        className="button button--primary auth-form__submit"
        type="submit"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
