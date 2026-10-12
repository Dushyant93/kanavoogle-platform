import { useEffect, useState } from 'react'
import { skillsService } from '../services/skillsService'
import type { Skill } from '../types/skills'
import { toErrorMessage } from '../utils/errors'

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    skillsService
      .list()
      .then((data) => {
        if (active) setSkills(data)
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

  return { skills, loading, error }
}
