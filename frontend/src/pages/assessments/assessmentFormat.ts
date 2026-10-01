// Display helpers used only by the assessment screens.
import type { AssessmentListItem } from '../../types/assessmentFlow'

export function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Pending'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Pending'
  const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${day} • ${time}`
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Score out of 100, or null while the assessment is still being scored. */
export function scoreOf(item: AssessmentListItem) {
  const value = item.weightedPercent ?? item.rawPercent
  return value == null ? null : Math.round(value)
}

/** Confirmed = finished and scored. Everything else shows as Pending. */
export function isConfirmed(item: AssessmentListItem) {
  return item.completedAt != null && scoreOf(item) != null
}

export function questionCountOf(item: AssessmentListItem) {
  return item.questionCount ?? item.questions.length
}

/** 795 -> "13m 15s", 42 -> "42s", 3725 -> "1h 2m". */
export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

// Placeholder bands until the team agrees the real grading scale.
export function gradeFor(percent: number) {
  if (percent >= 95) return 'A+'
  if (percent >= 85) return 'A'
  if (percent >= 75) return 'B'
  if (percent >= 65) return 'C'
  if (percent >= 50) return 'D'
  return 'F'
}
