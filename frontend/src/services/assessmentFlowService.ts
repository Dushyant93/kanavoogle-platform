// API calls for the assessment screens. Pages never call fetch directly; they go
// page -> hook (useAssessmentFlow) -> this service -> http.ts, same as the rest of the app.
//
// Local dev uses mock data unless VITE_USE_MOCKS=false (e.g. in .env.local).
// Production and Docker builds always use the real API.
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

/**
 * True when the backend doesn't have this endpoint yet. Spring normally answers 404/405,
 * but behind the JWT filter an unknown route comes back as 403 with no body. The
 * fallback calls check access the same way, so a real "no access" still shows as an error.
 */
function isMissingEndpoint(error: unknown) {
  return error instanceof ApiError && [403, 404, 405].includes(error.status)
}

/**
 * Builds a basic report from the finished test itself, for when the backend has no
 * /result endpoint yet. Shows the score and correct count; extras like competencies
 * and Skill Coins appear once the backend sends them.
 */
function reportFromAssessment(assessment: Assessment): AssessmentReport {
  const total = assessment.questions.length
  const percent = assessment.rawPercent ?? assessment.weightedPercent ?? 0
  return {
    assessment,
    totalQuestions: total,
    correctAnswers: Math.round((percent / 100) * total),
  }
}

export const assessmentFlowService = {
  /** GET /assessments — the signed-in student's assessments, newest first. */
  list(): Promise<AssessmentListItem[]> {
    if (USE_ASSESSMENT_MOCKS) return assessmentMocks.list()
    return request<AssessmentListItem[]>('/assessments').catch((error: unknown) => {
      // Until the backend adds the full list, show the latest 10 from /recent.
      if (isMissingEndpoint(error)) return request<AssessmentListItem[]>('/assessments/recent')
      throw error
    })
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

  /**
   * GET /assessments/:id/result. If the backend doesn't have it yet, uses the result
   * saved at submit time, or builds a basic report from GET /assessments/:id.
   */
  async report(id: string): Promise<AssessmentReport> {
    if (USE_ASSESSMENT_MOCKS) return assessmentMocks.report(id)
    try {
      return await request<AssessmentReport>(`/assessments/${encodeURIComponent(id)}/result`)
    } catch (error) {
      if (!isMissingEndpoint(error)) throw error
      const cached = readResult(id)
      if (cached) return cached
      const assessment = await assessmentService.get(id)
      if (!assessment.completedAt) throw new ApiError('This test isn’t finished yet.', 400)
      return reportFromAssessment(assessment)
    }
  },
}
