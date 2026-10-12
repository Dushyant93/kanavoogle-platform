import { useEffect, useState } from 'react'
import { studentService } from '../services/studentService'
import type { StudentDashboard } from '../types/dashboard'
import { toErrorMessage } from '../utils/errors'

export function useStudent() {
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    studentService
      .dashboard()
      .then((data) => {
        if (active) setDashboard(data)
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

  return { dashboard, loading, error }
}
