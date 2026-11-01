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

export function SchoolRegistration() {
    const [displayName, setDisplayName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [schoolName, setSchoolName] = useState('')
    const [location, setLocation] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [officialEmail, setOfficialEmail] = useState('')
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
            await authService.registerSchool({
                displayName,
                email,
                password,
                schoolName,
                location,
                contactPerson,
                officialEmail,
            })
            window.location.assign('/school')
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
                <section className="register__card" aria-labelledby="school-register-title">
                    <p className="register__eyebrow">School account</p>
                    <h1 id="school-register-title" className="register__title">Register your school</h1>
                    <p className="register__lead">Create a school account for assessment administration and future cohort features.</p>
                    <p className="register__signin">
                        Registering as a <a href="/register">student</a> or <a href="/register/employer">employer</a>?
                    </p>
                    {error ? <Alert variant="danger">{error}</Alert> : null}
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group controlId="school-display-name">
                                    <Form.Label>Account name</Form.Label>
                                    <Form.Control value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="school-email">
                                    <Form.Label>Login email</Form.Label>
                                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="school-password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="school-confirm-password">
                                    <Form.Label>Confirm password</Form.Label>
                                    <Form.Control type="password" minLength={10} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="school-name">
                                    <Form.Label>School name</Form.Label>
                                    <Form.Control value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="school-location">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control value={location} onChange={(e) => setLocation(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="school-contact">
                                    <Form.Label>Contact person</Form.Label>
                                    <Form.Control value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="school-official-email">
                                    <Form.Label>Official school email</Form.Label>
                                    <Form.Control type="email" value={officialEmail} onChange={(e) => setOfficialEmail(e.target.value)} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button className="register__submit" type="submit" disabled={busy}>
                            {busy ? 'Creating account...' : 'Create school account'}
                        </Button>
                    </Form>
                </section>
            </main>
            <Footer />
        </>
    )
}
