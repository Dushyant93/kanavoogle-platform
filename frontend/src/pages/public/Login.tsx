import { useState, type FormEvent } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { Footer } from '../../layout/Footer'
import { Header } from '../../layout/Header'
import { authService } from '../../services/authService'
import { toErrorMessage } from '../../utils/errors'
import '../../styles/style.css'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const user = await authService.login({ email, password })
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
      <main className="login">
        <section className="login__card" aria-labelledby="login-title">
          <h1 id="login-title" className="login__title">
            Welcome back
          </h1>
          {error ? <Alert variant="danger">{error}</Alert> : null}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="login-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2" controlId="login-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Form.Group>
            <a className="login__forgot" href="/forgot-password">
              Forgot password?
            </a>
            <Button className="login__submit" type="submit" disabled={busy}>
              {busy ? 'Logging in...' : 'Log in'}
            </Button>
          </Form>
        </section>
      </main>
      <Footer />
    </>
  )
}
