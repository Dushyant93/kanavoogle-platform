import type { AssessmentResult } from '../types/results'
import { readResult, writeResult } from '../utils/storage'
import { request } from './http'

export const resultsService = {
  async submit(assessmentId: string, responses: Record<string, string>) {
    const result = await request<AssessmentResult>(`/assessments/${assessmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ responses }),
    })
    writeResult(assessmentId, result)
    return result
  },
  getCached(assessmentId: string) {
    return readResult(assessmentId)
  },
}
