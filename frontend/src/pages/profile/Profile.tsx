import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import { Footer } from '../../layout/Footer'
import { Header } from '../../layout/Header'
import { useAuth } from '../../hooks/useAuth'
import { useStudent } from '../../hooks/useStudent'
import { useWallet } from '../../hooks/useWallet'
import '../../styles/style.css'

export function Profile() {
  const { user, loading: authLoading } = useAuth()
  const { dashboard, loading: dashboardLoading, error: dashboardError } = useStudent()
  const { wallet, loading: walletLoading, error: walletError } = useWallet()

  const loading = authLoading || dashboardLoading || walletLoading

  if (loading) {
    return (
      <>
        <Header user={user} active="profile" />
        <main className="dashboard">
          <Container className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading profile</span>
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
        <Header user={null} active="profile" />
        <main className="dashboard">
          <Container className="py-5">
            <Alert variant="warning">You need to sign in to view your profile.</Alert>
          </Container>
        </main>
        <Footer />
      </>
    )
  }

  const recentAssessments = dashboard?.recentAssessments ?? []
  const completedAssessments = recentAssessments.filter((a) => a.status === 'COMPLETED')
  const totalAssessments = completedAssessments.length

  const averagePercent =
    completedAssessments.length > 0
      ? Math.round(
          completedAssessments.reduce((sum, a) => sum + (a.weightedPercent ?? a.rawPercent ?? 0), 0) /
            completedAssessments.length,
        )
      : null

  const skills = wallet?.skills ?? []

  return (
    <>
      <Header user={user} active="profile" />
      <main className="dashboard">
        <Container>
          <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-start gap-3 mb-4">
            <div>
              <h1 className="dashboard__hello">Hi, {user.displayName}</h1>
              <p className="dashboard__intro">
                {user.studentProfile?.yearLevel != null ? `Year ${user.studentProfile.yearLevel}` : ''}
                {user.studentProfile?.schoolName ? `, ${user.studentProfile.schoolName}` : ''}
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <a className="dashboard__secondary" href="/profile/edit">Edit Profile</a>
              <a className="dashboard__secondary" href="/profile/share">Share Profile</a>
            </div>
          </div>

          {dashboardError ? <Alert variant="danger">{dashboardError}</Alert> : null}
          {walletError ? <Alert variant="danger">{walletError}</Alert> : null}

          <Row className="g-3">
            <Col xs={6} xl={3}>
              <article className="dashboard__card">
                <p className="dashboard__kicker">Total Assessments</p>
                <div className="profile__stat-value">{totalAssessments}</div>
                <div className="dashboard__stat-label">Tests Done</div>
              </article>
            </Col>
            <Col xs={6} xl={3}>
              <article className="dashboard__card">
                <p className="dashboard__kicker">Performance Standard</p>
                <div className="profile__stat-value">{averagePercent != null ? `${averagePercent}%` : '—'}</div>
                <div className="dashboard__stat-label">Avg Score</div>
              </article>
            </Col>
            <Col xs={6} xl={3}>
              <article className="dashboard__card">
                <p className="dashboard__kicker">Accreditation Progress</p>
                <div className="profile__stat-value">{skills.length}</div>
                <div className="dashboard__stat-label">Skills Tracked</div>
              </article>
            </Col>
            <Col xs={6} xl={3}>
              <article className="dashboard__card">
                <p className="dashboard__kicker">Rank and Percentile</p>
                <div className="profile__stat-value">
                  {dashboard?.standing ? dashboard.standing.place : '—'}
                </div>
                <div className="dashboard__stat-label">
                  {dashboard?.standing
                    ? `of ${dashboard.standing.total} · ${dashboard.standing.percentile}th percentile`
                    : 'No completed tests yet'}
                </div>
              </article>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            <Col lg={6}>
              <section className="dashboard__card">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                  <h2 className="dashboard__card-title mb-0">Skill Holdings</h2>
                  <a className="dashboard__link" href="/my-vault">Manage Allocation</a>
                </div>
                <p className="dashboard__note">Validated scholar credits allocated by core competence.</p>
                {skills.length === 0 ? (
                  <p className="dashboard__note mt-2">No skill evidence yet.</p>
                ) : (
                  <Row className="g-2 mt-2">
                    {skills.map((skill) => (
                      <Col key={skill.skillId} xs={6}>
                        <article className="dashboard__holding">
                          <span>{skill.skillName}</span>
                          <strong>{Math.round(skill.evidenceScore)}% evidence</strong>
                          <em>{skill.completedAssessments} tests</em>
                        </article>
                      </Col>
                    ))}
                  </Row>
                )}
              </section>
            </Col>
            <Col lg={6}>
              <section className="dashboard__card">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                  <h2 className="dashboard__card-title mb-0">Recent Tests and Results</h2>
                  <a className="dashboard__link" href="/tests">View All History</a>
                </div>
                {recentAssessments.length === 0 ? (
                  <p className="dashboard__note">No assessments completed yet.</p>
                ) : (
                  <ul className="dashboard__results">
                    {recentAssessments.slice(0, 5).map((assessment) => (
                      <li key={assessment.id}>
                        <span>
                          <strong>{assessment.skillName}</strong>
                          <small>
                            {assessment.completedAt ? new Date(assessment.completedAt).toLocaleDateString() : 'In progress'}
                            {' '}
                            Score {assessment.weightedPercent ?? assessment.rawPercent ?? '—'}%
                          </small>
                        </span>
                        <span className="dashboard__confirmed">{assessment.coinAllocationStatus}</span>
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
