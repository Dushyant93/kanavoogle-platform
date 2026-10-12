import type { StudentDashboard } from '../types/dashboard'
import { request } from './http'

export const studentService = {
  dashboard() {
    return request<StudentDashboard>('/dashboard/student')
  },
}
