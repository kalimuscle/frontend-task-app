import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  id: string
  name: string
  value: string
  autoComplete: 'current-password' | 'new-password'
  errorMessage?: string
  onChange: (value: string) => void
  onBlur: () => void
}

export function PasswordInput({
  id,
  name,
  value,
  autoComplete,
  errorMessage,
  onChange,
  onBlur,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = errorMessage ? `${hintId} ${errorId}` : hintId

  return (
    <div className="auth-field">
      <label htmlFor={id}>Contraseña</label>
      <span className="auth-field__hint" id={hintId}>
        Mínimo 8 caracteres.
      </span>
      <div className="auth-password">
        <input
          id={id}
          name={name}
          type={isVisible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={errorMessage ? 'true' : 'false'}
          aria-describedby={describedBy}
          required
          minLength={autoComplete === 'new-password' ? 8 : undefined}
          maxLength={128}
        />
        <button
          className="auth-password__toggle"
          type="button"
          aria-label="Mostrar contraseña"
          aria-pressed={isVisible}
          aria-controls={id}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? (
            <EyeOff size={19} aria-hidden="true" />
          ) : (
            <Eye size={19} aria-hidden="true" />
          )}
        </button>
      </div>
      {errorMessage ? (
        <p className="auth-field__error" id={errorId}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
