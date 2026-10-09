// Hooks for the assessment screens. Each returns { data, loading, error } so the
// pages only deal with display, never with fetch or mock details.
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../auth/AuthContext'
import { assessmentFlowService } from '../services/assessmentFlowService'
import type { Assessment } from '../types/assessment'
import type { AssessmentListItem, AssessmentReport } from '../types/assessmentFlow'
import type { User } from '../types/auth'
import type { Skill } from '../types/skills'
import { toErrorMessage } from '../utils/errors'

type Loadable<T> = { data: T | null; loading: boolean; error: string | null }

/** Loads data whenever `key` changes. An empty key means "nothing to load yet". */
function useLoad<T>(load: () => Promise<T>, key: string): Loadable<T> {
  const [state, setState] = useState<Loadable<T> & { key: string }>({
    data: null,
    loading: key !== '',
    error: null,
    key,
  })

  if (state.key !== key) {
    setState({ data: null, loading: key !== '', error: null, key })
  }

  useEffect(() => {
    if (!key) return
    let active = true
    Promise.resolve()
      .then(load)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null, key })
      })
      .catch((err: unknown) => {
        if (active) setState({ data: null, loading: false, error: toErrorMessage(err), key })
      })
    return () => {
      active = false
    }
    // `load` is recreated every render; `key` decides when to refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { data: state.data, loading: state.loading, error: state.error }
}

export function useAssessmentList() {
  return useLoad<AssessmentListItem[]>(() => assessmentFlowService.list(), 'list')
}

export function useSkillOptions() {
  return useLoad<Skill[]>(() => assessmentFlowService.skills(), 'skills')
}

export function useSkill(id: string) {
  return useLoad<Skill>(() => assessmentFlowService.skill(id), id ? `skill:${id}` : '')
}

export function useAssessmentToTake(id: string) {
  return useLoad<Assessment>(() => assessmentFlowService.get(id), id ? `take:${id}` : '')
}

export function useAssessmentReport(id: string) {
  return useLoad<AssessmentReport>(() => assessmentFlowService.report(id), id ? `report:${id}` : '')
}

/** The signed-in student from GET /api/auth/me. */
export function useCurrentStudent(): User | null {
  const auth = useContext(AuthContext)
  return auth?.user ?? null
}
