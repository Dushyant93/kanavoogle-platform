import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faClipboardCheck,
  faClock,
  faListCheck,
  faPlay,
  faStar,
  faTrophy,
  faVault,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Row from 'react-bootstrap/Row'
import Spinner from 'react-bootstrap/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { useSkills } from '../../hooks/useSkills'
import { useStudent } from '../../hooks/useStudent'
import { useWallet } from '../../hooks/useWallet'
import { Footer } from '../../layout/Footer'
import { Header } from '../../layout/Header'
import { formatDate } from '../../utils/format'
import '../../styles/style.css'

function codeFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'SK'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
}

export function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { dashboard, loading: dashboardLoading, error: dashboardError } = useStudent()
  const { wallet, loading: walletLoading, error: walletError } = useWallet()
  const { skills: catalog, loading: catalogLoading } = useSkills()

  const loading = authLoading || dashboardLoading || walletLoading || catalogLoading
  if (loading) {
    return (
      <>
        <Header user={user} active="home" />
        <main className="dashboard">
          <Container className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading dashboard</span>
            </Spinner>
          </Container>
        </main>
        <Footer />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header user={null} active="home" />
        <main className="dashboard">
          <Container className="py-5">
            <Alert variant="warning">You need to sign in to view your dashboard.</Alert>
          </Container>
        </main>
        <Footer />
      </>
    )
  }

  const yearLevel = user.studentProfile?.yearLevel
  const recent = dashboard?.recentAssessments ?? []
  const completed = recent.filter((item) => item.status === 'COMPLETED' || item.completedAt)
  const inProgress = recent.find((item) => item.status !== 'COMPLETED' && !item.completedAt)
  const skills = wallet?.skills ?? []
  const covered = new Set(skills.map((skill) => skill.skillId))
  const recommended =
    catalog.find((skill) => skill.active && !covered.has(skill.id)) ?? catalog.find((skill) => skill.active)
  const average =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, item) => sum + (item.weightedPercent ?? item.rawPercent ?? 0), 0) / completed.length,
        )
      : null
  const averageEvidence =
    skills.length > 0
      ? Math.round(skills.reduce((sum, skill) => sum + skill.evidenceScore, 0) / skills.length)
      : 0

  const stats: { value: string; label: string; tone: 'brand' | 'accent'; icon: IconDefinition }[] = [
    { value: String(completed.length), label: 'Tests Done', tone: 'brand', icon: faClipboardCheck },
    { value: average != null ? `${average}%` : '—', label: 'Avg Score', tone: 'accent', icon: faStar },
    { value: String(skills.length), label: 'Skills Tracked', tone: 'brand', icon: faTrophy },
  ]

  return (
    <>
      <Header user={user} active="home" />
      <main className="dashboard">
        <Container>
          <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-start gap-3 mb-4">
            <div>
              <h1 className="dashboard__hello">
                Hi, {user.displayName}
                {/* <FontAwesomeIcon icon={faMedal} className="dashboard__medal" aria-hidden="true" /> */}
                {yearLevel != null ? (
                  <span className="dashboard__level-pill">Year {yearLevel}</span>
                ) : null}
              </h1>
              <p className="dashboard__intro">
                Here is an overview of your verified skill balance and accreditation progression.
              </p>
            </div>
          </div>

          {dashboardError ? <Alert variant="danger">{dashboardError}</Alert> : null}
          {walletError ? <Alert variant="danger">{walletError}</Alert> : null}

          <Row className="g-3">
            <Col lg={6}>
              <section className="dashboard__card">
                <div className="d-flex gap-3">
                  <div className="dashboard__coin" aria-hidden="true">
                    <span>P</span>
                    <span>DU</span>
                  </div>
                  <div>
                    <p className="dashboard__kicker">Completed tests</p>
                    <p className="dashboard__balance">{completed.length}</p>
                    <p className="dashboard__note">
                      {user.studentProfile?.schoolName
                        ? `Recorded for ${user.studentProfile.schoolName}.`
                        : 'Recorded from your completed tests.'}
                    </p>
                  </div>
                </div>
              </section>
            </Col>
            <Col lg={6}>
              <section className="dashboard__card">
                <div className="d-flex justify-content-between gap-3 flex-wrap">
                  <p className="dashboard__progress-label mb-2">
                    {yearLevel != null ? `Year ${yearLevel}` : 'Your progress'}
                    {skills.length > 0 ? ` • ${averageEvidence}% average evidence` : ''}
                  </p>
                  <p className="dashboard__unlock mb-2">{skills.length} skills</p>
                </div>
                <ProgressBar now={averageEvidence} className="dashboard__progress" />
                <p className="dashboard__note mt-2">
                  {skills.length === 0
                    ? 'Complete a test to build your skill record.'
                    : 'Evidence scores come from your completed tests.'}
                </p>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <a className="dashboard__primary" href="/tests">
                    <FontAwesomeIcon icon={faPlay} /> Start New Test
                  </a>
                  <a className="dashboard__secondary" href="/my-vault">
                    <FontAwesomeIcon icon={faVault} /> My Vault
                  </a>
                </div>
              </section>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            {stats.map((stat) => (
              <Col key={stat.label} xs={6} xl={3}>
                <article className="dashboard__stat">
                  <span className={`dashboard__stat-icon dashboard__stat-icon--${stat.tone}`} aria-hidden="true">
                    <FontAwesomeIcon icon={stat.icon} />
                  </span>
                  <div>
                    <div className="dashboard__stat-value">{stat.value}</div>
                    <div className="dashboard__stat-label">{stat.label}</div>
                  </div>
                </article>
              </Col>
            ))}
          </Row>

          <Row className="g-3 mt-1">
            <Col lg={6}>
              <section className="dashboard__card">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                  <p className="dashboard__kicker mb-0">Today's Recommended Test</p>
                </div>
                <h2 className="dashboard__card-title">
                  {inProgress ? inProgress.skillName : (recommended?.name ?? 'Start a test')}
                </h2>
                <p className="dashboard__note">
                  {inProgress
                    ? `${inProgress.subSkillName} is still in progress.`
                    : recommended
                      ? `Next skill to record: ${recommended.subSkills.find((item) => item.active)?.name ?? recommended.name}.`
                      : 'Choose a skill and difficulty to record a new result.'}
                </p>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-3">
                  <p className="dashboard__meta mb-0">
                    {inProgress ? (
                      <>
                        <FontAwesomeIcon icon={faClock} /> Started {formatDate(inProgress.createdAt)}
                        <FontAwesomeIcon icon={faListCheck} /> {inProgress.questions?.length ?? 0} Questions
                      </>
                    ) : (
                      <span>
                        {recommended
                          ? `${recommended.subSkills.filter((item) => item.active).length} sub-skills`
                          : 'Open the test list to begin.'}
                      </span>
                    )}
                  </p>
                  <a className="dashboard__primary" href={inProgress ? `/tests/take?id=${encodeURIComponent(inProgress.id)}` : '/tests/new'}>
                    {inProgress ? 'Continue Test →' : 'Begin Test →'}
                  </a>
                </div>
              </section>
            </Col>
            <Col lg={6}>
              <section className="dashboard__card">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                  <h2 className="dashboard__card-title mb-0">Recent Tests & Results</h2>
                  <a className="dashboard__link" href="/tests">
                    View All History →
                  </a>
                </div>
                {recent.length === 0 ? (
                  <p className="dashboard__note">No tests yet.</p>
                ) : (
                  <ul className="dashboard__results">
                    {recent.slice(0, 5).map((result) => {
                      const score = result.weightedPercent ?? result.rawPercent
                      return (
                        <li key={result.id}>
                          <FontAwesomeIcon icon={faCircleCheck} className="dashboard__check" aria-hidden="true" />
                          <span>
                            <strong>{result.skillName}</strong>
                            <small>
                              {formatDate(result.completedAt ?? result.createdAt)}
                              {score != null ? ` · Score: ${Math.round(score)}%` : ''}
                            </small>
                          </span>
                          <span className="dashboard__confirmed">
                            {result.completedAt ? 'Confirmed' : 'Pending'}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            <Col lg={12}>
              <section className="dashboard__card">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                  <h2 className="dashboard__card-title mb-0">Skill Holdings Breakdown</h2>
                  <a className="dashboard__link" href="/my-vault">
                    Manage →
                  </a>
                </div>
                <p className="dashboard__note">Allocations verified across evaluated academic taxonomies.</p>
                {skills.length === 0 ? (
                  <p className="dashboard__note mt-2">No skill evidence yet.</p>
                ) : (
                  <Row className="g-2 mt-2">
                    {skills.map((holding) => (
                      <Col key={holding.skillId} xs={6} md={3}>
                        <article className="dashboard__holding">
                          <span>{codeFor(holding.skillName)}</span>
                          <strong>{holding.skillName}</strong>
                          <em>{Math.round(holding.evidenceScore)}% evidence</em>
                        </article>
                      </Col>
                    ))}
                  </Row>
                )}
              </section>
            </Col>
          </Row>
        </Container>
      </main>
      <Footer />
    </>
  )
}
