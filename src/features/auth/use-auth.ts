import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getSession, signIn, signUp } from '../../lib/api/auth'
import { notifyToast } from '../../lib/toast-store'
import { useAuthDialog } from './auth-dialog-context'

export function useSessionQuery() {
  return useQuery({
    queryKey: ['session'],
    queryFn: getSession,
    retry: false,
  })
}

export function useSignUpMutation() {
  const queryClient = useQueryClient()
  const { closeDialog } = useAuthDialog()

  return useMutation({
    mutationFn: signUp,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['session'] })
      notifyToast({
        tone: 'success',
        title: 'Cuenta creada correctamente.',
        message: 'Tu sesión ya está activa.',
      })
      closeDialog()
    },
  })
}

export function useSignInMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { closeDialog } = useAuthDialog()

  return useMutation({
    mutationFn: signIn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['session'] })
      notifyToast({
        tone: 'success',
        title: 'Sesión iniciada correctamente.',
        message: 'Redirigiendo a tus tareas.',
      })
      closeDialog()
      navigate('/tasks')
    },
  })
}
