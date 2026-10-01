import type { ReactNode } from 'react'
import Alert from 'react-bootstrap/Alert'
import Container from 'react-bootstrap/Container'
import Spinner from 'react-bootstrap/Spinner'
import { useCurrentStudent } from '../../hooks/useAssessmentFlow'
import { Footer } from '../../layout/Footer'
import { Header } from '../../layout/Header'
import '../../styles/style.css'
import '../../styles/assessment.css'

type AssessmentLayoutProps = {
  children: ReactNode
  narrow?: boolean
  subbar?: ReactNode
}

/** Shared page frame for the assessment screens: header, main area, footer. */
export function AssessmentLayout({ children, narrow = false, subbar }: AssessmentLayoutProps) {
  const student = useCurrentStudent()
  return (
    <>
      <Header user={student} active="tests" />
      {subbar}
      <main className="tests">
        <Container className={narrow ? 'tests-narrow' : undefined}>{children}</Container>
      </main>
      <Footer />
    </>
  )
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="text-center py-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">{label}</span>
      </Spinner>
    </div>
  )
}

export function ErrorBlock({ message }: { message: string }) {
  return <Alert variant="danger">{message}</Alert>
}
