import {BadgeCheck, Search, SlidersHorizontal} from 'lucide-react';
import {useAuth} from '../auth/AuthContext';
import { useEffect, useState, type ReactNode } from 'react'

export default function EmployerDashboard() {
    const {user} = useAuth();
    return <div>
        <div className="page-heading">
            <div><span className="eyebrow">EMPLOYER WORKSPACE</span><h1>{user?.employerProfile?.businessName}</h1>
                <p>Verification: <b>{user?.verificationStatus}</b></p></div>
        </div>
        <div className="feature-grid"><F icon={<Search/>} title="Skill discovery"
                                         text="Phase 2: consent-aware search by demonstrated skills."/><F
            icon={<SlidersHorizontal/>} title="Filtering & insights"
            text="Phase 2: filters and visual insights without unnecessary personal data."/><F icon={<BadgeCheck/>}
                                                                                               title="Credential verification"
                                                                                               text="Designed to connect to the Hyperledger proof layer."/>
        </div>
    </div>
}

function F({icon, title, text}: { icon: ReactNode, title: string, text: string }) {
    return <div className="feature-card"><span>{icon}</span><h3>{title}</h3><p>{text}</p></div>
}
