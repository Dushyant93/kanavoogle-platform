import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight, faCheck, faCircle } from '@fortawesome/free-solid-svg-icons'
import Form from 'react-bootstrap/Form'
import ProgressBar from 'react-bootstrap/ProgressBar'
import { useAssessmentToTake } from '../../hooks/useAssessmentFlow'
import { assessmentFlowService } from '../../services/assessmentFlowService'
import type { Assessment, AssessmentQuestion } from '../../types/assessment'
import type { SubmitAnswersRequest } from '../../types/assessmentFlow'
import { toErrorMessage } from '../../utils/errors'
import { AssessmentLayout, ErrorBlock, LoadingBlock } from './AssessmentLayout'
import { assessmentPaths, idFromUrl } from './paths'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

// Most questions are multiple choice. AI-made questions can also be True/False
// (sometimes sent without options) or a short typed answer.
function choicesFor(question: AssessmentQuestion) {
  if (question.options.length > 0) return question.options
  if (question.type === 'TRUE_FALSE') return ['True', 'False']
  return []
}

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
  const choices = choicesFor(question)
  const selected = responses[question.questionId]
  const answered = Boolean(selected?.trim())

  function setAnswer(value: string) {
    setResponses((current) => ({ ...current, [question.questionId]: value }))
  }

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
    const trimmed = Object.fromEntries(Object.entries(responses).map(([id, value]) => [id, value.trim()]))
    const body: SubmitAnswersRequest = { responses: trimmed, timeSpentMs: timeSpent.current }
    try {
      await assessmentFlowService.submit(assessment.id, body)
      window.location.assign(assessmentPaths.complete(assessment.id))
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
        <ProgressBar now={progress} className="tests-progress__bar" aria-label="Test progress" />
      </section>

      <section className="tests-card tests-question" aria-labelledby="question-prompt">
        <h2 id="question-prompt" className="tests-question__prompt">
          {question.prompt}
        </h2>
        {choices.length === 0 ? (
          <Form.Control
            as="textarea"
            rows={3}
            maxLength={300}
            value={selected ?? ''}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type your answer"
            aria-labelledby="question-prompt"
          />
        ) : (
          <div className="tests-options" role="radiogroup" aria-labelledby="question-prompt">
            {choices.map((option, optionIndex) => {
              const isSelected = selected === option
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`tests-option${isSelected ? ' is-selected' : ''}`}
                  onClick={() => setAnswer(option)}
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
        )}
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
            disabled={!answered || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting...' : 'Submit Test'} <FontAwesomeIcon icon={faCheck} />
          </button>
        ) : (
            <button
              type="button"
              className="tests-btn tests-btn--primary"
              disabled={!answered}
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
      {!id ? <ErrorBlock message="No test selected. Start a test from the Tests page." /> : null}
      {id && loading ? <LoadingBlock label="Loading questions" /> : null}
      {id && error ? <ErrorBlock message={error} /> : null}
      {data && data.completedAt ? (
        <div className="tests-empty">
          You’ve already finished this test. <a href={assessmentPaths.result(data.id)}>View your result</a>.
        </div>
      ) : null}
      {data && !data.completedAt && data.questions.length === 0 ? (
        <div className="tests-empty">This test has no questions yet.</div>
      ) : null}
      {data && !data.completedAt && data.questions.length > 0 ? <QuestionRunner assessment={data} /> : null}
    </AssessmentLayout>
  )
}
