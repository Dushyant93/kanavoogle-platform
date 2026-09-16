import { useEffect, useState, type ReactNode } from 'react';
import {ArrowRight, ClipboardCheck, GraduationCap} from 'lucide-react';
import {Link} from 'react-router-dom';
import {api} from '../api';
import {useAuth} from '../auth/AuthContext';

export default function StudentDashboard() {
    const {user} = useAuth();
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        api.get('/dashboard/student').then(r => setData(r.data))
    }, []);
    const recent = data?.recentAssessments || [];
    return <div>
        <div className="page-heading">
            <div><span className="eyebrow">STUDENT WORKSPACE</span><h1>Welcome, {user?.displayName}</h1><p>Your age and
                year level are used to keep assessment content appropriate.</p></div>
            <Link className="button" to="/student/assessment/new">Start assessment <ArrowRight size={16}/></Link></div>
        <div className="stat-grid"><Stat icon={<GraduationCap/>} label="Year level"
                                         value={`Year ${user?.studentProfile?.yearLevel}`}/><Stat
            icon={<ClipboardCheck/>} label="Completed"
            value={String(recent.filter((a: any) => a.status === 'COMPLETED').length)}/><Stat icon={<ClipboardCheck/>}
                                                                                              label="Skill coins"
                                                                                              value="Pending rules"/>
        </div>
        <section className="content-card">
            <div className="section-head"><h2>Recent assessments</h2></div>
            {!recent.length ? <div className="empty">No assessments yet.</div> : recent.map((a: any) => <div
                className="table-row" key={a.id}>
                <div><b>{a.skillName}</b><small>{a.subSkillName}</small></div>
                <span
                    className="status">{a.status}</span><strong>{a.weightedPercent != null ? `${a.weightedPercent}%` : 'In progress'}</strong>
            </div>)}</section>
        <section className="content-card"><h2>Digital Skills Wallet</h2><p className="muted">Phase 1 stores assessment
            evidence and scores. Final coin allocation will be added after the stakeholder weighting rules are
            approved.</p></section>
    </div>
}

function Stat({icon, label, value}: { icon: ReactNode, label: string, value: string }) {
    return <div className="stat-card"><span className="stat-icon">{icon}</span>
        <div><small>{label}</small><b>{value}</b></div>
    </div>
}
