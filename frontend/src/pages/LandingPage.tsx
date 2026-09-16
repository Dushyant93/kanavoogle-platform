import {ArrowRight, Building2, GraduationCap, ShieldCheck, UserRoundSearch} from 'lucide-react';
import {Link} from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react'

export default function LandingPage() {
    return <div className="marketing">
        <header className="marketing-header">
            <div className="brand"><span className="brand-mark"><ShieldCheck size={18}/></span>Kanavoogle Skills</div>
            <div><Link className="link-button" to="/login">Sign in</Link><Link className="button" to="/register">Create
                account</Link></div>
        </header>
        <section className="hero">
            <div><span className="eyebrow">AUTHENTIC SKILLS EVIDENCE</span><h1>Assess skills. Build evidence. Share
                outcomes with confidence.</h1><p>A structured platform for students, schools and employers, extending
                digital assessment with controlled AI, explainable scoring and trusted verification.</p>
                <div className="hero-actions"><Link className="button large" to="/register">Get started <ArrowRight
                    size={18}/></Link><Link className="secondary-button large" to="/login">Sign in</Link></div>
            </div>
            <div className="hero-panel">
                <div className="metric-card"><span>7</span><small>Skill families</small></div>
                <div className="metric-card"><span>52</span><small>Sub-skills</small></div>
                <div className="process-card"><b>Assessment journey</b>
                    <div>Profile</div>
                    <div>Skill & sub-skill</div>
                    <div>Context & complexity</div>
                    <div>Validated questions</div>
                    <div>Result & skill evidence</div>
                </div>
            </div>
        </section>
        <section className="role-grid"><Card icon={<GraduationCap/>} title="Students"
                                             text="Complete age-appropriate assessments and build a persistent skill profile."/><Card
            icon={<Building2/>} title="Schools"
            text="Role-specific onboarding now, with cohort analytics and dashboards planned next."/><Card
            icon={<UserRoundSearch/>} title="Employers"
            text="Role-specific onboarding now, with consent-aware skill discovery planned next."/></section>
    </div>
}

function Card({icon, title, text}: { icon: ReactNode, title: string, text: string }) {
    return <article className="role-card">
        <div className="role-icon">{icon}</div>
        <h3>{title}</h3><p>{text}</p></article>
}
