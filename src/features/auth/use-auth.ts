import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession, signIn, signOut, signUp } from '../../lib/api/auth'
import { getApiErrorMessage, isUnauthorizedError } from '../../lib/api/errors'
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
      await queryClient.fetchQuery({
        queryKey: ['session'],
        queryFn: getSession,
        staleTime: 0,
      })
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
      await queryClient.fetchQuery({
        queryKey: ['session'],
        queryFn: getSession,
        staleTime: 0,
      })
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

export function useSignOutMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['session'] })
      notifyToast({
        tone: 'success',
        title: 'Sesión cerrada.',
        message: 'Has cerrado sesión en este dispositivo.',
      })
      navigate('/')
    },
    onError: (error) => {
      notifyToast({
        tone: 'error',
        title: 'No se pudo cerrar la sesión.',
        message: getApiErrorMessage(error),
      })
    },
  })
}

export function useSessionExpiry() {
  const queryClient = useQueryClient()

  return useCallback(
    (error: unknown) => {
      if (!isUnauthorizedError(error)) {
        return
      }

      queryClient.removeQueries({ queryKey: ['session'] })
    },
    [queryClient],
  )
}
