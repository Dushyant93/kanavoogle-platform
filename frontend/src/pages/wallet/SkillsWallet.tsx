import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Row from 'react-bootstrap/Row'
import Spinner from 'react-bootstrap/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { useStudent } from '../../hooks/useStudent'
import { useWallet } from '../../hooks/useWallet'
import { Footer } from '../../layout/Footer'
import { Header } from '../../layout/Header'
import { formatDate, formatLabel } from '../../utils/format'
import '../../styles/style.css'

const TONES = ['gold', 'green', 'purple', 'navy'] as const

export function SkillsWallet() {
  const { user, loading: authLoading } = useAuth()
  const { wallet, loading: walletLoading, error: walletError } = useWallet()
  const { dashboard, loading: dashboardLoading, error: dashboardError } = useStudent()

  const loading = authLoading || walletLoading || dashboardLoading
  if (loading) {
    return (
      <>
        <Header user={user} active="wallet" />
        <main className="dashboard">
          <Container className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading vault</span>
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
        <Header user={null} active="wallet" />
        <main className="dashboard">
          <Container className="py-5">
            <Alert variant="warning">You need to sign in to view your vault.</Alert>
          </Container>
        </main>
        <Footer />
      </>
    )
  }

  const skills = wallet?.skills ?? []
  const totalEvidence = skills.reduce((sum, skill) => sum + skill.evidenceScore, 0)
  const averageEvidence = skills.length > 0 ? Math.round(totalEvidence / skills.length) : 0
  const completed = (dashboard?.recentAssessments ?? []).filter((item) => item.completedAt)

  return (
    <>
      <Header user={user} active="wallet" />
      <main className="dashboard">
        <Container>
          <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-start gap-3 mb-4">
            <div>
              <h1 className="dashboard__hello">My Wallet</h1>
              <p className="dashboard__intro">
                Manage your verified academic competency balance, domain portfolio, and minting earnings.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <a className="dashboard__secondary" href="/my-vault/export">Export Ledger</a>
              <a className="dashboard__primary" href="/tests">Start New Test</a>
            </div>
          </div>

          {walletError ? <Alert variant="danger">{walletError}</Alert> : null}
          {dashboardError ? <Alert variant="danger">{dashboardError}</Alert> : null}

          <Row className="g-3">
            <Col lg={12}>
              <section className="dashboard__card">
                <p className="dashboard__kicker">Skills with evidence</p>
                <p className="dashboard__balance">{skills.length}</p>
                <p className="dashboard__note">
                  {user.studentProfile?.schoolName ?? 'Completed tests grouped by skill'}
                </p>
                <div className="d-flex justify-content-between gap-3 flex-wrap mt-3">
                  <p className="dashboard__progress-label mb-2">
                    {user.studentProfile?.yearLevel != null ? `Year ${user.studentProfile.yearLevel}` : 'Average evidence'}
                  </p>
                  <p className="dashboard__unlock mb-2">{averageEvidence}% average evidence</p>
                </div>
                <ProgressBar now={averageEvidence} className="dashboard__progress" />
                <p className="dashboard__note mt-2">
                  {skills.length === 0
                    ? 'Complete a test to add a skill to your vault.'
                    : 'Evidence scores come from your completed tests.'}
                </p>
              </section>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            <Col lg={7}>
              <section className="dashboard__card h-100">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                  <h2 className="dashboard__card-title mb-0">Skill Domain Portfolio</h2>
                  <span className="dashboard__chip">{skills.length} Active Domains</span>
                </div>
                {skills.length === 0 ? (
                  <p className="dashboard__note">No skill evidence yet.</p>
                ) : (
                  <Row className="g-3">
                    {skills.map((skill, index) => (
                      <Col key={skill.skillId} sm={6}>
                        <article className="wallet__domain">
                          <strong>{skill.skillName}</strong>
                          <div className="d-flex justify-content-between wallet__domain-value">
                            <span>{skill.completedAssessments} tests</span>
                            <span>{Math.round(skill.evidenceScore)}%</span>
                          </div>
                          <div className="wallet__domain-track">
                            <div
                              className={`wallet__domain-bar wallet__domain-bar--${TONES[index % TONES.length]}`}
                              style={{ width: `${Math.min(100, Math.max(0, skill.evidenceScore))}%` }}
                            />
                          </div>
                        </article>
                      </Col>
                    ))}
                  </Row>
                )}
              </section>
            </Col>
            <Col lg={5}>
              <section className="dashboard__card h-100">
                <h2 className="dashboard__card-title mb-3">Recent Vault Earnings</h2>
                {completed.length === 0 ? (
                  <p className="dashboard__note">No completed tests yet.</p>
                ) : (
                  <ul className="dashboard__results wallet__earnings">
                    {completed.slice(0, 5).map((item) => (
                      <li key={item.id}>
                        <span>
                          <strong>{item.skillName}</strong>
                          <small>
                            {item.subSkillName} · {formatDate(item.completedAt)}
                          </small>
                        </span>
                        <span className="dashboard__confirmed">{formatLabel(item.coinAllocationStatus)}</span>
                      </li>
                    ))}
                  </ul>
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
