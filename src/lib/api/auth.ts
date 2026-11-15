import type { SignInInput, SignUpInput } from '../schemas/auth'
import { apiClient } from './client'
import type { AuthResponse, AuthSession } from './types'

export async function signUp(input: SignUpInput) {
  const response = await apiClient.post<AuthResponse>(
    '/auth/sign-up/email',
    input,
  )

  return response.data
}

export async function signIn(input: SignInInput) {
  const response = await apiClient.post<AuthResponse>(
    '/auth/sign-in/email',
    input,
  )

  return response.data
}

export async function getSession() {
  const response = await apiClient.get<AuthSession | null>('/auth/get-session')

  return response.data
}

export async function signOut() {
  const response = await apiClient.post<{ success: boolean }>('/auth/sign-out')

  return response.data
}
