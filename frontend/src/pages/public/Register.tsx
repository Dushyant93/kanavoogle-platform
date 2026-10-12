import { useState, type FormEvent } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { Footer } from '../../layout/Footer'
import { Header } from '../../layout/Header'
import { authService } from '../../services/authService'
import { toErrorMessage } from '../../utils/errors'
import '../../styles/style.css'

const YEAR_LEVELS = [7, 8, 9, 10, 11, 12] as const

export function Register() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [age, setAge] = useState('')
  const [yearLevel, setYearLevel] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [region, setRegion] = useState('')
  const [skillSharingConsent, setSkillSharingConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const user = await authService.registerStudent({
        displayName,
        email,
        password,
        age: Number(age),
        yearLevel: Number(yearLevel),
        schoolName,
        region,
        skillSharingConsent,
      })
      window.location.assign(user.role === 'STUDENT' ? '/student' : '/')
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Header user={null} />
      <main className="register">
        <section className="register__card" aria-labelledby="register-title">
          <p className="register__eyebrow">Student account</p>
          <h1 id="register-title" className="register__title">
            Create your account
          </h1>
          <p className="register__lead">
            Set up your profile so schools can assess skills and you can keep verified evidence.
          </p>
          {error ? <Alert variant="danger">{error}</Alert> : null}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="register-name">
                  <Form.Label>Full name</Form.Label>
                  <Form.Control
                    autoComplete="name"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="register-email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="register-password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="register-confirm">
                  <Form.Label>Confirm password</Form.Label>
                  <Form.Control
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col sm={6} md={3}>
                <Form.Group controlId="register-age">
                  <Form.Label>Age</Form.Label>
                  <Form.Control
                    type="number"
                    min={10}
                    max={25}
                    inputMode="numeric"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col sm={6} md={3}>
                <Form.Group controlId="register-year">
                  <Form.Label>Year level</Form.Label>
                  <Form.Select
                    value={yearLevel}
                    onChange={(event) => setYearLevel(event.target.value)}
                    required
                  >
                    <option value="">Select</option>
                    {YEAR_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        Year {level}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="register-school">
                  <Form.Label>School</Form.Label>
                  <Form.Control
                    autoComplete="organization"
                    value={schoolName}
                    onChange={(event) => setSchoolName(event.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group controlId="register-region">
                  <Form.Label>Region</Form.Label>
                  <Form.Control
                    autoComplete="address-level1"
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Check
              className="register__consent"
              id="register-consent"
              type="checkbox"
              checked={skillSharingConsent}
              onChange={(event) => setSkillSharingConsent(event.target.checked)}
              label="I agree to share assessed skills with my school."
            />
            <Button className="register__submit" type="submit" disabled={busy}>
              {busy ? 'Creating account...' : 'Create account'}
            </Button>
          </Form>
          <p className="register__signin">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
