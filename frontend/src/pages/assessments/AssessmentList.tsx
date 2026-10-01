import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faChevronDown,
  faChevronRight,
  faCircleCheck,
  faCirclePlus,
  faClock,
  faCoins,
  faHourglassHalf,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'
import Form from 'react-bootstrap/Form'
import { useAssessmentList } from '../../hooks/useAssessmentFlow'
import type { AssessmentListItem } from '../../types/assessmentFlow'
import { formatLabel } from '../../utils/format'
import { AssessmentLayout, ErrorBlock, LoadingBlock } from './AssessmentLayout'
import { formatDateTime, isConfirmed, questionCountOf, scoreOf } from './assessmentFormat'
import { assessmentPaths } from './paths'

type StatusFilter = 'ALL' | 'CONFIRMED' | 'PENDING'

const PAGE_SIZE = 3

function AssessmentCard({ assessment }: { assessment: AssessmentListItem }) {
  const confirmed = isConfirmed(assessment)
  const score = scoreOf(assessment)

  return (
    <article className="tests-list__item">
      <div className="tests-list__main">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <h2 className="tests-list__title">{assessment.title ?? assessment.skillName}</h2>
          {confirmed ? (
            <span className="tests-badge tests-badge--success">
              <FontAwesomeIcon icon={faCircleCheck} /> Confirmed
            </span>
          ) : (
            <span className="tests-badge tests-badge--pending">
              <FontAwesomeIcon icon={faHourglassHalf} /> Pending
            </span>
          )}
        </div>
        <div className="tests-list__skill">
          <div className="tests-list__skill-name">Skill: {assessment.skillName}</div>
          <div className="tests-list__subskill">Sub-skill: {assessment.subSkillName}</div>
        </div>
        <div className="tests-list__dates">
          <span>
            <FontAwesomeIcon icon={faCalendar} /> Conducted At: {formatDateTime(assessment.createdAt)}
          </span>
          <span>
            <FontAwesomeIcon icon={faClock} /> Completed At: {formatDateTime(assessment.completedAt)}
          </span>
        </div>
      </div>

      <div className="tests-list__side">
        <div className="d-flex align-items-center gap-2">
          <span className="tests-chip">{questionCountOf(assessment)} Questions</span>
          {score != null ? (
            <span className="tests-list__score">
              {score}/100 <small>({score}%)</small>
            </span>
          ) : (
            <span className="tests-list__score tests-list__score--pending">Awaiting score</span>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          {assessment.coinsAwarded != null ? (
            <span className="tests-coins">
              <FontAwesomeIcon icon={faCoins} /> +{assessment.coinsAwarded} Coins
            </span>
          ) : (
            <span className="tests-chip">Coins {formatLabel(assessment.coinAllocationStatus)}</span>
          )}
          {confirmed ? (
            <a className="tests-btn tests-btn--outline tests-btn--sm" href={assessmentPaths.result(assessment.id)}>
              View Report <FontAwesomeIcon icon={faChevronRight} />
            </a>
          ) : (
            <a className="tests-btn tests-btn--outline tests-btn--sm" href={assessmentPaths.take(assessment.id)}>
              Continue <FontAwesomeIcon icon={faChevronRight} />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export function AssessmentList() {
  const { data, loading, error } = useAssessmentList()
  const [search, setSearch] = useState('')
  const [competency, setCompetency] = useState('ALL')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const assessments = useMemo(() => data ?? [], [data])

  const competencies = useMemo(
    () => Array.from(new Set(assessments.map((item) => item.skillName))).sort(),
    [assessments],
  )

  const counts = {
    ALL: assessments.length,
    CONFIRMED: assessments.filter(isConfirmed).length,
    PENDING: assessments.filter((item) => !isConfirmed(item)).length,
  }

  const filtered = assessments.filter((item) => {
    const term = search.trim().toLowerCase()
    const matchesSearch =
      !term ||
      [item.title ?? '', item.skillName, item.subSkillName].some((text) => text.toLowerCase().includes(term))
    const matchesCompetency = competency === 'ALL' || item.skillName === competency
    const matchesStatus =
      status === 'ALL' || (status === 'CONFIRMED' ? isConfirmed(item) : !isConfirmed(item))
    return matchesSearch && matchesCompetency && matchesStatus
  })

  const shown = filtered.slice(0, visible)

  const tabs: { id: StatusFilter; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'PENDING', label: 'Pending' },
  ]

  function resetPaging() {
    setVisible(PAGE_SIZE)
  }

  return (
    <AssessmentLayout>
      <div className="tests-page-head">
        <div>
          <h1 className="tests-title">Assessment Lists</h1>
          <p className="tests-subtitle">
            Review your completed assessments, verified test scores, and minted Skill-Coins.
          </p>
        </div>
        <a className="tests-btn tests-btn--primary" href={assessmentPaths.start}>
          <FontAwesomeIcon icon={faCirclePlus} /> Start Test
        </a>
      </div>

      {loading ? <LoadingBlock label="Loading assessments" /> : null}
      {error ? <ErrorBlock message={error} /> : null}

      {!loading && !error ? (
        <>
          <div className="tests-toolbar">
            <div className="tests-search">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="tests-search__icon" aria-hidden="true" />
              <Form.Control
                type="search"
                placeholder="Search by skill, title, or exam keyword..."
                aria-label="Search assessments"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  resetPaging()
                }}
              />
            </div>
            <Form.Select
              className="tests-toolbar__select"
              aria-label="Filter by competency"
              value={competency}
              onChange={(event) => {
                setCompetency(event.target.value)
                resetPaging()
              }}
            >
              <option value="ALL">All Competencies</option>
              {competencies.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Form.Select>
            <div className="tests-segment" role="tablist" aria-label="Filter by status">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={status === tab.id}
                  className={`tests-segment__btn${status === tab.id ? ' is-active' : ''}`}
                  onClick={() => {
                    setStatus(tab.id)
                    resetPaging()
                  }}
                >
                  {tab.label} ({counts[tab.id]})
                </button>
              ))}
            </div>
          </div>

          {shown.length === 0 ? (
            <div className="tests-empty">
              {assessments.length === 0
                ? 'You haven’t taken any assessments yet. Start your first test to see it here.'
                : 'No assessments match your filters. Try a different search.'}
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {shown.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}

          {visible < filtered.length ? (
            <div className="text-center mt-4">
              <button
                type="button"
                className="tests-btn tests-btn--outline"
                onClick={() => setVisible((count) => count + PAGE_SIZE)}
              >
                Load Previous Assessments <FontAwesomeIcon icon={faChevronDown} />
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </AssessmentLayout>
  )
}
