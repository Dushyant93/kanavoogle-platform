import { useState } from 'react'
import { resultsService } from '../services/resultsService'
import type { AssessmentResult } from '../types/results'

export function useResults(assessmentId: string) {
  const [storedId, setStoredId] = useState(assessmentId)
  const [result, setResult] = useState<AssessmentResult | null>(() =>
    resultsService.getCached(assessmentId),
  )

  if (storedId !== assessmentId) {
    setStoredId(assessmentId)
    setResult(resultsService.getCached(assessmentId))
  }

  return { result }
}
