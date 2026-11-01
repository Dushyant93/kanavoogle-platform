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

export const USE_ASSESSMENT_MOCKS = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true'

function isMissingEndpoint(error: unknown) {
  return error instanceof ApiError && [404, 405].includes(error.status)
}

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
  list(): Promise<AssessmentListItem[]> {
    return assessmentService.list()
  },

  /** GET /skills — reuses the shared skills service. */
  skills(): Promise<Skill[]> {
    return skillsService.list()
  },

  skill(id: string): Promise<Skill> {
    return skillsService.get(id)
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
