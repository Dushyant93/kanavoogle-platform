import type { Assessment } from './assessment'

export type AssessmentResult = {
  assessment: Assessment
  correctAnswers: number
  totalQuestions: number
}
