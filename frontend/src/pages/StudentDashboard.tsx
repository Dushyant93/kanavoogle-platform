import { useEffect, useState, type ReactNode } from 'react';
import {ArrowRight, ClipboardCheck, GraduationCap, Wallet as WalletIcon} from 'lucide-react';
import {Link} from 'react-router-dom';
import {api, humanize} from '../api';
import {useAuth} from '../auth/AuthContext';
import type {Wallet} from '../types';

export default function StudentDashboard() {
    const {user} = useAuth();
    const [data, setData] = useState<any>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [walletError, setWalletError] = useState(false);
    useEffect(() => {
        api.get('/dashboard/student').then(r => setData(r.data));
        api.get<Wallet>('/wallet/me').then(r => setWallet(r.data)).catch(() => setWalletError(true));
    }, []);
    const recent = data?.recentAssessments || [];
    const summary = wallet?.summary;
    return <div>
        <div className="page-heading">
            <div><span className="eyebrow">STUDENT WORKSPACE</span><h1>Welcome, {user?.displayName}</h1><p>Your age and
                year level are used to keep assessment content appropriate.</p></div>
            <Link className="button" to="/student/assessment/new">Start assessment <ArrowRight size={16}/></Link></div>
        <div className="stat-grid"><Stat icon={<GraduationCap/>} label="Year level"
                                         value={`Year ${user?.studentProfile?.yearLevel}`}/><Stat
            icon={<ClipboardCheck/>} label="Completed"
            value={summary ? String(summary.completedAssessments) : '…'}/><Stat icon={<WalletIcon/>}
                                                                                label="Skill coins"
                                                                                value={summary ? humanize(summary.coinAllocationStatus) : walletError ? 'Unavailable' : '…'}/>
        </div>
        <section className="content-card">
            <div className="section-head"><h2>Recent assessments</h2></div>
            {!recent.length ? <div className="empty">No assessments yet.</div> : recent.map((a: any) => <div
                className="table-row" key={a.id}>
                <div><b>{a.skillName}</b><small>{a.subSkillName}</small></div>
                <span
                    className="status">{a.status}</span><strong>{a.weightedPercent != null ? `${a.weightedPercent}%` : 'In progress'}</strong>
            </div>)}</section>
        <section className="content-card">
            <div className="section-head"><h2>Digital Skills Wallet</h2><Link className="secondary-button" to="/student/wallet">Open wallet <ArrowRight size={16}/></Link></div>
            {walletError ? <p className="muted">Your wallet could not be loaded right now.</p>
                : !summary ? <p className="muted">Loading…</p>
                    : <p className="muted">
                        {summary.skillsEvidenced
                            ? <>{summary.skillsEvidenced} skill{summary.skillsEvidenced === 1 ? '' : 's'} evidenced, average evidence score <b>{summary.averageEvidenceScore}%</b>, {summary.ledgerVerifiedSkills} verified on the ledger.</>
                            : 'No skill evidence yet. Complete an assessment to start your wallet.'}
                    </p>}
        </section>
    </div>
}

function Stat({icon, label, value}: { icon: ReactNode, label: string, value: string }) {
    return <div className="stat-card"><span className="stat-icon">{icon}</span>
        <div><small>{label}</small><b>{value}</b></div>
    </div>
}
