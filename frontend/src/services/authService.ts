import type { LoginRequest, User } from '../types/auth'
import type { StudentRegistration } from '../types/student'
import { request } from './http'

export const authService = {
  me() {
    return request<User>('/auth/me')
  },
  login(body: LoginRequest) {
    return request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
  logout() {
    return request<void>('/auth/logout', { method: 'POST' })
  },
  registerStudent(body: StudentRegistration) {
    return request<User>('/auth/register/student', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
}
