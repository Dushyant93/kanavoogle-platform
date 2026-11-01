import { useContext, useState } from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { AuthContext } from '../auth/AuthContext'
import type { User } from '../types/auth'
import '../styles/style.css'

const STUDENT_NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '/student' },
  { id: 'tests', label: 'Tests', href: '/tests' },
  { id: 'wallet', label: 'My Vault', href: '/my-vault' },
  { id: 'profile', label: 'Profile', href: '/profile' },
] as const

type StudentNavItem = (typeof STUDENT_NAV_ITEMS)[number]['id']

type HeaderProps = {
  /**
   * Optional explicit user. When null/omitted the shared AuthContext is used.
   * This prevents authenticated pages that pass `null` while loading from
   * incorrectly showing Sign in/Create account after the session is known.
   */
  user?: User | null
  active?: StudentNavItem
}

function initials(name: string) {
  return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'U'
}

function dashboardPath(user: User) {
  if (user.role === 'STUDENT') return '/student'
  if (user.role === 'SCHOOL') return '/school'
  return '/employer'
}

export function Header({ user: explicitUser, active = 'home' }: HeaderProps) {
  const auth = useContext(AuthContext)
  const user = explicitUser ?? auth?.user ?? null
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      if (auth) await auth.logout()
    } catch {
      // A missing/expired server session should not prevent leaving protected UI.
    } finally {
      window.location.assign('/login')
    }
  }

  const isStudent = user?.role === 'STUDENT'

  return (
      <Navbar expand="lg" className="student-header">
        <Container fluid>
          <Navbar.Brand href={user ? dashboardPath(user) : '/'} className="student-header__brand">
          <span className="student-header__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                  fill="currentColor"
                  d="M12 2.5 5 5.2v6.1c0 4.3 2.8 8.2 7 9.2 4.2-1 7-4.9 7-9.2V5.2L12 2.5Zm0 2.2 5 2.1v4.5c0 3.3-2.1 6.3-5 7.2-2.9-.9-5-3.9-5-7.2V6.8l5-2.1Z"
              />
            </svg>
          </span>
            Kanavoogle Skills
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="student-nav" />
          <Navbar.Collapse id="student-nav">
            {user ? (
                <>
                  <Nav className="me-lg-auto">
                    {isStudent ? (
                        STUDENT_NAV_ITEMS.map((item) => (
                            <Nav.Link
                                key={item.id}
                                href={item.href}
                                active={item.id === active}
                                aria-current={item.id === active ? 'page' : undefined}
                                className="student-header__link"
                            >
                              {item.label}
                            </Nav.Link>
                        ))
                    ) : (
                        <Nav.Link href={dashboardPath(user)} className="student-header__link">
                          Dashboard
                        </Nav.Link>
                    )}
                    <button
                        type="button"
                        className="nav-link student-header__link student-header__logout"
                        onClick={handleLogout}
                        disabled={loggingOut}
                    >
                      {loggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </Nav>

                  <div className="student-header__account">
                    <div>
                      <div className="student-header__name">{user.displayName}</div>
                      <div className="student-header__level">
                        {isStudent && user.studentProfile?.yearLevel != null
                            ? `Year ${user.studentProfile.yearLevel}`
                            : user.role === 'SCHOOL'
                                ? 'School account'
                                : user.role === 'EMPLOYER'
                                    ? 'Employer account'
                                    : ''}
                      </div>
                    </div>
                    <div className="student-header__avatar" aria-hidden="true">
                      {initials(user.displayName)}
                    </div>
                  </div>
                </>
            ) : (
                <Nav className="ms-lg-auto align-items-lg-center">
                  <Nav.Link href="/login" className="student-header__link">
                    Sign in
                  </Nav.Link>
                  <Nav.Link href="/register" className="student-header__link student-header__signup">
                    Create account
                  </Nav.Link>
                </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
  )
}
