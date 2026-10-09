import type { Assessment } from './assessment'
import type { User } from './auth'

export type Standing = {
  place: number
  total: number
  percentile: number
}

export type StudentDashboard = {
  user: User
  recentAssessments: Assessment[]
  standing?: Standing | null
}
