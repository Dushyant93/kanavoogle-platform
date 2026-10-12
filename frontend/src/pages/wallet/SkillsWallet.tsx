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
    schoolName: 'Kanavoogle',
    region: 'Sydney',
    skillSharingConsent: true,
  },
}

const DOMAINS = [
  { code: 'CI', name: 'Creativity & Innovation', amountLabel: '18 Skill Coines', percent: 37.5, tone: 'gold' },
  { code: 'PS', name: 'Problem Solving', amountLabel: '15 Skill Coines', percent: 31.2, tone: 'green' },
  { code: 'CM', name: 'Communication', amountLabel: '9 Skill Coines', percent: 18.8, tone: 'purple' },
  { code: 'DU', name: 'Digital Use', amountLabel: '6 Skill Coines', percent: 12.5, tone: 'navy' },
] as const

const EARNINGS = [
  { title: 'Creativity & Innovation Test', meta: 'Scenario 08, Today 2:15 PM', coins: '+3 Skill Coines' },
  { title: 'MVP Prototyping Milestone', meta: 'Verified by Faculty, Yesterday', coins: '+3 Skill Coines' },
  { title: 'Campus Partner Workshop', meta: 'Design Thinking Lab, Oct 24', coins: '+2 Skill Coines' },
] as const

export function SkillsWallet() {
  return (
    <>
      <Header user={student} active="wallet" />
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

          <Row className="g-3">
            <Col lg={12}>
              <section className="dashboard__card">
                <p className="dashboard__kicker">Total balance</p>
                <p className="dashboard__balance">48 <span>Skill Coines</span></p>
                <p className="dashboard__note">Skill-Coins Minted</p>
                <div className="d-flex justify-content-between gap-3 flex-wrap mt-3">
                  <p className="dashboard__progress-label mb-2">Level 4 Scholar</p>
                  <p className="dashboard__unlock mb-2">48 / 60 Skill Coines</p>
                </div>
                <ProgressBar now={80} className="dashboard__progress" />
                <p className="dashboard__note mt-2">Earn 12 more Skill Coines to unlock Level 5 Master Tier</p>
              </section>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            <Col lg={7}>
              <section className="dashboard__card h-100">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                  <h2 className="dashboard__card-title mb-0">Skill Domain Portfolio</h2>
                  <span className="dashboard__chip">4 Active Domains</span>
                </div>
                <Row className="g-3">
                  {DOMAINS.map((domain) => (
                    <Col key={domain.code} sm={6}>
                      <article className="wallet__domain">
                        <strong>{domain.name}</strong>
                        <div className="d-flex justify-content-between wallet__domain-value">
                          <span>{domain.amountLabel}</span>
                          <span>{domain.percent}%</span>
                        </div>
                        <div className="wallet__domain-track">
                          <div className={"wallet__domain-bar wallet__domain-bar--" + domain.tone} style={{ width: domain.percent + '%' }} />
                        </div>
                      </article>
                    </Col>
                  ))}
                </Row>
              </section>
            </Col>
            <Col lg={5}>
              <section className="dashboard__card h-100">
                <h2 className="dashboard__card-title mb-3">Recent Vault Earnings</h2>
                <ul className="dashboard__results wallet__earnings">
                  {EARNINGS.map((earning) => (
                    <li key={earning.title}>
                      <span>
                        <strong>{earning.title}</strong>
                        <small>{earning.meta}</small>
                      </span>
                      <span className="dashboard__coins">{earning.coins}</span>
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
