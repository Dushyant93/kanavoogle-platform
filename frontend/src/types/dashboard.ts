import type { Assessment } from './assessment'
import type { User } from './auth'

export type StudentDashboard = {
  user: User
  recentAssessments: Assessment[]
}
