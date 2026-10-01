import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import '../styles/style.css'

const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Accreditation', href: '/terms' },
  { label: 'Audit Ledger', href: '/audit-ledger' },
] as const

export function Footer() {
  return (
    <footer className="site-footer">
      <Container className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-md-between gap-2 gap-md-4" fluid>
        <p className="site-footer__brand-line mb-0">
          <span className="site-footer__brand">Kanavoogle</span>
          <span className="site-footer__dot" aria-hidden="true">
            •
          </span>
          <span className="site-footer__tagline">Verified Academic Competency Economy</span>
        </p>
        <Nav className="site-footer__links flex-row flex-wrap">
          {FOOTER_LINKS.map((link) => (
            <Nav.Link key={link.href} href={link.href}>
              {link.label}
            </Nav.Link>
          ))}
        </Nav>
      </Container>
    </footer>
  )
}
