// Types for the assessment screens (list, start, questions, result).
// They build on the team's shared types in assessment.ts and results.ts rather
// than replacing them. Every extra field is optional, so the screens still work
// if the backend only returns the base shapes.
import type { Assessment, CreateAssessment, SubmitAssessment } from './assessment'
import type { AssessmentResult } from './results'

export const AGE_GROUPS = ['13-14', '15-16', '17-19'] as const
export type AgeGroup = (typeof AGE_GROUPS)[number]

/** One row on the Assessment List screen. GET /assessments returns an array of these. */
export type AssessmentListItem = Assessment & {
  title?: string
  questionCount?: number
  coinsAwarded?: number | null
}

/** Body for POST /assessments from the Start Assessment screen. */
export type StartAssessmentRequest = CreateAssessment & {
  ageGroup?: AgeGroup
}

/** Body for POST /assessments/:id/submit. timeSpentMs is keyed by questionId. */
export type SubmitAnswersRequest = SubmitAssessment & {
  timeSpentMs?: Record<string, number>
}

export type CompetencyResult = {
  subSkillName: string
  masteryPercent: number
  /** Evidence labels, e.g. "Q1 User Persona Synthesis". */
  evidence: string[]
  pointsEarned?: number
  pointsPossible?: number
}

export type CredentialProof = {
  credentialId: string
  ledgerHash: string
  anchored: boolean
  verifiedBy?: string
}

/** What the Result screen shows. Returned by submit and by GET /assessments/:id/result. */
export type AssessmentReport = AssessmentResult & {
  studentName?: string
  /** The student's wallet ID shown under their name, e.g. "SC-882194". */
  studentId?: string
  grade?: string
  coinsEarned?: number | null
  /** Total time on the test. If missing, the screen uses completedAt - createdAt. */
  timeTakenSeconds?: number
  competencies?: CompetencyResult[]
  credential?: CredentialProof | null
}
