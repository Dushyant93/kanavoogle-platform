import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faCalendar,
  faCircleCheck,
  faCoins,
  faFilePdf,
  faQrcode,
  faShareNodes,
  faShieldHalved,
  faVault,
} from '@fortawesome/free-solid-svg-icons'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Row from 'react-bootstrap/Row'
import { useAssessmentReport, useCurrentStudent } from '../../hooks/useAssessmentFlow'
import type { AssessmentReport } from '../../types/assessmentFlow'
import { formatLabel } from '../../utils/format'
import { AssessmentLayout, ErrorBlock, LoadingBlock } from './AssessmentLayout'
import { formatDuration, formatShortDate, gradeFor } from './assessmentFormat'
import { assessmentPaths, idFromUrl } from './paths'

function timeTaken(report: AssessmentReport) {
  if (report.timeTakenSeconds != null) return report.timeTakenSeconds
  const { createdAt, completedAt } = report.assessment
  if (!completedAt) return null
  const ms = new Date(completedAt).getTime() - new Date(createdAt).getTime()
  return Number.isNaN(ms) || ms < 0 ? null : ms / 1000
}

function ReportCard({ report, studentName }: { report: AssessmentReport; studentName: string }) {
  const { assessment } = report
  const percent = Math.round(
    assessment.weightedPercent ??
      assessment.rawPercent ??
      (report.totalQuestions ? (report.correctAnswers / report.totalQuestions) * 100 : 0),
  )
  const competencies = report.competencies ?? []
  const mastered = competencies.filter((item) => item.masteryPercent >= 100).length
  const hasPoints = competencies.length > 0 && competencies.every((item) => item.pointsPossible != null)
  const pointsEarned = competencies.reduce((sum, item) => sum + (item.pointsEarned ?? 0), 0)
  const pointsPossible = competencies.reduce((sum, item) => sum + (item.pointsPossible ?? 0), 0)
  const credential = report.credential
  const seconds = timeTaken(report)

  return (
    <article className="tests-card tests-result">
      <div className="tests-result__top">
        {credential?.anchored ? (
          <span className="tests-badge tests-badge--success tests-badge--caps">
            <FontAwesomeIcon icon={faCircleCheck} />
          </span>
        ) : (
          <span className="tests-badge tests-badge--pending tests-badge--caps">Verification Pending</span>
        )}
        <span className="tests-result__date">
          <FontAwesomeIcon icon={faCalendar} /> {formatShortDate(assessment.completedAt ?? assessment.createdAt)}
        </span>
      </div>

      <div className="tests-result__hero">
        <h1 className="tests-result__name">{report.studentName ?? studentName}</h1>
        <p className="tests-result__meta">
          {assessment.skillName}
          {report.studentId ? (
            <>
              <span className="tests-result__sep" aria-hidden="true">
                •
              </span>
              ID: <strong>{report.studentId}</strong>
            </>
          ) : null}
        </p>
        <div className="tests-result__percent">{percent}%</div>
        <p className="tests-result__grade">
          <strong>Grade {report.grade ?? gradeFor(percent)}</strong> ({report.correctAnswers} of{' '}
          {report.totalQuestions} Correct)
        </p>
        {report.coinsEarned != null ? (
          <span className="tests-coins tests-coins--lg">
            <FontAwesomeIcon icon={faCoins} /> +{report.coinsEarned} Skill Coins Earned
            {seconds != null ? <span className="tests-coins__time">• {formatDuration(seconds)}</span> : null}
          </span>
        ) : (
          <span className="tests-chip">Coins {formatLabel(assessment.coinAllocationStatus)}</span>
        )}
      </div>

      {competencies.length > 0 ? (
        <>
          <div className="tests-result__section-head">
            <h2 className="tests-result__section-title">Competencies Validated</h2>
            <span className="tests-chip tests-chip--success tests-chip--plain">
              {mastered} of {competencies.length} Mastered
              {hasPoints ? ` (${pointsEarned}/${pointsPossible} pts)` : ''}
            </span>
          </div>
          <Row className="g-3">
            {competencies.map((item) => (
              <Col key={item.subSkillName} md={6}>
                <div className="tests-competency">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>{item.subSkillName}</strong>
                    <span className="tests-competency__percent">
                      <b>{Math.round(item.masteryPercent)}%</b>
                      {item.pointsPossible != null ? ` • ${item.pointsEarned ?? 0}/${item.pointsPossible} pts` : ''}
                    </span>
                  </div>
                  <ProgressBar now={item.masteryPercent} className="tests-competency__bar" />
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {item.evidence.map((tag) => (
                      <span key={tag} className="tests-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </>
      ) : null}

      {credential ? (
        <div className="tests-ledger" title={credential.ledgerHash}>
          <span className="tests-ledger__qr" aria-hidden="true">
            <FontAwesomeIcon icon={faQrcode} />
          </span>
          <div className="tests-ledger__text">
            <code>{credential.credentialId}</code>
            <small>Verified by {credential.verifiedBy ?? 'Kanavoogle Credential Ledger'}</small>
          </div>
          <span className="tests-chip">{credential.anchored ? 'Confirmed' : 'Pending'}</span>
          {credential.anchored ? (
            <span className="tests-ledger__check" aria-label="Verified">
              <FontAwesomeIcon icon={faShieldHalved} />
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="tests-result__actions">
        <a className="tests-btn tests-btn--outline" href={assessmentPaths.vault}>
          <FontAwesomeIcon icon={faVault} /> Back to Vault
        </a>
        <button type="button" className="tests-btn tests-btn--primary" onClick={() => window.print()}>
          <FontAwesomeIcon icon={faFilePdf} /> Print / Save PDF
        </button>
      </div>
    </article>
  )
}

async function shareResult() {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: 'My test result', url })
    } else {
      await navigator.clipboard.writeText(url)
      window.alert('Link copied to clipboard')
    }
  } catch {
    // Share was cancelled; nothing to do.
  }
}

export function AssessmentResult() {
  const id = idFromUrl()
  const { data, loading, error } = useAssessmentReport(id)
  const student = useCurrentStudent()

  const subbar = (
    <div className="tests-subbar">
      <Container fluid className="d-flex align-items-center gap-3">
        <a href={assessmentPaths.vault}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Vault
        </a>
        <span className="tests-subbar__divider" aria-hidden="true" />
        <button type="button" onClick={shareResult}>
          <FontAwesomeIcon icon={faShareNodes} /> Share
        </button>
      </Container>
    </div>
  )

  return (
    <AssessmentLayout narrow subbar={subbar}>
      {!id ? <ErrorBlock message="No test selected." /> : null}
      {id && loading ? <LoadingBlock label="Loading result" /> : null}
      {id && error ? <ErrorBlock message={error} /> : null}
      {data ? <ReportCard report={data} studentName={student?.displayName ?? 'Student'} /> : null}
    </AssessmentLayout>
  )
}
