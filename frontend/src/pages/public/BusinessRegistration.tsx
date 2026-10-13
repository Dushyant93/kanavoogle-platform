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

export function BusinessRegistration() {
    const [displayName, setDisplayName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [region, setRegion] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [organisationRole, setOrganisationRole] = useState('')
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
            await authService.registerEmployer({
                displayName,
                email,
                password,
                businessName,
                region,
                contactPerson,
                organisationRole,
            })
            window.location.assign('/employer')
        } catch (err) {
            setError(toErrorMessage(err))
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <Header />
            <main className="register">
                <section className="register__card" aria-labelledby="employer-register-title">
                    <p className="register__eyebrow">Employer account</p>
                    <h1 id="employer-register-title" className="register__title">Register your organisation</h1>
                    <p className="register__lead">Create an employer account for future consent-aware skill discovery and credential verification.</p>
                    <p className="register__signin">
                        Registering as a <a href="/register">student</a> or <a href="/register/school">school</a>?
                    </p>
                    {error ? <Alert variant="danger">{error}</Alert> : null}
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group controlId="employer-display-name">
                                    <Form.Label>Account name</Form.Label>
                                    <Form.Control value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="employer-email">
                                    <Form.Label>Login email</Form.Label>
                                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="employer-password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="employer-confirm-password">
                                    <Form.Label>Confirm password</Form.Label>
                                    <Form.Control type="password" minLength={10} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="employer-business-name">
                                    <Form.Label>Business name</Form.Label>
                                    <Form.Control value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="employer-region">
                                    <Form.Label>Region</Form.Label>
                                    <Form.Control value={region} onChange={(e) => setRegion(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="employer-contact">
                                    <Form.Label>Contact person</Form.Label>
                                    <Form.Control value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="employer-role">
                                    <Form.Label>Your role</Form.Label>
                                    <Form.Control value={organisationRole} onChange={(e) => setOrganisationRole(e.target.value)} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button className="register__submit" type="submit" disabled={busy}>
                            {busy ? 'Creating account...' : 'Create employer account'}
                        </Button>
                    </Form>
                </section>
            </main>
            <Footer />
        </>
    )
}
