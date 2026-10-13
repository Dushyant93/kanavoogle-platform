import { useEffect, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Container from 'react-bootstrap/Container'
import Spinner from 'react-bootstrap/Spinner'
import { useAuth } from '../../hooks/useAuth'
import { Footer } from '../../layout/Footer'
import { Header } from '../../layout/Header'
import { studentService } from '../../services/studentService'
import type { User } from '../../types/auth'
import { toErrorMessage } from '../../utils/errors'
import '../../styles/style.css'

type Props = { role: 'SCHOOL' | 'EMPLOYER' }
type DashboardData = { user: User; message: string }

export function OrganisationDashboard({ role }: Props) {
    const { user, loading: authLoading } = useAuth()
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (authLoading) return
        if (!user || user.role !== role) {
            setLoading(false)
            return
        }
        const load = role === 'SCHOOL' ? studentService.schoolDashboard : studentService.employerDashboard
        load()
            .then(setData)
            .catch((err: unknown) => setError(toErrorMessage(err)))
            .finally(() => setLoading(false))
    }, [authLoading, role, user])

    if (authLoading || loading) {
        return (
            <>
                <Header user={user} />
                <main className="dashboard"><Container className="text-center py-5"><Spinner animation="border" /></Container></main>
                <Footer />
            </>
        )
    }

    if (!user) {
        return (
            <>
                <Header />
                <main className="dashboard"><Container className="py-5"><Alert variant="warning">You need to sign in first.</Alert></Container></main>
                <Footer />
            </>
        )
    }

    if (user.role !== role) {
        return (
            <>
                <Header user={user} />
                <main className="dashboard"><Container className="py-5"><Alert variant="danger">This page is not available for your account role.</Alert></Container></main>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Header user={user} />
            <main className="dashboard">
                <Container>
                    <h1 className="dashboard__hello">Welcome, {user.displayName}</h1>
                    <p className="dashboard__intro">
                        {role === 'SCHOOL'
                            ? data?.user.schoolProfile?.schoolName ?? 'School dashboard'
                            : data?.user.employerProfile?.businessName ?? 'Employer dashboard'}
                    </p>
                    {error ? <Alert variant="danger">{error}</Alert> : null}
                    <section className="dashboard__card">
                        <h2 className="dashboard__card-title">Account status</h2>
                        <p className="dashboard__note">Verification: {user.verificationStatus}</p>
                        <p>{data?.message ?? 'Dashboard information is not available yet.'}</p>
                    </section>
                </Container>
            </main>
            <Footer />
        </>
    )
}
