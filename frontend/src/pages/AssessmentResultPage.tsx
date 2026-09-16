import {CheckCircle2} from 'lucide-react';
import {Link, useParams} from 'react-router-dom';

export default function AssessmentResultPage() {
    const {id} = useParams();
    const raw = sessionStorage.getItem(`result:${id}`);
    const r = raw ? JSON.parse(raw) : null;
    if (!r) return <div className="content-card"><h2>Result saved</h2><p>Return to your dashboard to view the recorded
        assessment.</p><Link className="button" to="/student">Dashboard</Link></div>;
    const a = r.assessment;
    return <div className="narrow-page">
        <div className="result-hero"><CheckCircle2 size={42}/><span className="eyebrow">ASSESSMENT COMPLETE</span>
            <h1>{a.skillName}</h1><p>{a.subSkillName}</p><strong>{a.weightedPercent}%</strong><small>Weighted evidence
                score</small></div>
        <div className="content-card"><p>You answered {r.correctAnswers} of {r.totalQuestions} questions correctly. Coin
            allocation remains pending until the stakeholder weighting and coin rules are finalised.</p>
            <div className="form-actions"><Link className="secondary-button" to="/student">Dashboard</Link><Link
                className="button" to="/student/assessment/new">Take another</Link></div>
        </div>
    </div>
}
