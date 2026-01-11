// AIModified:2026-01-11T06:08:23Z
export type UserRole = 'HR' | 'PANEL'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}
