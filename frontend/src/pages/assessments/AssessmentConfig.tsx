import { useState, type FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronRight, faListOl } from '@fortawesome/free-solid-svg-icons'
import Form from 'react-bootstrap/Form'
import { useCurrentStudent, useSkillOptions } from '../../hooks/useAssessmentFlow'
import { assessmentFlowService } from '../../services/assessmentFlowService'
import type { Complexity } from '../../types/assessment'
import type { StartAssessmentRequest } from '../../types/assessmentFlow'
import type { Skill } from '../../types/skills'
import { toErrorMessage } from '../../utils/errors'
import { AssessmentLayout, ErrorBlock, LoadingBlock } from './AssessmentLayout'
import { questionCountForAge } from './assessmentFormat'
import { assessmentPaths } from './paths'

const DIFFICULTY_OPTIONS: {
  value: Complexity
  label: string
  reward: number
  caption: string
  optimal?: boolean
}[] = [
  { value: 'FOUNDATION', label: 'Low', reward: 1, caption: 'Base Reward' },
  { value: 'INTERMEDIATE', label: 'Medium', reward: 2, caption: 'Standard', optimal: true },
  { value: 'ADVANCED', label: 'High', reward: 3, caption: 'Mastery' },
]

function StartForm({ skills, age }: { skills: Skill[]; age: number | null }) {
  const [skillId, setSkillId] = useState(skills[0]?.id ?? '')
  const [subSkillId, setSubSkillId] = useState(skills[0]?.subSkills.find((item) => item.active)?.id ?? '')
  const [complexity, setComplexity] = useState<Complexity>('INTERMEDIATE')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const skill = skills.find((item) => item.id === skillId)
  const subSkills = skill?.subSkills.filter((item) => item.active) ?? []

  // Set by age group from registration; the student doesn't choose it.
  const count = questionCountForAge(age)
  const formValid = Boolean(skillId && subSkillId)

  function handleSkillChange(nextSkillId: string) {
    setSkillId(nextSkillId)
    const next = skills.find((item) => item.id === nextSkillId)
    setSubSkillId(next?.subSkills.find((item) => item.active)?.id ?? '')
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
      </Form.Group>

      <fieldset className="mb-4">
        <legend className="tests-label">Target Sub-skill</legend>
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
                  className={`tests-difficulty__reward${option.reward === 3 ? ' tests-difficulty__reward--gold' : ''}`}
                >
                  +{option.reward}
                </span>
                <span className="tests-difficulty__caption">{option.caption}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="tests-config__count-info mb-4">
        <FontAwesomeIcon icon={faListOl} aria-hidden="true" />
        <strong>{count} questions</strong>
      </div>

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
  const age = useCurrentStudent()?.studentProfile?.age ?? null

  return (
    <AssessmentLayout narrow>
      <h1 className="tests-title">Start Test</h1>
      <p className="tests-subtitle mb-4">
        Choose a skill, a sub-skill and a difficulty level for your test.
      </p>
      {loading ? <LoadingBlock label="Loading skills" /> : null}
      {error ? <ErrorBlock message={error} /> : null}
      {!loading && !error && skills.length === 0 ? (
        <div className="tests-empty">No skills are available yet. Please check back later.</div>
      ) : null}
      {!loading && !error && skills.length > 0 ? <StartForm skills={skills} age={age} /> : null}
    </AssessmentLayout>
  )
}
