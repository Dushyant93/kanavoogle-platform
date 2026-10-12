import type { Assessment } from './assessment'
import type { User } from './auth'

export type StudentDashboard = {
  user: User
  recentAssessments: Assessment[],
  standing?: Standing | null
}

export type Standing = {
  place: number
  total: number
  percentile: number
}
