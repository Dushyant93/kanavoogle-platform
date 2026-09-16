import {BarChart3, Building2, ClipboardList} from 'lucide-react';
import {useAuth} from '../auth/AuthContext';
import { useEffect, useState, type ReactNode } from 'react';

export default function SchoolDashboard() {
    const {user} = useAuth();
    return <div>
        <div className="page-heading">
            <div><span className="eyebrow">SCHOOL WORKSPACE</span><h1>{user?.schoolProfile?.schoolName}</h1>
                <p>Verification: <b>{user?.verificationStatus}</b></p></div>
        </div>
        <div className="feature-grid"><F icon={<Building2/>} title="Student management"
                                         text="Foundation for authorised student relationships."/><F icon={<BarChart3/>}
                                                                                                     title="Dashboards & visualisations"
                                                                                                     text="Phase 2: progress trends, cohort views and skill-gap analytics."/><F
            icon={<ClipboardList/>} title="Assessment assignment"
            text="Phase 2: assign assessments and monitor completion."/></div>
    </div>
}

function F({icon, title, text}: { icon: ReactNode, title: string, text: string }) {
    return <div className="feature-card"><span>{icon}</span><h3>{title}</h3><p>{text}</p></div>
}
