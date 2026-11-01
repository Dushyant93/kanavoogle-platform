import {useEffect, useState, type FormEvent,} from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import {Footer} from '../../layout/Footer'
import {Header} from '../../layout/Header'
import {authService} from '../../services'
import {locationService } from '../../services/locationService'
import type {AustralianState, LocationOption, LocationSearchMode,} from '../../types/location'
import {toErrorMessage} from '../../utils'
import '../../styles/style.css'

const YEAR_LEVELS = [7, 8, 9, 10, 11, 12] as const

const STATES: {
    value: AustralianState
    label: string
}[] = [

    {
        value: 'ACT',
        label: 'Australian Capital Territory',
    },
    {
        value: 'NSW',
        label: 'New South Wales',
    },
    {
        value: 'NT',
        label: 'Northern Territory',
    },
    {
        value: 'QLD',
        label: 'Queensland',
    },
    {
        value: 'SA',
        label: 'South Australia',
    },
    {
        value: 'TAS',
        label: 'Tasmania',
    },
    {
        value: 'VIC',
        label: 'Victoria',
    },
    {
        value: 'WA',
        label: 'Western Australia',
    },
]

export function Register() {
    const [displayName, setDisplayName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [age, setAge] = useState('')
    const [yearLevel, setYearLevel] = useState('')
    const [schoolName, setSchoolName] = useState('')
    //const [region, setRegion] = useState('')
    const [state, setState] = useState<AustralianState | ''>('')
    const [locationMode, setLocationMode] = useState<LocationSearchMode>('area')
    const [locationInput, setLocationInput] = useState('')
    const [locationResults, setLocationResults] = useState<LocationOption[]>([])
    const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null)
    const [locationBusy, setLocationBusy] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [skillSharingConsent, setSkillSharingConsent] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        setLocationInput('')
        setLocationResults([])
        setSelectedLocation(null)
        setLocationError(null)
    }, [ state, locationMode])

    useEffect(() => {
        if (!state) {
            return
        }
        const query = locationInput.trim()
        const searchArea = locationMode === 'area' && query.length >= 2
        const searchPostcode = locationMode === 'postcode' &&  /^\d{4}$/.test(query)

        if (!searchArea && !searchPostcode) {
            setLocationResults([])
            setLocationError(null)
            return
        }

        const controller = new AbortController()
        const delay = locationMode === 'area' ? 250 : 0
        const timer =
            window.setTimeout(
                async () => {
                    setLocationBusy(true)
                    setLocationError(null)
                    try {
                        const results = locationMode === 'area' ? await locationService.searchByArea( state, query, controller.signal,)
                            : await locationService.searchByPostcode(state, query, controller.signal,)

                        setLocationResults(results)

                        if (results.length === 0) {
                            setLocationError('No matching suburb found for the selected state.',)
                        }
                        if (locationMode === 'postcode' && results.length === 1) {
                            setSelectedLocation(results[0],)
                        }
                    } catch (err) {
                        if (err instanceof DOMException && err.name === 'AbortError') {
                            return
                        }
                        setLocationError(toErrorMessage(err),)
                    } finally {
                        setLocationBusy(false)
                    }
                },
                delay,
            )
        return () => {
            window.clearTimeout(timer)
            controller.abort()

        }
    }, [state, locationMode, locationInput])

    function chooseLocation(
        option: LocationOption,) {
        setSelectedLocation(option)

        setLocationInput( locationMode === 'area' ? option.suburb : option.postcode,)

        setLocationResults([])
        setLocationError(null)
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        if (!state || !selectedLocation) {
            setError('Please select a valid school location from the search results.',)
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
                state,
                suburb: selectedLocation.suburb,
                postcode: selectedLocation.postcode,
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
            <Header user={null}/>
            <main className="register">
                <section className="register__card" aria-labelledby="register-title">
                    <p className="register__eyebrow">Student account</p>
                    <h1 id="register-title" className="register__title">
                        Create your account
                    </h1>
                    <p className="register__lead">
                        Set up your profile so schools can assess skills and you can keep verified evidence.
                    </p>
                    <p className="register__signin">
                        Registering a school or employer? <a href="/register/school">School account</a> · <a href="/register/employer">Employer account</a>
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
                                        minLength={10}
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
                                        minLength={10}
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
                                        min={13}
                                        max={19}
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
                                        required>
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
                                <Form.Group controlId="register-state">
                                    <Form.Label> State or territory </Form.Label>
                                    <Form.Select value={state}
                                                 onChange={(event) => setState(event.target.value as AustralianState | '')}
                                                 required>
                                        <option value="">Select state or territory</option>
                                        {STATES.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Label> School location </Form.Label>
                                <div className="location-mode">
                                    <Button type="button"
                                            variant={
                                                locationMode === 'area'
                                                    ? 'primary'
                                                    : 'outline-secondary'
                                            }
                                            onClick={() =>
                                                setLocationMode('area')
                                            }
                                    > Area name </Button>
                                    <Button type="button"
                                            variant={
                                                locationMode === 'postcode'
                                                    ? 'primary'
                                                    : 'outline-secondary'
                                            }
                                            onClick={() =>
                                                setLocationMode('postcode')
                                            }> Postcode </Button>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <Form.Group controlId="register-location-search">
                                    <Form.Label>
                                        {locationMode === 'area' ? 'Suburb or area' : 'Postcode'}
                                    </Form.Label>

                                    <Form.Control
                                        value={locationInput}
                                        disabled={!state}
                                        inputMode={ locationMode === 'postcode' ? 'numeric' : undefined }
                                        maxLength={ locationMode === 'postcode' ? 4 : undefined }
                                        placeholder={ !state ? 'Select a state first' : locationMode === 'area' ? 'Start typing, e.g. Taigum' : 'Enter 4-digit postcode'}
                                        onChange={(event) => {
                                            const value = locationMode === 'postcode' ? event.target.value .replace(/\D/g, '') : event.target.value
                                            setLocationInput(value)
                                            setSelectedLocation(null)
                                        }}
                                        autoComplete="off"
                                        required />
                                    {locationBusy ? (
                                        <Form.Text>
                                            Searching...
                                        </Form.Text>
                                    ) : null}
                                    {locationError ? (
                                        <div className="location-error">
                                            {locationError}
                                        </div>
                                    ) : null}
                                </Form.Group>
                                {locationResults.length > 0 ? (
                                    <div className="location-results">
                                        {locationResults.map(
                                            (option) => (
                                                <button
                                                    type="button"
                                                    className="location-result"
                                                    key={
                                                        `${option.state}-${option.postcode}-${option.suburb}`
                                                    }
                                                    onClick={() =>
                                                        chooseLocation(option)
                                                    } >
                                                    <strong>
                                                        {option.suburb}
                                                    </strong>
                                                    <span> {option.state}{' '} {option.postcode} </span>
                                                </button>
                                            ),
                                        )}
                                    </div>
                                ) : null}
                                {selectedLocation ? (
                                    <div className="location-selected">
                                        Selected:{' '}
                                        {selectedLocation.suburb},{' '}
                                        {selectedLocation.state}{' '}
                                        {selectedLocation.postcode}
                                    </div>
                                ) : null}
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
            <Footer/>
        </>
    )
}
