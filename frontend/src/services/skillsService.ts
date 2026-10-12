import type { Skill } from '../types/skills'
import { request } from './http'

export const skillsService = {
  list() {
    return request<Skill[]>('/skills')
  },
  get(id: string) {
    return request<Skill>(`/skills/${id}`)
  },
}
