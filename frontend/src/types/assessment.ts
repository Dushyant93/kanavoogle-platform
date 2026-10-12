export const COMPLEXITY_LEVELS = ['FOUNDATION', 'INTERMEDIATE', 'ADVANCED'] as const

export type Complexity = (typeof COMPLEXITY_LEVELS)[number]

export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_TEXT'

export type AssessmentQuestion = {
  questionId: string
  type: QuestionType | string
  prompt: string
  options: string[]
}

export type Assessment = {
  id: string
  skillId: string
  skillName: string
  subSkillId: string
  subSkillName: string
  context: string
  complexity: Complexity
  status: string
  questions: AssessmentQuestion[]
  rawPercent?: number | null
  weightedPercent?: number | null
  coinAllocationStatus: string
  createdAt: string
  completedAt?: string | null
}

export type CreateAssessment = {
  skillId: string
  subSkillId: string
  context: string
  complexity: Complexity
  questionCount: number
}

export type SubmitAssessment = {
  responses: Record<string, string>
}
