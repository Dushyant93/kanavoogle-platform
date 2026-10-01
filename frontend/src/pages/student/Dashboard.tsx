import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartColumn,
  faCircle,
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
  displayName: 'Alex',
  role: 'STUDENT',
  verificationStatus: 'NOT_REQUIRED',
  studentProfile: {
    age: 15,
    yearLevel: 4,
    schoolName: 'Kanavoogle',
    region: 'Sydney',
    skillSharingConsent: true,
  },
}

const STATS: { value: string; label: string; tone: 'brand' | 'accent'; icon: IconDefinition }[] = [
  { value: '12', label: 'Tests Done', tone: 'brand', icon: faClipboardCheck },
  { value: 'A+', label: 'Avg Grade', tone: 'accent', icon: faStar },
  { value: '4', label: 'Skills Mastered', tone: 'brand', icon: faTrophy },
  { value: 'Top 5%', label: 'Cohort Standing', tone: 'accent', icon: faChartColumn },
]

const RESULTS = [
  { name: 'Creativity & Innovation', date: 'Oct 24', score: '100%', coins: '+3 SC' },
  { name: 'Algorithm Logic', date: 'Oct 22', score: '94%', coins: '+2 SC' },
  { name: 'Digital Ethics', date: 'Oct 18', score: '90%', coins: '+2 SC' },
] as const

const HOLDINGS = [
  { code: 'CR', name: 'Creativity', amount: '18 SC' },
  { code: 'PS', name: 'Problem Solv.', amount: '15 SC' },
  { code: 'CM', name: 'Comm.', amount: '9 SC' },
  { code: 'DU', name: 'Digital Use', amount: '6 SC' },
] as const


export function Dashboard() {
  const yearLevel = student.studentProfile?.yearLevel

  return (
    <>
      <Header user={student} active="home" />
      <main className="dashboard">
        <Container>
          <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-start gap-3 mb-4">
            <div>
              <h1 className="dashboard__hello">
                Hi, {student.displayName}
                {/* <FontAwesomeIcon icon={faMedal} className="dashboard__medal" aria-hidden="true" /> */}
                {yearLevel != null ? (
                  <span className="dashboard__level-pill">Level {yearLevel} Scholar</span>
                ) : null}
              </h1>
              <p className="dashboard__intro">
                Here is an overview of your verified skill balance and accreditation progression.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <span className="dashboard__status">
                <FontAwesomeIcon icon={faCircle} className="dashboard__dot" aria-hidden="true" />
                Active Scholar Semester
              </span>
              <span className="dashboard__minted">48 SkillCoins Minted</span>
            </div>
          </div>

          <Row className="g-3">
            <Col lg={6}>
              <section className="dashboard__card">
                <div className="d-flex gap-3">
                  <div className="dashboard__coin" aria-hidden="true">
                    <span>P</span>
                    <span>DU</span>
                  </div>
                  <div>
                    <p className="dashboard__kicker">Available balance</p>
                    <p className="dashboard__balance">
                      48 SC <span>(≈ $48.00 Tuition Credit)</span>
                    </p>
                    <p className="dashboard__note">
                      Backed by institutional proof-of-competency validation protocols.
                    </p>
                  </div>
                </div>
              </section>
            </Col>
            <Col lg={6}>
              <section className="dashboard__card">
                <div className="d-flex justify-content-between gap-3 flex-wrap">
                  <p className="dashboard__progress-label mb-2">
                    Level {yearLevel} Scholar • 80% to Level {(yearLevel ?? 4) + 1}
                  </p>
                  <p className="dashboard__unlock mb-2">12 SC to Unlock</p>
                </div>
                <ProgressBar now={80} className="dashboard__progress" />
                <p className="dashboard__note mt-2">
                  Earn 12 more SC to unlock Level 5 Master tier benefits & tuition grants.
                </p>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <a className="dashboard__primary" href="/tests">
                    <FontAwesomeIcon icon={faPlay} /> Start New Test
                  </a>
                  <a className="dashboard__secondary" href="/wallet">
                    <FontAwesomeIcon icon={faVault} /> My Vault
                  </a>
                </div>
              </section>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            {STATS.map((stat) => (
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
                  <span className="dashboard__chip">Max +3 SC</span>
                </div>
                <h2 className="dashboard__card-title">Creativity & Innovation</h2>
                <p className="dashboard__note">
                  Challenge core generative ideation and design heuristics to substantiate your Level{' '}
                  {yearLevel} accreditation. Earn instant verified coin mints on completion.
                </p>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-3">
                  <p className="dashboard__meta mb-0">
                    <FontAwesomeIcon icon={faClock} /> 15 mins
                    <FontAwesomeIcon icon={faListCheck} /> 8 Questions
                  </p>
                  <a className="dashboard__primary" href="/tests">
                    Begin Assessment →
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
                <ul className="dashboard__results">
                  {RESULTS.map((result) => (
                    <li key={result.name}>
                      <FontAwesomeIcon icon={faCircleCheck} className="dashboard__check" aria-hidden="true" />
                      <span>
                        <strong>{result.name}</strong>
                        <small>
                          {result.date} · Score: {result.score}
                        </small>
                      </span>
                      <span className="dashboard__coins">{result.coins}</span>
                      <span className="dashboard__confirmed">Confirmed</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            <Col lg={12}>
              <section className="dashboard__card">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                  <h2 className="dashboard__card-title mb-0">Skill Holdings Breakdown</h2>
                  <a className="dashboard__link" href="/wallet">
                    Manage →
                  </a>
                </div>
                <p className="dashboard__note">Allocations verified across evaluated academic taxonomies.</p>
                <Row className="g-2 mt-2">
                  {HOLDINGS.map((holding) => (
                    <Col key={holding.code} xs={6} md={3}>
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
          </Row>
        </Container>
      </main>
      <Footer />
    </>
  )
}
