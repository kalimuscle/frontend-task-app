import { apiClient } from './client'
import type { UserRole } from './types'

export interface UserSummary {
  id: string
  name: string
  email: string
  role: UserRole
}

export async function listUsers() {
  const response = await apiClient.get<UserSummary[]>('/users')

  return response.data
}
