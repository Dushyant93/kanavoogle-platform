// API calls for the assessment screens. Pages never call fetch directly; they go
// page -> hook (useAssessmentFlow) -> this service -> http.ts, same as the rest of the app.
//
// While the backend isn't ready, local dev uses mock data. Set VITE_USE_MOCKS=false
// (e.g. in .env.local) to hit the real API. Production builds never use mocks.
import type { Assessment } from '../types/assessment'
import type {
  AssessmentListItem,
  AssessmentReport,
  StartAssessmentRequest,
  SubmitAnswersRequest,
} from '../types/assessmentFlow'
import type { Skill } from '../types/skills'
import { readResult, writeResult } from '../utils/storage'
import { assessmentService } from './assessmentService'
import { ApiError, request } from './http'
import { assessmentMocks } from './mocks/assessmentMocks'
import { skillsService } from './skillsService'

export const USE_ASSESSMENT_MOCKS = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false'

export const assessmentFlowService = {
  /** GET /assessments — the signed-in student's assessments, newest first. */
  list(): Promise<AssessmentListItem[]> {
    if (USE_ASSESSMENT_MOCKS) return assessmentMocks.list()
    return request<AssessmentListItem[]>('/assessments')
  },

  /** GET /skills — reuses the shared skills service. */
  skills(): Promise<Skill[]> {
    if (USE_ASSESSMENT_MOCKS) return assessmentMocks.skills()
    return skillsService.list()
  },

  /** POST /assessments — reuses the shared assessment service. */
  start(body: StartAssessmentRequest): Promise<Assessment> {
    if (USE_ASSESSMENT_MOCKS) return assessmentMocks.start(body)
    return assessmentService.create(body)
  },

  /** GET /assessments/:id — the assessment with its questions (no answers). */
  get(id: string): Promise<Assessment> {
    if (USE_ASSESSMENT_MOCKS) return assessmentMocks.get(id)
    return assessmentService.get(id)
  },

  /** POST /assessments/:id/submit — same endpoint as resultsService.submit, plus timings. */
  async submit(id: string, body: SubmitAnswersRequest): Promise<AssessmentReport> {
    const report = USE_ASSESSMENT_MOCKS
      ? await assessmentMocks.submit(id, body)
      : await request<AssessmentReport>(`/assessments/${encodeURIComponent(id)}/submit`, {
          method: 'POST',
          body: JSON.stringify(body),
        })
    writeResult(id, report)
    return report
  },

  /** GET /assessments/:id/result — falls back to the result cached at submit time. */
  async report(id: string): Promise<AssessmentReport> {
    if (USE_ASSESSMENT_MOCKS) return assessmentMocks.report(id)
    try {
      return await request<AssessmentReport>(`/assessments/${encodeURIComponent(id)}/result`)
    } catch (error) {
      const cached = readResult(id)
      if (cached && error instanceof ApiError && error.status === 404) return cached
      throw error
    }
  },
}
