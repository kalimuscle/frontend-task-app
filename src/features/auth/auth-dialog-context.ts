import { createContext, use } from 'react'

export type AuthDialogTab = 'signin' | 'signup'

export interface AuthDialogContextValue {
  isOpen: boolean
  tab: AuthDialogTab
  openDialog: (tab?: AuthDialogTab) => void
  closeDialog: () => void
  setTab: (tab: AuthDialogTab) => void
}

export const AuthDialogContext = createContext<AuthDialogContextValue | null>(
  null,
)

export function useAuthDialog() {
  const context = use(AuthDialogContext)

  if (!context) {
    throw new Error('useAuthDialog must be used within AuthDialogProvider')
  }

  return context
}
