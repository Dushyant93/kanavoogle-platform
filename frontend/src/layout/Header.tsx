import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import type { User } from '../types/auth'
import '../styles/style.css'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '/student' },
  { id: 'tests', label: 'Tests', href: '/tests' },
  { id: 'wallet', label: 'Wallet', href: '/wallet' },
  { id: 'profile', label: 'Profile', href: '/profile' },
] as const

type StudentNavItem = (typeof NAV_ITEMS)[number]['id']

const GUEST_ITEMS = [
  { id: 'sign-in', label: 'Sign in', href: '/login' },
  { id: 'create-account', label: 'Create account', href: '/register' },
] as const

type HeaderProps = {
  user: User | null
  active?: StudentNavItem
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function Header({ user, active = 'home' }: HeaderProps) {
  const isStudent = user?.role === 'STUDENT'
  if (user && !isStudent) return null

  const yearLevel = user?.studentProfile?.yearLevel

  return (
    <Navbar expand="lg" className="student-header">
      <Container fluid>
        <Navbar.Brand href={isStudent ? '/student' : '/'} className="student-header__brand">
          {isStudent ? (
            'Kanavoogle'
          ) : (
            <>
              <span className="student-header__mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    fill="currentColor"
                    d="M12 2.5 5 5.2v6.1c0 4.3 2.8 8.2 7 9.2 4.2-1 7-4.9 7-9.2V5.2L12 2.5Zm0 2.2 5 2.1v4.5c0 3.3-2.1 6.3-5 7.2-2.9-.9-5-3.9-5-7.2V6.8l5-2.1Z"
                  />
                </svg>
              </span>
              Kanavoogle Skills
            </>
          )}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="student-nav" />
        <Navbar.Collapse id="student-nav">
          {isStudent ? (
            <>
              <Nav className="me-lg-auto">
                {NAV_ITEMS.map((item) => (
                  <Nav.Link
                    key={item.id}
                    href={item.href}
                    active={item.id === active}
                    aria-current={item.id === active ? 'page' : undefined}
                    className="student-header__link"
                  >
                    {item.label}
                  </Nav.Link>
                ))}
              </Nav>
              <div className="student-header__account">
                <div>
                  <div className="student-header__name">{user.displayName}</div>
                  {yearLevel != null ? (
                    <div className="student-header__level">Level {yearLevel} Scholar</div>
                  ) : null}
                </div>
                <div className="student-header__avatar" aria-hidden="true">
                  {initials(user.displayName)}
                </div>
              </div>
            </>
          ) : (
            <Nav className="ms-lg-auto align-items-lg-center">
              {GUEST_ITEMS.map((item) => (
                <Nav.Link
                  key={item.id}
                  href={item.href}
                  className={
                    item.id === 'create-account'
                      ? 'student-header__link student-header__signup'
                      : 'student-header__link'
                  }
                >
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
