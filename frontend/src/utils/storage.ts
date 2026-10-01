import type { AssessmentResult } from '../types/results'

const RESULT_PREFIX = 'kanavoogle:result:'

export function writeResult(assessmentId: string, result: AssessmentResult) {
  sessionStorage.setItem(`${RESULT_PREFIX}${assessmentId}`, JSON.stringify(result))
}

export function readResult(assessmentId: string): AssessmentResult | null {
  const raw = sessionStorage.getItem(`${RESULT_PREFIX}${assessmentId}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AssessmentResult
  } catch {
    return null
  }
}

export function clearResult(assessmentId: string) {
  sessionStorage.removeItem(`${RESULT_PREFIX}${assessmentId}`)
}
