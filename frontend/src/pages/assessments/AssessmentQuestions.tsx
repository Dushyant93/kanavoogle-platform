import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight, faCheck, faCircle } from '@fortawesome/free-solid-svg-icons'
import ProgressBar from 'react-bootstrap/ProgressBar'
import { useAssessmentToTake } from '../../hooks/useAssessmentFlow'
import { assessmentFlowService } from '../../services/assessmentFlowService'
import type { Assessment } from '../../types/assessment'
import type { SubmitAnswersRequest } from '../../types/assessmentFlow'
import { toErrorMessage } from '../../utils/errors'
import { AssessmentLayout, ErrorBlock, LoadingBlock } from './AssessmentLayout'
import { assessmentPaths, idFromUrl } from './paths'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function QuestionRunner({ assessment }: { assessment: Assessment }) {
  const questions = assessment.questions
  const [index, setIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Time spent on each question (ms). The partner wants time tracked for scoring.
  const timeSpent = useRef<Record<string, number>>({})
  const shownAt = useRef(0)

  const question = questions[index]
  const total = questions.length
  const isLast = index === total - 1
  const progress = Math.round(((index + 1) / total) * 1000) / 10
  const selected = responses[question.questionId]

  useEffect(() => {
    shownAt.current = Date.now()
  }, [index])

  function recordTime() {
    const id = question.questionId
    timeSpent.current[id] = (timeSpent.current[id] ?? 0) + (Date.now() - shownAt.current)
  }

  function goTo(nextIndex: number) {
    recordTime()
    setIndex(nextIndex)
  }

  async function handleSubmit() {
    recordTime()
    setSubmitting(true)
    setError(null)
    const body: SubmitAnswersRequest = { responses, timeSpentMs: timeSpent.current }
    try {
      await assessmentFlowService.submit(assessment.id, body)
      window.location.assign(assessmentPaths.result(assessment.id))
    } catch (err) {
      setError(toErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <>
      <span className="tests-badge tests-badge--success mb-3">
        <FontAwesomeIcon icon={faCircle} className="tests-badge__dot" /> {assessment.skillName}
      </span>

      <section className="tests-card tests-progress">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <strong className="tests-progress__label">
            Question {index + 1} of {total}
          </strong>
          <span className="tests-chip tests-chip--success">{progress}% Completed</span>
        </div>
        <ProgressBar now={progress} className="tests-progress__bar" aria-label="Assessment progress" />
      </section>

      <section className="tests-card tests-question" aria-labelledby="question-prompt">
        <h2 id="question-prompt" className="tests-question__prompt">
          {question.prompt}
        </h2>
        <div className="tests-options" role="radiogroup" aria-labelledby="question-prompt">
          {question.options.map((option, optionIndex) => {
            const isSelected = selected === option
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`tests-option${isSelected ? ' is-selected' : ''}`}
                onClick={() => setResponses((current) => ({ ...current, [question.questionId]: option }))}
              >
                <span className="tests-option__letter">{OPTION_LETTERS[optionIndex]}</span>
                <span className="tests-option__text">{option}</span>
                {isSelected ? (
                  <span className="tests-option__check" aria-hidden="true">
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </section>

      {error ? <ErrorBlock message={error} /> : null}

      <nav className="tests-card tests-question__nav" aria-label="Question navigation">
        <button
          type="button"
          className="tests-btn tests-btn--outline"
          disabled={index === 0 || submitting}
          onClick={() => goTo(index - 1)}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Previous
        </button>
        {isLast ? (
          <button
            type="button"
            className="tests-btn tests-btn--primary"
            disabled={!selected || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'} <FontAwesomeIcon icon={faCheck} />
          </button>
        ) : (
          <button
            type="button"
            className="tests-btn tests-btn--primary"
            disabled={!selected}
            onClick={() => goTo(index + 1)}
          >
            Next question <FontAwesomeIcon icon={faArrowRight} />
          </button>
        )}
      </nav>
    </>
  )
}

export function AssessmentQuestions() {
  const id = idFromUrl()
  const { data, loading, error } = useAssessmentToTake(id)

  return (
    <AssessmentLayout narrow>
      {!id ? <ErrorBlock message="No assessment selected. Start a test from the Tests page." /> : null}
      {id && loading ? <LoadingBlock label="Loading questions" /> : null}
      {id && error ? <ErrorBlock message={error} /> : null}
      {data && data.completedAt ? (
        <div className="tests-empty">
          You’ve already finished this assessment. <a href={assessmentPaths.result(data.id)}>View your result</a>.
        </div>
      ) : null}
      {data && !data.completedAt && data.questions.length === 0 ? (
        <div className="tests-empty">This assessment has no questions yet.</div>
      ) : null}
      {data && !data.completedAt && data.questions.length > 0 ? <QuestionRunner assessment={data} /> : null}
    </AssessmentLayout>
  )
}
