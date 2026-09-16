import { useEffect, useState, type ReactNode } from 'react'
import {Building2, GraduationCap, UserRoundSearch} from 'lucide-react';
import {api, errorMessage} from '../api';
import {useAuth} from '../auth/AuthContext';
import {useNavigate, Link} from 'react-router-dom';
import type {Role} from '../types';
import {AuthLayout} from './LoginPage';

export default function RegisterPage() {
    const [role, setRole] = useState<Role | null>(null);
    if (!role) return <div className="auth-page">
        <div className="auth-card wide"><Link to="/" className="auth-brand">Kanavoogle Skills</Link><h1>Create your
            account</h1><p>Registration differs by user group because each group has different profile and verification
            requirements.</p>
            <div className="register-role-grid"><R icon={<GraduationCap/>} title="Student" text="Ages 13–19"
                                                   on={() => setRole('STUDENT')}/><R icon={<Building2/>} title="School"
                                                                                     text="Authorised school representative"
                                                                                     on={() => setRole('SCHOOL')}/><R
                icon={<UserRoundSearch/>} title="Employer" text="Local business or employer"
                on={() => setRole('EMPLOYER')}/></div>
        </div>
    </div>;
    return <Registration role={role} back={() => setRole(null)}/>
}

function R({icon, title, text, on}: { icon: ReactNode, title: string, text: string, on: () => void }) {
    return <button className="register-role" onClick={on}><span>{icon}</span><b>{title}</b><small>{text}</small>
    </button>
}

function Registration({role, back}: { role: Role, back: () => void }) {
    const [form, setForm] = useState<Record<string, any>>(role === 'STUDENT' ? {
        age: 15,
        yearLevel: 9,
        skillSharingConsent: false
    } : {}), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const {refresh} = useAuth();
    const nav = useNavigate();
    const set = (k: string, v: any) => setForm({...form, [k]: v});
    const common = <><label>Full name<input required onChange={e => set('displayName', e.target.value)}/></label><label>Email<input
        type="email" required onChange={e => set('email', e.target.value)}/></label><label>Password<input
        type="password" minLength={10} required onChange={e => set('password', e.target.value)}/><small>Minimum 10
        characters.</small></label></>;
    return <AuthLayout title={`${role[0]}${role.slice(1).toLowerCase()} registration`}
                       subtitle="Enter the details required for this account type.">
        <form className="form-stack" onSubmit={async e => {
            e.preventDefault();
            setBusy(true);
            try {
                const d = (await api.post(`/auth/register/${role.toLowerCase()}`, form)).data;
                await refresh();
                nav(`/${d.role.toLowerCase()}`)
            } catch (x) {
                setError(errorMessage(x))
            } finally {
                setBusy(false)
            }
        }}>{error && <div className="alert error">{error}</div>}{common}{role === 'STUDENT' && <>
            <div className="form-row"><label>Age<input type="number" min={13} max={19} value={form.age}
                                                       onChange={e => set('age', Number(e.target.value))}/></label><label>Year
                level<input type="number" min={7} max={12} value={form.yearLevel}
                            onChange={e => set('yearLevel', Number(e.target.value))}/></label></div>
            <label>School<input required onChange={e => set('schoolName', e.target.value)}/></label><label>Region<input
            required onChange={e => set('region', e.target.value)}/></label><label className="check"><input
            type="checkbox" onChange={e => set('skillSharingConsent', e.target.checked)}/>Allow future permission-based
            sharing of my skill profile.</label></>}{role === 'SCHOOL' && <><label>School name<input required
                                                                                                     onChange={e => set('schoolName', e.target.value)}/></label><label>Location<input
            required onChange={e => set('location', e.target.value)}/></label><label>Contact person<input required
                                                                                                          onChange={e => set('contactPerson', e.target.value)}/></label><label>Official
            school email<input type="email" required
                               onChange={e => set('officialEmail', e.target.value)}/></label></>}{role === 'EMPLOYER' && <>
            <label>Business name<input required onChange={e => set('businessName', e.target.value)}/></label><label>Region<input
            required onChange={e => set('region', e.target.value)}/></label><label>Contact person<input required
                                                                                                        onChange={e => set('contactPerson', e.target.value)}/></label><label>Organisation
            role<input required onChange={e => set('organisationRole', e.target.value)}/></label></>}
            <div className="form-actions">
                <button type="button" className="secondary-button" onClick={back}>Back</button>
                <button className="button" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
            </div>
        </form>
    </AuthLayout>
}
