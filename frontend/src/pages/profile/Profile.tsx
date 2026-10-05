import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Row from 'react-bootstrap/Row'
import { Footer } from '../../layout/Footer'
import { Header } from '../../layout/Header'
import type { User } from '../../types/auth'
import '../../styles/style.css'

const student: User = {
  id: 'student-1',
  email: 'alex.morgan@example.com',
  displayName: 'Alex Morgan',
  role: 'STUDENT',
  verificationStatus: 'NOT_REQUIRED',
  studentProfile: {
    age: 15,
    yearLevel: 4,
    schoolName: 'Glenorchy Higher Secondary School',
    region: 'Sydney',
    skillSharingConsent: true,
  },
}

const STATS = [
  { kicker: 'Total Tests', value: '12', label: 'Tests Done' },
  { kicker: 'Performance Standard', value: 'A+', label: 'Avg Grade' },
  { kicker: 'Accreditation Progress', value: '4', label: 'Skills Mastered' },
  { kicker: 'Rank and Percentile', value: 'Top 5%', label: 'Cohort Standing' },
] as const

const HOLDINGS = [
  { code: 'CR', name: 'Creativity', amount: '18 Skill Coines' },
  { code: 'PS', name: 'Problem Solv.', amount: '15 Skill Coines' },
  { code: 'CM', name: 'Comm.', amount: '9 Skill Coines' },
  { code: 'DU', name: 'Digital Use', amount: '6 Skill Coines' },
] as const

const RESULTS = [
  { name: 'Creativity & Innovation', date: 'Oct 24', score: '100%', coins: '+3 Skill Coines' },
  { name: 'Algorithm Logic', date: 'Oct 22', score: '94%', coins: '+3 Skill Coines' },
] as const

export function Profile() {
  return (
    <>
      <Header user={student} active="profile" />
      <main className="dashboard">
        <Container>
          <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-start gap-3 mb-4">
            <div>
              <h1 className="dashboard__hello">Hi, Alex</h1>
              <p className="dashboard__intro">Level 4 Scholar</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <a className="dashboard__secondary" href="/profile/edit">Edit Profile</a>
              <a className="dashboard__secondary" href="/profile/share">Share Profile</a>
            </div>
          </div>

          <Row className="g-3">
            {STATS.map((stat) => (
              <Col key={stat.kicker} xs={6} xl={3}>
                <article className="dashboard__card">
                  <p className="dashboard__kicker">{stat.kicker}</p>
                  <div className="profile__stat-value">{stat.value}</div>
                  <div className="dashboard__stat-label">{stat.label}</div>
                </article>
              </Col>
            ))}
          </Row>

          <Row className="g-3 mt-1">
            <Col lg={6}>
              <section className="dashboard__card">
                <p className="dashboard__kicker">Available balance</p>
                <p className="dashboard__balance">48 Skill Coines</p>
                <div className="d-flex justify-content-between gap-3 flex-wrap mt-2">
                  <p className="dashboard__progress-label mb-2">Level 4 Scholar, 80% to Level 5</p>
                  <p className="dashboard__unlock mb-2">12 Skill Coines to Unlock</p>
                </div>
                <ProgressBar now={80} className="dashboard__progress" />
                <p className="dashboard__note mt-2">Earn 12 more Skill Coines to unlock Level 5 Master tier benefits.</p>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <a className="dashboard__primary" href="/tests">Start New Test</a>
                  <a className="dashboard__secondary" href="/my-vault">My Vault</a>
                </div>
              </section>
            </Col>
            <Col lg={6}>
              <section className="dashboard__card">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                  <p className="dashboard__kicker mb-0">Todays Recommended Test</p>
                  <span className="dashboard__chip">Max +3 Skill Coine</span>
                </div>
                <h2 className="dashboard__card-title">Creativity & Innovation</h2>
                <p className="dashboard__note">Challenge core generative ideation and design heuristics to substantiate your Level 4 accreditation.</p>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-3">
                  <p className="dashboard__meta mb-0">8 Questions, 15 Mins</p>
                  <a className="dashboard__primary" href="/tests">Begin Test</a>
                </div>
              </section>
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
                <Row className="g-2 mt-2">
                  {HOLDINGS.map((holding) => (
                    <Col key={holding.code} xs={6}>
                      <article className="dashboard__holding">
                        <span>{holding.code}</span>
                        <strong>{holding.name}</strong>
                        <em>{holding.amount}</em>
                      </article>
                    </Col>
                  ))}
                </Row>
              </section>
            </Col>
            <Col lg={6}>
              <section className="dashboard__card">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                  <h2 className="dashboard__card-title mb-0">Recent Tests and Results</h2>
                  <a className="dashboard__link" href="/tests">View All History</a>
                </div>
                <ul className="dashboard__results">
                  {RESULTS.map((result) => (
                    <li key={result.name}>
                      <span>
                        <strong>{result.name}</strong>
                        <small>{result.date} Score {result.score}</small>
                      </span>
                      <span className="dashboard__coins">{result.coins}</span>
                      <span className="dashboard__confirmed">Confirmed</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Col>
          </Row>
        </Container>
      </main>
      <Footer />
    </>
  )
}
