import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {api, errorMessage} from '../api';
import type {Assessment} from '../types';

export default function AssessmentRunPage() {
    const {id} = useParams();
    const [data, setData] = useState<Assessment | null>(null), [index, setIndex] = useState(0), [responses, setResponses] = useState<Record<string, string>>({}), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const nav = useNavigate();
    useEffect(() => {
        api.get<Assessment>(`/assessments/${id}`).then(r => setData(r.data)).catch(x => setError(errorMessage(x)))
    }, [id]);
    if (error) return <div className="alert error">{error}</div>;
    if (!data) return <div className="center-state">Loading assessment...</div>;
    const q = data.questions[index], ans = responses[q.questionId] || '', last = index === data.questions.length - 1;
    return <div className="assessment-layout">
        <aside className="assessment-meta">
            <span>{data.skillName}</span><strong>{data.subSkillName}</strong><small>{data.context} · {data.complexity}</small>
            <div className="progress"><i style={{width: `${((index + 1) / data.questions.length) * 100}%`}}/></div>
            <small>Question {index + 1} of {data.questions.length}</small></aside>
        <section className="question-card"><h2>{q.prompt}</h2>{q.type === 'SHORT_TEXT' ? <textarea rows={5} value={ans}
                                                                                                   onChange={e => setResponses({
                                                                                                       ...responses,
                                                                                                       [q.questionId]: e.target.value
                                                                                                   })}/> :
            <div className="options">{q.options.map(o => <label className={`option ${ans === o ? 'selected' : ''}`}
                                                                key={o}><input type="radio" checked={ans === o}
                                                                               onChange={() => setResponses({
                                                                                   ...responses,
                                                                                   [q.questionId]: o
                                                                               })}/>{o}</label>)}</div>}
            <div className="question-actions">
                <button className="secondary-button" disabled={index === 0}
                        onClick={() => setIndex(i => i - 1)}>Previous
                </button>
                {!last ? <button className="button" disabled={!ans} onClick={() => setIndex(i => i + 1)}>Next</button> :
                    <button className="button" disabled={!ans || busy} onClick={async () => {
                        setBusy(true);
                        try {
                            const r = (await api.post(`/assessments/${id}/submit`, {responses})).data;
                            sessionStorage.setItem(`result:${id}`, JSON.stringify(r));
                            nav(`/student/assessment/${id}/result`)
                        } catch (x) {
                            setError(errorMessage(x));
                            setBusy(false)
                        }
                    }}>{busy ? 'Submitting...' : 'Submit assessment'}</button>}</div>
        </section>
    </div>
}
