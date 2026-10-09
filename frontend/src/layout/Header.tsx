import { useState } from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { authService } from '../services/authService'
import type { User } from '../types/auth'
import '../styles/style.css'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '/student' },
  { id: 'tests', label: 'Tests', href: '/tests' },
  { id: 'wallet', label: 'My Vault', href: '/my-vault' },
  { id: 'profile', label: 'Profile', href: '/profile' },
] as const

type StudentNavItem = (typeof NAV_ITEMS)[number]['id']

const GUEST_ITEMS = [
  { id: 'sign-in', label: 'Sign in', href: '/login' },
  { id: 'create-account', label: 'Create account', href: '/register' },
] as const

type HeaderAccount = {
  name: string
  level: string
}

type HeaderProps = {
  user: User | null
  active?: StudentNavItem
  account?: HeaderAccount
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4.5V20h14v-1.5C19 16 16 14 12 14Z"
      />
    </svg>
  )
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function Header({ user, active = 'home', account }: HeaderProps) {
  const [loggingOut, setLoggingOut] = useState(false)
  const isStudent = user?.role === 'STUDENT'
  if (user && !isStudent) return null

  const yearLevel = user?.studentProfile?.yearLevel

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await authService.logout()
    } catch {
      // The session may already be gone. Still leave the signed-in pages.
    }
    window.location.assign('/login')
  }

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
                <button type="button" className="nav-link student-header__link student-header__logout" onClick={handleLogout} disabled={loggingOut}>
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
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
            <>
              <Nav className={`${account ? '' : 'ms-lg-auto '}align-items-lg-center`}>
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
              {account ? (
                <div className="student-header__account ms-lg-auto">
                  <div>
                  <div className="student-header__name">{account.name}</div>
                  {account.level ? <div className="student-header__level">{account.level}</div> : null}
                  </div>
                  <div className="student-header__avatar" aria-hidden="true">
                    <AccountIcon />
                  </div>
                </div>
              ) : null}
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
