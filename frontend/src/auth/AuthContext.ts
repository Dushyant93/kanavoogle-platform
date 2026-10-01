import { createContext } from 'react'
import type { User } from '../types/auth'

export type AuthContextValue = {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
