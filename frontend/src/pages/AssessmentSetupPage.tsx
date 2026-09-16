import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {api, errorMessage} from '../api';
import {useAuth} from '../auth/AuthContext';
import type {Skill} from '../types';

export default function AssessmentSetupPage() {
    const {user} = useAuth();
    const [skills, setSkills] = useState<Skill[]>([]), [skillId, setSkillId] = useState(''), [subSkillId, setSubSkillId] = useState(''), [context, setContext] = useState('General'), [complexity, setComplexity] = useState('FOUNDATION'), [count, setCount] = useState(5), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const nav = useNavigate();
    useEffect(() => {
        api.get<Skill[]>('/skills').then(r => setSkills(r.data))
    }, []);
    const skill = useMemo(() => skills.find(s => s.id === skillId), [skills, skillId]);
    useEffect(() => setSubSkillId(''), [skillId]);
    return <div className="narrow-page">
        <div className="page-heading">
            <div><span className="eyebrow">NEW ASSESSMENT</span><h1>Configure your assessment</h1>
                <p>Age {user?.studentProfile?.age} · Year {user?.studentProfile?.yearLevel}</p></div>
        </div>
        <form className="content-card form-stack" onSubmit={async e => {
            e.preventDefault();
            setBusy(true);
            try {
                const d = (await api.post('/assessments', {
                    skillId,
                    subSkillId,
                    context,
                    complexity,
                    questionCount: count
                })).data;
                nav(`/student/assessment/${d.id}`)
            } catch (x) {
                setError(errorMessage(x))
            } finally {
                setBusy(false)
            }
        }}>{error && <div className="alert error">{error}</div>}<label>Skill<select required value={skillId}
                                                                                    onChange={e => setSkillId(e.target.value)}>
            <option value="">Select a skill</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Sub-skill<select
            required disabled={!skill} value={subSkillId} onChange={e => setSubSkillId(e.target.value)}>
            <option value="">Select a sub-skill</option>
            {skill?.subSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Subject
            / context<input maxLength={80} value={context} onChange={e => setContext(e.target.value)}
                            placeholder="Science, English, Java, General..."/></label>
            <div className="form-row"><label>Complexity<select value={complexity}
                                                               onChange={e => setComplexity(e.target.value)}>
                <option value="FOUNDATION">Foundation</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
            </select></label><label>Question count<select value={count}
                                                          onChange={e => setCount(Number(e.target.value))}>{[3, 5, 7, 10].map(n =>
                <option key={n}>{n}</option>)}</select></label></div>
            <div className="notice">Skills and sub-skills are loaded from MongoDB and cached by the backend. If approved
                bank questions are insufficient and LLM integration is enabled, missing questions are generated
                server-side and validated before delivery.
            </div>
            <button className="button full"
                    disabled={busy || !skillId || !subSkillId}>{busy ? 'Preparing...' : 'Start assessment'}</button>
        </form>
    </div>
}
