export type UserRole = 'ADMIN' | 'USER'

export interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
  role: UserRole
}

export interface AuthSession {
  session: {
    id: string
    token: string
    userId: string
    expiresAt: string
    ipAddress: string | null
    userAgent: string | null
    createdAt: string
    updatedAt: string
  }
  user: AuthUser
}

export interface AuthResponse {
  token: string
  user: AuthUser
  redirect?: boolean
  url?: string
}
