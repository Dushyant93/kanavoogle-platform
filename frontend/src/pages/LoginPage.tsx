import { useEffect, useState, type ReactNode } from 'react'
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import {errorMessage} from '../api';

export function AuthLayout({title, subtitle, children}: {
    title: string,
    subtitle: string,
    children: ReactNode
}) {
    return <div className="auth-page">
        <div className="auth-card"><Link to="/" className="auth-brand">Kanavoogle Skills</Link><h1>{title}</h1>
            <p>{subtitle}</p>{children}</div>
    </div>
}

export default function LoginPage() {
    const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const {login} = useAuth();
    const nav = useNavigate();
    return <AuthLayout title="Welcome back" subtitle="Sign in to continue to your workspace.">
        <form className="form-stack" onSubmit={async e => {
            e.preventDefault();
            setBusy(true);
            try {
                const u = await login(email, password);
                nav(`/${u.role.toLowerCase()}`)
            } catch (x) {
                setError(errorMessage(x))
            } finally {
                setBusy(false)
            }
        }}>{error && <div className="alert error">{error}</div>}<label>Email<input type="email" required value={email}
                                                                                   onChange={e => setEmail(e.target.value)}/></label><label>Password<input
            type="password" required value={password} onChange={e => setPassword(e.target.value)}/></label>
            <button className="button full" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
            <p className="form-foot">New here? <Link to="/register">Create an account</Link></p></form>
    </AuthLayout>
}
