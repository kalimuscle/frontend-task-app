import { useEffect, useRef } from 'react'
import { Tabs } from '@base-ui/react/tabs'
import { X } from 'lucide-react'
import { useAuthDialog, type AuthDialogTab } from './auth-dialog-context'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'

export function AuthDialog() {
  const { isOpen, tab, closeDialog, setTab } = useAuthDialog()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (isOpen && !dialog.open) {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal()
      } else {
        dialog.setAttribute('open', '')
      }
    }

    if (!isOpen && dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close()
      } else {
        dialog.removeAttribute('open')
      }
    }
  }, [isOpen])

  return (
    <dialog
      className="auth-dialog"
      ref={dialogRef}
      aria-labelledby="auth-dialog-title"
      onClose={closeDialog}
    >
      <div className="auth-dialog__surface">
        <header className="auth-dialog__header">
          <p className="auth-dialog__eyebrow">Acceso seguro</p>
          <h2 id="auth-dialog-title">Acceso a tu cuenta</h2>
          <p>Gestiona tus tareas desde un único espacio.</p>
        </header>

        <Tabs.Root
          className="auth-tabs"
          value={tab}
          onValueChange={(value) => setTab(value as AuthDialogTab)}
        >
          <Tabs.List className="auth-tabs__list" aria-label="Acceso a la cuenta">
            <Tabs.Tab className="auth-tabs__tab" value="signin">
              Iniciar sesión
            </Tabs.Tab>
            <Tabs.Tab className="auth-tabs__tab" value="signup">
              Crear cuenta
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel className="auth-tabs__panel" value="signin">
            <SignInForm />
          </Tabs.Panel>
          <Tabs.Panel className="auth-tabs__panel" value="signup">
            <SignUpForm />
          </Tabs.Panel>
        </Tabs.Root>

        <form method="dialog" className="auth-dialog__close-form">
          <button
            className="auth-dialog__close"
            type="submit"
            aria-label="Cerrar acceso"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </form>
      </div>
    </dialog>
  )
}
