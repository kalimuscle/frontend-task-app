import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { getApiErrorMessage } from '../../lib/api/errors'
import { signUpSchema, type UserRoleInput } from '../../lib/schemas/auth'
import { getValidationMessage } from './form-utils'
import { PasswordInput } from './PasswordInput'
import { useSignUpMutation } from './use-auth'

const roleOptions: Array<{ value: UserRoleInput; label: string }> = [
  { value: 'USER', label: 'USER' },
  { value: 'ADMIN', label: 'ADMIN' },
]

export function SignUpForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const mutation = useSignUpMutation()
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'USER' as UserRoleInput,
    },
    validators: {
      onBlur: signUpSchema,
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null)

      try {
        await mutation.mutateAsync(value)
        form.reset()
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
      action="/api/auth/sign-up/email"
      method="post"
      noValidate
      aria-labelledby="sign-up-title"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div className="auth-form__heading">
        <h3 id="sign-up-title">Crea tu cuenta</h3>
        <p>Regístrate para empezar a gestionar tus tareas.</p>
      </div>

      {serverError ? (
        <div className="auth-form__server-error" role="alert">
          {serverError}
        </div>
      ) : null}

      <form.Field name="name">
        {(field) => {
          const errorMessage = getValidationMessage(
            field.state.meta.errors[0],
          )

          return (
            <div className="auth-field">
              <label htmlFor="sign-up-name">Nombre</label>
              <input
                id="sign-up-name"
                name="name"
                type="text"
                autoComplete="name"
                enterKeyHint="next"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={errorMessage ? 'true' : 'false'}
                aria-describedby={errorMessage ? 'sign-up-name-error' : undefined}
                required
                minLength={2}
                maxLength={100}
              />
              {errorMessage ? (
                <p className="auth-field__error" id="sign-up-name-error">
                  {errorMessage}
                </p>
              ) : null}
            </div>
          )
        }}
      </form.Field>

      <form.Field name="email">
        {(field) => {
          const errorMessage = getValidationMessage(
            field.state.meta.errors[0],
          )

          return (
            <div className="auth-field">
              <label htmlFor="sign-up-email">Correo electrónico</label>
              <input
                id="sign-up-email"
                name="email"
                type="email"
                autoComplete="username"
                inputMode="email"
                enterKeyHint="next"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={errorMessage ? 'true' : 'false'}
                aria-describedby={errorMessage ? 'sign-up-email-error' : undefined}
                required
              />
              {errorMessage ? (
                <p className="auth-field__error" id="sign-up-email-error">
                  {errorMessage}
                </p>
              ) : null}
            </div>
          )
        }}
      </form.Field>

      <form.Field name="password">
        {(field) => {
          const errorMessage = getValidationMessage(
            field.state.meta.errors[0],
          )

          return (
            <PasswordInput
              id="sign-up-password"
              name="password"
              value={field.state.value}
              autoComplete="new-password"
              errorMessage={errorMessage}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
            />
          )
        }}
      </form.Field>

      <form.Field name="role">
        {(field) => (
          <fieldset className="auth-field auth-role">
            <legend>Tipo de usuario</legend>
            <div className="auth-role__options">
              {roleOptions.map((role) => (
                <label key={role.value}>
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={field.state.value === role.value}
                    onChange={() => field.handleChange(role.value)}
                  />
                  <span>
                    <strong>{role.label}</strong>
                    <small>
                      {role.value === 'ADMIN'
                        ? 'Permisos de administración.'
                        : 'Acceso a las tareas asignadas.'}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </form.Field>

      <button
        className="button button--primary auth-form__submit"
        type="submit"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Creando cuenta...' : 'Crear mi cuenta'}
      </button>
    </form>
  )
}
