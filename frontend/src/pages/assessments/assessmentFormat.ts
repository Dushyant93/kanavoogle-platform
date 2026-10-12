// Display helpers used only by the assessment screens.
import type { AssessmentListItem, AssessmentReport } from '../../types/assessmentFlow'

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

// The number of questions in a test comes from the student's age (given at registration),
// not from the Start Test screen. Change the numbers here if the team agrees new ones.
const QUESTIONS_BY_AGE: { minAge: number; maxAge: number; questions: number }[] = [
  { minAge: 13, maxAge: 14, questions: 10 },
  { minAge: 15, maxAge: 16, questions: 15 },
  { minAge: 17, maxAge: 19, questions: 20 },
]
const DEFAULT_QUESTIONS = 10

// The question bank has 10 questions per sub-skill and level, and the backend refuses a
// test it can't fill ("Not enough approved questions"). Its hard limit is 15. Until the bank
// grows, ask for at most this many so every student can start a test.
export const MAX_QUESTIONS_PER_TEST = 10

function ageBand(age: number | null | undefined) {
  return QUESTIONS_BY_AGE.find((band) => age != null && age >= band.minAge && age <= band.maxAge)
}

export function questionCountForAge(age: number | null | undefined) {
  return Math.min(ageBand(age)?.questions ?? DEFAULT_QUESTIONS, MAX_QUESTIONS_PER_TEST)
}

/** Text for the coin status chip, e.g. "PENDING_STAKEHOLDER_RULES" -> "Skill Coins pending". */
export function coinStatusLabel(status: string | null | undefined) {
  if (!status || status.toUpperCase().startsWith('PENDING')) return 'Skill Coins pending'
  return `Skill Coins ${status.toLowerCase().replace(/_/g, ' ')}`
}

/** Score out of 100 for a finished test. */
export function percentFor(report: AssessmentReport) {
  const { assessment } = report
  return Math.round(
    assessment.weightedPercent ??
      assessment.rawPercent ??
      (report.totalQuestions ? (report.correctAnswers / report.totalQuestions) * 100 : 0),
  )
}

// Below this score we don't show the number or a low result, only encouragement.
export const LOW_SCORE_PERCENT = 30

export function isLowScore(percent: number) {
  return percent < LOW_SCORE_PERCENT
}

/** A positive message for the end of a test, used instead of a letter grade. */
export function remarkFor(percent: number) {
  if (percent >= 85) return { title: 'Outstanding work!', message: 'You really know this sub-skill. Keep it up!' }
  if (percent >= 60)
    return { title: 'Great job!', message: 'You are building real skill here. Your report shows what went well.' }
  if (percent >= LOW_SCORE_PERCENT)
    return { title: 'Good effort!', message: 'Every test helps you grow. Your report shows what to practise next.' }
  return { title: 'Better luck next time!', message: 'Practice makes progress. Try again when you are ready.' }
}
