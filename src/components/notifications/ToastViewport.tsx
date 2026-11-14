import { useSyncExternalStore } from 'react'
import { CircleCheck, CircleX, X } from 'lucide-react'
import {
  dismissToast,
  getToasts,
  subscribeToasts,
} from '../../lib/toast-store'

export function ToastViewport() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts)

  return (
    <div className="toast-viewport" aria-label="Notificaciones">
      {toasts.map((toast) => (
        <div
          className={`toast toast--${toast.tone}`}
          key={toast.id}
          role={toast.tone === 'error' ? 'alert' : 'status'}
        >
          <span className="toast__icon" aria-hidden="true">
            {toast.tone === 'success' ? (
              <CircleCheck size={20} />
            ) : (
              <CircleX size={20} />
            )}
          </span>
          <div className="toast__copy">
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </div>
          <button
            className="toast__close"
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Cerrar notificación"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}
