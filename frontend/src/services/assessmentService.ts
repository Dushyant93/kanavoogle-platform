import type { Assessment, CreateAssessment } from '../types/assessment'
import { request } from './http'

export const assessmentService = {
  list() {
    return request<Assessment[]>('/assessments')
  },
  create(body: CreateAssessment) {
    return request<Assessment>('/assessments', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
  get(id: string) {
    return request<Assessment>(`/assessments/${id}`)
  },
  recent() {
    return request<Assessment[]>('/assessments/recent')
  },
}
