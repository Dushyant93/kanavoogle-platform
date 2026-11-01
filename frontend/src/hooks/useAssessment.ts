import { useEffect, useState } from 'react'
import { assessmentService } from '../services/assessmentService'
import type { Assessment } from '../types/assessment'
import { toErrorMessage } from '../utils/errors'

export function useAssessment(assessmentId: string) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loadedId, setLoadedId] = useState(assessmentId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  if (loadedId !== assessmentId) {
    setLoadedId(assessmentId)
    setAssessment(null)
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    let active = true
    assessmentService
      .get(assessmentId)
      .then((data) => {
        if (active) setAssessment(data)
      })
      .catch((err: unknown) => {
        if (active) setError(toErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [assessmentId])

  return { assessment, loading, error }
}

export function useRecentAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    assessmentService
      .recent()
      .then((data) => {
        if (active) setAssessments(data)
      })
      .catch((err: unknown) => {
        if (active) setError(toErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { assessments, loading, error }
}
