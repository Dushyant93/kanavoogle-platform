// Route table for the assessment screens. App.tsx only needs:
//   const AssessmentPage = assessmentRoutes[path]
//   if (AssessmentPage) return <AssessmentPage />
import type { ComponentType } from 'react'
import { AssessmentComplete } from './AssessmentComplete'
import { AssessmentConfig } from './AssessmentConfig'
import { AssessmentList } from './AssessmentList'
import { AssessmentQuestions } from './AssessmentQuestions'
import { AssessmentResult } from './AssessmentResult'
import { assessmentPaths } from './paths'

export const assessmentRoutes: Record<string, ComponentType> = {
  [assessmentPaths.list]: AssessmentList,
  [assessmentPaths.start]: AssessmentConfig,
  '/tests/take': AssessmentQuestions,
  '/tests/complete': AssessmentComplete,
  '/tests/result': AssessmentResult,
}
