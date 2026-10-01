import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { Footer } from '../../layout/Footer'
import { Header } from '../../layout/Header'
import '../../styles/style.css'

const JOURNEY = [
  'Profile',
  'Skill & sub-skill',
  'Context & complexity',
  'Validated questions',
  'Result & skill evidence',
] as const

const ROLES = [
  {
    title: 'Students',
    text: 'Complete age-appropriate assessments and build a persistent skill profile.',
    icon: 'student',
  },
  {
    title: 'Schools',
    text: 'Role-specific onboarding now, with cohort analytics and dashboards planned next.',
    icon: 'school',
  },
  {
    title: 'Employers',
    text: 'Role-specific onboarding now, with consent-aware skill discovery planned next.',
    icon: 'employer',
  },
] as const

function RoleIcon({ name }: { name: (typeof ROLES)[number]['icon'] }) {
  if (name === 'student') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 3 2 8l10 5 8-4v6h2V8L12 3Zm-6 9.2V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.8l-6 3-6-3Z"
        />
      </svg>
    )
  }
  if (name === 'school') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          fill="currentColor"
          d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4Zm3 3v2h8V7H7Zm0 4v2h8v-2H7Zm12 9V8h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-1Z"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 11.3-5.5l1.2 1.2A8.9 8.9 0 0 0 3 20h2Zm11.5-1.5 2.2 2.2 1.4-1.4-2.2-2.2a3.5 3.5 0 1 0-1.4 1.4Z"
      />
    </svg>
  )
}

export function Home() {
  return (
    <>
      <Header user={null} />
      <main className="home">
        <Container>
          <Row className="align-items-center g-4 g-lg-5">
            <Col lg={7}>
              <p className="home__eyebrow">AUTHENTIC SKILLS EVIDENCE</p>
              <h1 className="home__title">
                Assess skills. Build evidence.
                <br />
                Share outcomes with confidence.
              </h1>
              <p className="home__lead">
                A structured platform for students, schools and employers, extending digital
                assessment with controlled AI, explainable scoring and trusted verification.
              </p>
              <div className="home__actions">
                <a className="home__primary" href="/register">
                  Get started →
                </a>
                <a className="home__secondary" href="/login">
                  Sign in
                </a>
              </div>
            </Col>
            <Col lg={5}>
              <Row className="g-3">
                <Col xs={6}>
                  <div className="home__stat">
                    <div className="home__stat-value">7</div>
                    <div className="home__stat-label">Skill families</div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="home__stat">
                    <div className="home__stat-value">52</div>
                    <div className="home__stat-label">Sub-skills</div>
                  </div>
                </Col>
              </Row>
              <section className="home__journey" aria-labelledby="assessment-journey">
                <h2 id="assessment-journey">Assessment journey</h2>
                <ol>
                  {JOURNEY.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>
            </Col>
          </Row>
          <Row className="g-3 mt-4 mt-lg-5">
            {ROLES.map((role) => (
              <Col key={role.title} md={4}>
                <article className="home__role">
                  <span className="home__role-icon">
                    <RoleIcon name={role.icon} />
                  </span>
                  <h2>{role.title}</h2>
                  <p>{role.text}</p>
                </article>
              </Col>
            ))}
          </Row>
        </Container>
      </main>
      <Footer />
    </>
  )
}
