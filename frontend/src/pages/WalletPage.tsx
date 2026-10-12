import {useCallback, useEffect, useState, type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {
    AlertTriangle, ArrowRight, Award, Check, ChevronDown, ClipboardCheck, Copy, Layers, RefreshCw, ShieldCheck, Wallet as WalletIcon
} from 'lucide-react';
import {api, errorMessage, formatDate, humanize} from '../api';
import type {Wallet, WalletSkill} from '../types';

export default function WalletPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        setError('');
        api.get<Wallet>('/wallet/me')
            .then(r => setWallet(r.data))
            .catch(e => setError(errorMessage(e)))
            .finally(() => setLoading(false));
    }, []);

    useEffect(load, [load]);

    if (loading && !wallet) return <div className="center-state">Loading your wallet…</div>;
    if (error && !wallet) return <div className="content-card">
        <div className="alert error">Could not load your wallet: {error}</div>
        <div className="form-actions"><button className="secondary-button" onClick={load}><RefreshCw size={16}/>Try again</button></div>
    </div>;
    if (!wallet) return null;

    const {student, summary, skills} = wallet;
    const pendingCoins = summary.coinAllocationStatus?.startsWith('PENDING');

    return <div>
        <div className="page-heading">
            <div>
                <span className="eyebrow">DIGITAL SKILLS WALLET</span>
                <h1>{student.displayName}</h1>
                <p>
                    {[student.yearLevel != null ? `Year ${student.yearLevel}` : null, student.schoolName].filter(Boolean).join(' · ')}
                    {summary.lastActivityAt && <> · Last activity {formatDate(summary.lastActivityAt)}</>}
                </p>
                <span className={`badge ${student.skillSharingConsent ? 'ok' : 'neutral'}`}>
                    {student.skillSharingConsent ? 'Skill sharing consent given' : 'Skill sharing not consented'}
                </span>
            </div>
            <div className="heading-actions">
                <button className="secondary-button" onClick={load} disabled={loading}><RefreshCw size={16}/>{loading ? 'Refreshing…' : 'Refresh'}</button>
                <Link className="button" to="/student/assessment/new">Add evidence <ArrowRight size={16}/></Link>
            </div>
        </div>

        {error && <div className="alert error wallet-alert">Refresh failed: {error}</div>}

        <div className="stat-grid four">
            <Stat icon={<Layers/>} label="Skills evidenced" value={String(summary.skillsEvidenced)}/>
            <Stat icon={<ClipboardCheck/>} label="Completed assessments" value={String(summary.completedAssessments)}/>
            <Stat icon={<Award/>} label="Average evidence score" value={summary.skillsEvidenced ? `${summary.averageEvidenceScore}%` : '—'}/>
            <Stat icon={<ShieldCheck/>} label="Ledger-verified skills" value={`${summary.ledgerVerifiedSkills} of ${summary.skillsEvidenced}`}/>
        </div>

        <div className="notice wallet-notice">
            <b>Skill coins: {humanize(summary.coinAllocationStatus)}.</b>{' '}
            {pendingCoins
                ? 'Coins will be allocated once the stakeholder weighting and coin rules are approved. Your evidence below is already recorded.'
                : 'Coins are allocated from the evidence recorded below.'}
        </div>

        {!skills.length
            ? <section className="content-card">
                <div className="empty wallet-empty">
                    <WalletIcon size={30}/>
                    <h3>Your wallet is empty</h3>
                    <p>Complete an assessment to record your first skill evidence.</p>
                    <Link className="button" to="/student/assessment/new">Start an assessment <ArrowRight size={16}/></Link>
                </div>
            </section>
            : skills.map(s => <SkillCard key={s.skillId} skill={s}/>)}
    </div>
}

function SkillCard({skill: s}: { skill: WalletSkill }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(s.proofValue);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard unavailable: the full value is still visible in the title tooltip */
        }
    };

    return <section className="content-card skill-card">
        <div className="skill-head">
            <div>
                <h2>{s.skillName}</h2>
                <small className="muted">
                    {s.completedAssessments} assessment{s.completedAssessments === 1 ? '' : 's'} · last {formatDate(s.lastAssessedAt)}
                </small>
                <div className="chips">{s.complexitiesAttempted.map(c => <span key={c} className="chip">{humanize(c)}</span>)}</div>
            </div>
            <div className="score-block">
                <strong>{s.evidenceScore}%</strong>
                <small>Evidence score</small>
            </div>
        </div>

        <Bar value={s.evidenceScore}/>
        <div className="mini-stats">
            <span>Best <b>{s.bestScore}%</b></span>
            <span>Latest <b>{s.latestScore}%</b></span>
            <span>Coins <b>{humanize(s.coinAllocationStatus)}</b></span>
        </div>

        <div className={`proof ${s.ledgerVerified ? 'verified' : 'local'}`}>
            {s.ledgerVerified ? <ShieldCheck size={18}/> : <AlertTriangle size={18}/>}
            <div>
                <b>{s.ledgerVerified ? 'Verified on Hyperledger Fabric' : 'Local proof only: not yet on the ledger'}</b>
                <small>{s.proofType} · <code title={s.proofValue}>{short(s.proofValue)}</code></small>
            </div>
            <button className="icon-button" onClick={copy} title="Copy proof hash" aria-label="Copy proof hash">
                {copied ? <Check size={16}/> : <Copy size={16}/>}
            </button>
        </div>

        <button className="link-button expand" onClick={() => setOpen(o => !o)} aria-expanded={open}>
            <ChevronDown size={16} className={open ? 'rot' : ''}/>{open ? 'Hide details' : 'Show sub-skills and history'}
        </button>

        {open && <div className="skill-details">
            <div>
                <h3>Sub-skills</h3>
                {s.subSkills.map(sub => <div key={sub.subSkillId} className="sub-row">
                    <span>{sub.subSkillName}<small>{sub.completedAssessments} attempt{sub.completedAssessments === 1 ? '' : 's'}</small></span>
                    <Bar value={sub.averageScore} small/>
                    <b>{sub.averageScore}%</b>
                </div>)}
            </div>
            <div>
                <h3>Assessment history</h3>
                {s.attempts.map(a => <div key={a.id} className="table-row history-row">
                    <div><b>{a.subSkillName}</b><small>{a.context} · {humanize(a.complexity)} · {formatDate(a.completedAt)}</small></div>
                    <strong>{a.weightedPercent != null ? `${a.weightedPercent}%` : '—'}</strong>
                </div>)}
            </div>
        </div>}
    </section>
}

function Bar({value, small}: { value: number, small?: boolean }) {
    const v = Math.max(0, Math.min(100, value || 0));
    return <div className={`score-bar ${small ? 'small' : ''}`} role="img" aria-label={`${v}%`}><i style={{width: `${v}%`}}/></div>
}

function Stat({icon, label, value}: { icon: ReactNode, label: string, value: string }) {
    return <div className="stat-card"><span className="stat-icon">{icon}</span>
        <div><small>{label}</small><b>{value}</b></div>
    </div>
}

function short(hash: string) {
    return hash && hash.length > 20 ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : hash;
}
