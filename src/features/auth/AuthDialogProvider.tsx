import { useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AuthDialogContext,
  type AuthDialogTab,
} from './auth-dialog-context'

interface AuthDialogProviderProps {
  children: ReactNode
}

interface AuthLocationState {
  openAuth?: boolean
}

export function AuthDialogProvider({ children }: AuthDialogProviderProps) {
  const [isManuallyOpen, setIsManuallyOpen] = useState(false)
  const [tab, setTab] = useState<AuthDialogTab>('signin')
  const location = useLocation()
  const navigate = useNavigate()
  const routeState = location.state as AuthLocationState | null
  const routeRequestsOpen = routeState?.openAuth === true
  const isOpen = isManuallyOpen || routeRequestsOpen

  const value = useMemo(
    () => ({
      isOpen,
      tab,
      openDialog: (nextTab: AuthDialogTab = 'signin') => {
        setTab(nextTab)
        setIsManuallyOpen(true)
      },
      closeDialog: () => {
        setIsManuallyOpen(false)

        if (routeRequestsOpen) {
          navigate(location.pathname, { replace: true, state: null })
        }
      },
      setTab,
    }),
    [isOpen, location.pathname, navigate, routeRequestsOpen, tab],
  )

  return (
    <AuthDialogContext value={value}>{children}</AuthDialogContext>
  )
}
