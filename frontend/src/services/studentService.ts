import type { StudentDashboard } from '../types/dashboard'
import { request } from './http'

export const studentService = {
  dashboard() {
    return request<StudentDashboard>('/dashboard/student')
  },
  schoolDashboard() {
    return request<{ user: import('../types/auth').User; message: string }>('/dashboard/school')
  },
  employerDashboard() {
    return request<{ user: import('../types/auth').User; message: string }>('/dashboard/employer')
  },
}
