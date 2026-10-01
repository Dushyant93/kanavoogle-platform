import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faChevronRight, faWallet } from '@fortawesome/free-solid-svg-icons'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { Footer } from '../../layout/Footer'
import { Header } from '../../layout/Header'
import type { User } from '../../types/auth'
import '../../styles/style.css'

const BIO_LIMIT = 160
const PHOTO_LIMIT = 800 * 1024

const student: User = {
  id: 'student-1',
  email: 'alex.morgan@university.edu',
  displayName: 'Alex Morgan',
  role: 'STUDENT',
  verificationStatus: 'NOT_REQUIRED',
  studentProfile: {
    age: 15,
    yearLevel: 4,
    schoolName: 'Stanford University',
    region: 'Sydney',
    skillSharingConsent: true,
  },
}

const COHORTS = ['Fall 2023', 'Spring 2024', 'Fall 2024', 'Spring 2025'] as const
const GRADUATIONS = ['Fall 2025', 'Spring 2026', 'Fall 2026', 'Spring 2027'] as const

const INITIAL_BIO =
  'CS & Interaction Design Scholar • Building decentralized learning portfolios.'

export function Profile() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [fullName, setFullName] = useState(student.displayName)
  const [email, setEmail] = useState(student.email)
  const [bio, setBio] = useState(INITIAL_BIO)
  const [institution, setInstitution] = useState('Stanford University')
  const [degree, setDegree] = useState('B.S. Interaction Design & CS')
  const [cohort, setCohort] = useState<(typeof COHORTS)[number]>('Fall 2024')
  const [graduation, setGraduation] = useState<(typeof GRADUATIONS)[number]>('Spring 2026')
  const [publicProfile, setPublicProfile] = useState(true)
  const [employerVisibility, setEmployerVisibility] = useState(true)
  const [mintAlerts, setMintAlerts] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  function openPhotoPicker() {
    fileRef.current?.click()
  }

  function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setPhotoError('Use a JPG, GIF, or PNG file.')
      return
    }
    if (file.size > PHOTO_LIMIT) {
      setPhotoError('Photo must be 800K or smaller.')
      return
    }
    setPhotoError(null)
    setPhotoUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
    setSaved(false)
  }

  function removePhoto() {
    setPhotoUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
    setPhotoError(null)
    setSaved(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
  }

  return (
    <>
      <Header user={student} active="profile" />
      <main className="profile">
        <Container>
          <h1 className="profile__title">Edit Profile</h1>
          <p className="profile__lead">
            Manage your personal details, academic program, and credential verification settings.
          </p>
          {saved ? (
            <Alert variant="success" className="profile__saved">
              Profile changes saved on this device.
            </Alert>
          ) : null}

          <Form id="student-profile" onSubmit={handleSubmit}>
            <Row className="g-3 g-lg-4 align-items-start">
              <Col lg={8}>
                <section className="profile__card">
                  <div className="profile__photo">
                    <div className="profile__avatar-wrap">
                      {photoUrl ? (
                        <img className="profile__avatar" src={photoUrl} alt="" />
                      ) : (
                        <div className="profile__avatar profile__avatar--placeholder" aria-hidden="true">
                          AM
                        </div>
                      )}
                      <button
                        type="button"
                        className="profile__camera"
                        aria-label="Upload new photo"
                        onClick={openPhotoPicker}
                      >
                        <FontAwesomeIcon icon={faCamera} />
                      </button>
                    </div>
                    <div className="profile__photo-copy">
                      <strong>{fullName}</strong>
                      <p>Allowed JPG, GIF or PNG. Max size of 800K</p>
                      {photoError ? <p className="profile__photo-error">{photoError}</p> : null}
                      <div className="profile__photo-actions">
                        <Button type="button" className="profile__upload" onClick={openPhotoPicker}>
                          Upload New Photo
                        </Button>
                        <button type="button" className="profile__remove" onClick={removePhoto}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    hidden
                    onChange={onPhotoChange}
                  />
                </section>

                <section className="profile__card" aria-labelledby="personal-info">
                  <div className="profile__section-head">
                    <h2 id="personal-info" className="profile__section-title">
                      Personal Info
                    </h2>
                    <p>Update how you appear on academic boards and verification registries.</p>
                  </div>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="profile-name">
                        <Form.Label className="profile__label">Full name</Form.Label>
                        <Form.Control
                          value={fullName}
                          onChange={(event) => {
                            setFullName(event.target.value)
                            setSaved(false)
                          }}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="profile-email">
                        <Form.Label className="profile__label">Email address</Form.Label>
                        <Form.Control
                          type="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value)
                            setSaved(false)
                          }}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group controlId="profile-bio">
                        <div className="d-flex justify-content-between gap-2">
                          <Form.Label className="profile__label">Bio / statement</Form.Label>
                          <span className="profile__count">
                            {bio.length}/{BIO_LIMIT}
                          </span>
                        </div>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          maxLength={BIO_LIMIT}
                          value={bio}
                          onChange={(event) => {
                            setBio(event.target.value)
                            setSaved(false)
                          }}
                        />
                      </Form.Group>
                      <p className="profile__field-note">
                        Brief summary displayed across institution ledgers and peer endorsements.
                      </p>
                    </Col>
                  </Row>
                </section>

                <section className="profile__card" aria-labelledby="academic-program">
                  <div className="profile__section-head">
                    <h2 id="academic-program" className="profile__section-title">
                      Academic Program
                    </h2>
                    <p>Your official institution records powering decentralized transcript issuance.</p>
                  </div>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="profile-institution">
                        <Form.Label className="profile__label">Institution</Form.Label>
                        <Form.Control
                          value={institution}
                          onChange={(event) => {
                            setInstitution(event.target.value)
                            setSaved(false)
                          }}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="profile-degree">
                        <Form.Label className="profile__label">Degree & specialization</Form.Label>
                        <Form.Control
                          value={degree}
                          onChange={(event) => {
                            setDegree(event.target.value)
                            setSaved(false)
                          }}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="profile-cohort">
                        <Form.Label className="profile__label">Cohort</Form.Label>
                        <Form.Select
                          value={cohort}
                          onChange={(event) => {
                            setCohort(event.target.value as (typeof COHORTS)[number])
                            setSaved(false)
                          }}
                        >
                          {COHORTS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="profile-graduation">
                        <Form.Label className="profile__label">Expected graduation</Form.Label>
                        <Form.Select
                          value={graduation}
                          onChange={(event) => {
                            setGraduation(event.target.value as (typeof GRADUATIONS)[number])
                            setSaved(false)
                          }}
                        >
                          {GRADUATIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </section>
              </Col>

              <Col lg={4}>
                <section className="profile__card" aria-labelledby="privacy-credentials">
                  <h2 id="privacy-credentials" className="profile__section-title">
                    Privacy & Credentials
                  </h2>
                  <p className="profile__card-note">
                    Configure public node visibility and partner access.
                  </p>
                  <div className="profile__toggle">
                    <div>
                      <strong>Public Profile & Transcript</strong>
                      <p>Permit decentralized validation on public blockchain queries</p>
                    </div>
                    <Form.Check
                      type="switch"
                      id="public-profile"
                      checked={publicProfile}
                      onChange={(event) => {
                        setPublicProfile(event.target.checked)
                        setSaved(false)
                      }}
                      aria-label="Public profile and transcript"
                    />
                  </div>
                  <div className="profile__toggle">
                    <div>
                      <strong>Employer Visibility</strong>
                      <p>Share verifiable credentials directly to verified talent partners</p>
                    </div>
                    <Form.Check
                      type="switch"
                      id="employer-visibility"
                      checked={employerVisibility}
                      onChange={(event) => {
                        setEmployerVisibility(event.target.checked)
                        setSaved(false)
                      }}
                      aria-label="Employer visibility"
                    />
                  </div>
                  <div className="profile__toggle">
                    <div>
                      <strong>Notify on SkillCoin Minting</strong>
                      <p>Push alerts whenever new competency tokens arrive in wallet</p>
                    </div>
                    <Form.Check
                      type="switch"
                      id="mint-alerts"
                      checked={mintAlerts}
                      onChange={(event) => {
                        setMintAlerts(event.target.checked)
                        setSaved(false)
                      }}
                      aria-label="Notify on SkillCoin minting"
                    />
                  </div>
                </section>

                <section className="profile__card" aria-labelledby="wallet-verification">
                  <h2 id="wallet-verification" className="profile__section-title">
                    Wallet & Verification
                  </h2>
                  <p className="profile__card-note">Secured with EVM Identity Substrate</p>
                  <div className="profile__ledger">
                    <span className="profile__ledger-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={faWallet} />
                    </span>
                    <div>
                      <div className="profile__ledger-title">
                        <strong>Manage Connected Ledger Wallet</strong>
                        <span className="profile__connected">Connected</span>
                      </div>
                      <p className="profile__address">0x8824A12B…e9f4</p>
                    </div>
                  </div>
                  <a className="profile__manage" href="/wallet">
                    Manage Wallet <FontAwesomeIcon icon={faChevronRight} />
                  </a>
                </section>

                <section className="profile__card profile__actions">
                  <Button className="profile__save" type="submit">
                    Save Changes
                  </Button>
                  <a className="profile__skip" href="/student">
                    Skip for now
                  </a>
                </section>
              </Col>
            </Row>
          </Form>
        </Container>
      </main>
      <Footer />
    </>
  )
}
