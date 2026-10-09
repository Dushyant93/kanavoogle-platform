import { useEffect, useState, type FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import Form from 'react-bootstrap/Form'
import { useSkill, useSkillOptions } from '../../hooks/useAssessmentFlow'
import { assessmentFlowService } from '../../services/assessmentFlowService'
import type { Complexity } from '../../types/assessment'
import type { StartAssessmentRequest } from '../../types/assessmentFlow'
import type { Skill } from '../../types/skills'
import { toErrorMessage } from '../../utils/errors'
import { AssessmentLayout, ErrorBlock, LoadingBlock } from './AssessmentLayout'
import { assessmentPaths } from './paths'

const DIFFICULTY_OPTIONS: {
  value: Complexity
  label: string
  weight: number
  caption: string
  optimal?: boolean
}[] = [
  { value: 'FOUNDATION', label: 'Low', weight: 1, caption: 'Score weight' },
  { value: 'INTERMEDIATE', label: 'Medium', weight: 1.25, caption: 'Score weight', optimal: true },
  { value: 'ADVANCED', label: 'High', weight: 1.5, caption: 'Score weight' },
]

const MIN_QUESTIONS = 3
const MAX_QUESTIONS = 15

function StartForm({ skills }: { skills: Skill[] }) {
  const [skillId, setSkillId] = useState(skills[0]?.id ?? '')
  const [subSkillId, setSubSkillId] = useState('')
  const [complexity, setComplexity] = useState<Complexity>('INTERMEDIATE')
  const [questionCount, setQuestionCount] = useState('8')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: skill, loading: skillLoading, error: skillError } = useSkill(skillId)
  const subSkills = skill?.subSkills.filter((item) => item.active) ?? []

  useEffect(() => {
    setSubSkillId(skill?.subSkills.find((item) => item.active)?.id ?? '')
  }, [skill])

  const count = Number(questionCount)
  const countValid = Number.isInteger(count) && count >= MIN_QUESTIONS && count <= MAX_QUESTIONS
  const formValid = Boolean(skillId && subSkillId && countValid)

  function handleSkillChange(nextSkillId: string) {
    setSkillId(nextSkillId)
    setSubSkillId('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!formValid) return

    const body: StartAssessmentRequest = {
      skillId,
      subSkillId,
      complexity,
      questionCount: count,
      context: '',
    }

    setBusy(true)
    setError(null)
    try {
      const assessment = await assessmentFlowService.start(body)
      window.location.assign(assessmentPaths.take(assessment.id))
    } catch (err) {
      setError(toErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <Form className="tests-card tests-config" onSubmit={handleSubmit} noValidate>
      {error ? <ErrorBlock message={error} /> : null}

      <Form.Group className="mb-4" controlId="config-skill">
        <Form.Label className="tests-label">Primary Skill</Form.Label>
        <Form.Select value={skillId} onChange={(event) => handleSkillChange(event.target.value)}>
          {skills.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Form.Select>
        {skill?.description ? <Form.Text className="tests-hint">{skill.description}</Form.Text> : null}
      </Form.Group>

      <fieldset className="mb-4">
        <legend className="tests-label">Target Sub-skill</legend>
        {skillLoading ? <div className="tests-hint">Loading sub-skills</div> : null}
        {skillError ? <ErrorBlock message={skillError} /> : null}
        <div className="d-flex flex-wrap gap-2">
          {subSkills.map((item) => {
            const selected = item.id === subSkillId
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                className={`tests-pill${selected ? ' is-selected' : ''}`}
                onClick={() => setSubSkillId(item.id)}
              >
                {item.name}
                {selected ? <FontAwesomeIcon icon={faCheck} /> : null}
              </button>
            )
          })}
        </div>
        {submitted && !subSkillId ? <div className="tests-error">Pick a sub-skill to continue.</div> : null}
      </fieldset>

      <fieldset className="mb-4">
        <div className="d-flex justify-content-between align-items-baseline">
          <legend className="tests-label">Difficulty Level</legend>
          <span className="tests-hint">Adaptive dynamic calibration</span>
        </div>
        <div className="tests-difficulty">
          {DIFFICULTY_OPTIONS.map((option) => {
            const selected = option.value === complexity
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                className={`tests-difficulty__option${selected ? ' is-selected' : ''}`}
                onClick={() => setComplexity(option.value)}
              >
                {option.optimal ? <span className="tests-difficulty__badge">Optimal</span> : null}
                <span className="tests-difficulty__name">{option.label}</span>
                <span
                  className={`tests-difficulty__reward${option.weight === 1.5 ? ' tests-difficulty__reward--gold' : ''}`}
                >
                  {option.weight}
                </span>
                <span className="tests-difficulty__caption">{option.caption}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <Form.Group className="mb-4" controlId="config-count">
        <Form.Label className="tests-label">Number of Questions</Form.Label>
        <Form.Control
          className="tests-config__count"
          type="number"
          inputMode="numeric"
          min={MIN_QUESTIONS}
          max={MAX_QUESTIONS}
          value={questionCount}
          isInvalid={submitted && !countValid}
          onChange={(event) => setQuestionCount(event.target.value)}
        />
        <Form.Text className="tests-hint">Choose 3–15 questions</Form.Text>
        <Form.Control.Feedback type="invalid">
          Enter a number between {MIN_QUESTIONS} and {MAX_QUESTIONS}.
        </Form.Control.Feedback>
      </Form.Group>

      <div className="tests-config__actions">
        <a className="tests-btn tests-btn--ghost" href={assessmentPaths.list}>
          Cancel
        </a>
        <button type="submit" className="tests-btn tests-btn--primary" disabled={busy}>
          {busy ? 'Preparing questions...' : 'Launch Test'} <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </Form>
  )
}

export function AssessmentConfig() {
  const { data, loading, error } = useSkillOptions()
  const skills = (data ?? []).filter((skill) => skill.active)

  return (
    <AssessmentLayout narrow>
      <h1 className="tests-title">Start Test</h1>
      <p className="tests-subtitle mb-4">
        Configure your competency evaluation, select target sub-skills, and calibrate test difficulty to mint verified
        Skill-Coins.
      </p>
      {loading ? <LoadingBlock label="Loading skills" /> : null}
      {error ? <ErrorBlock message={error} /> : null}
      {!loading && !error && skills.length === 0 ? (
        <div className="tests-empty">No skills are available yet. Please check back later.</div>
      ) : null}
      {!loading && !error && skills.length > 0 ? <StartForm skills={skills} /> : null}
    </AssessmentLayout>
  )
}
