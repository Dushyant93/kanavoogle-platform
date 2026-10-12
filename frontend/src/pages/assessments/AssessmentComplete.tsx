import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRotateRight, faCoins, faFileLines, faSeedling, faStar } from '@fortawesome/free-solid-svg-icons'
import { useAssessmentReport } from '../../hooks/useAssessmentFlow'
import type { AssessmentReport } from '../../types/assessmentFlow'
import { AssessmentLayout, ErrorBlock, LoadingBlock } from './AssessmentLayout'
import { isLowScore, percentFor, remarkFor } from './assessmentFormat'
import { assessmentPaths, idFromUrl } from './paths'

function CompleteCard({ report }: { report: AssessmentReport }) {
  const { assessment } = report
  const percent = percentFor(report)
  const low = isLowScore(percent)
  const remark = remarkFor(percent)

  return (
    <article className="tests-card tests-complete">
      <span className={`tests-complete__icon${low ? ' tests-complete__icon--low' : ''}`} aria-hidden="true">
        <FontAwesomeIcon icon={low ? faSeedling : faStar} />
      </span>
      <p className="tests-complete__kicker">Test complete</p>
      <h1 className="tests-complete__title">{remark.title}</h1>
      <p className="tests-complete__meta">
        {assessment.skillName} · {assessment.subSkillName}
      </p>

      {low ? null : (
        <p className="tests-complete__score">
          You got <strong>{report.correctAnswers}</strong> out of <strong>{report.totalQuestions}</strong> right
        </p>
      )}
      <p className="tests-complete__message">{remark.message}</p>

      {report.coinsEarned ? (
        <span className="tests-coins tests-coins--lg">
          <FontAwesomeIcon icon={faCoins} /> +{report.coinsEarned} Skill Coins earned
        </span>
      ) : null}

      <div className="tests-complete__actions">
        {low ? (
          <a className="tests-btn tests-btn--primary" href={assessmentPaths.start}>
            <FontAwesomeIcon icon={faArrowRotateRight} /> Try Again
          </a>
        ) : null}
        <a
          className={`tests-btn ${low ? 'tests-btn--outline' : 'tests-btn--primary'}`}
          href={assessmentPaths.result(assessment.id)}
        >
          <FontAwesomeIcon icon={faFileLines} /> View Report
        </a>
        <a className="tests-btn tests-btn--ghost" href={assessmentPaths.list}>
          Back to Tests
        </a>
      </div>
    </article>
  )
}

/** Shown straight after a test is submitted, before the full report. */
export function AssessmentComplete() {
  const id = idFromUrl()
  const { data, loading, error } = useAssessmentReport(id)

  return (
    <AssessmentLayout narrow>
      {!id ? <ErrorBlock message="No test selected." /> : null}
      {id && loading ? <LoadingBlock label="Loading your result" /> : null}
      {id && error ? <ErrorBlock message={error} /> : null}
      {data ? <CompleteCard report={data} /> : null}
    </AssessmentLayout>
  )
}
