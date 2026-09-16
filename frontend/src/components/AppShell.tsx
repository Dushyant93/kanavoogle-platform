import {Link, Outlet, useNavigate} from 'react-router-dom';
import {LogOut, ShieldCheck} from 'lucide-react';
import {useAuth} from '../auth/AuthContext';

export default function AppShell() {
    const {user, logout} = useAuth();
    const n = useNavigate();
    return <>
        <header className="topbar"><Link to="/" className="brand"><span className="brand-mark"><ShieldCheck size={18}/></span>Kanavoogle
            Skills</Link>
            <nav>{user?.role === 'STUDENT' && <><Link to="/student">Dashboard</Link><Link
                to="/student/assessment/new">Assessment</Link></>}{user?.role === 'SCHOOL' &&
                <Link to="/school">School</Link>}{user?.role === 'EMPLOYER' && <Link to="/employer">Employer</Link>}
                <button className="text-button" onClick={async () => {
                    await logout();
                    n('/')
                }}><LogOut size={16}/>Sign out
                </button>
            </nav>
        </header>
        <main className="page-wrap"><Outlet/></main>
    </>
}
