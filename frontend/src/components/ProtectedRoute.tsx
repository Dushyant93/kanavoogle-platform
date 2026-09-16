import type {ReactNode} from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import type {Role} from '../types';

export default function ProtectedRoute({roles, children}: { roles: Role[], children: ReactNode }) {
    const {user, loading} = useAuth();
    if (loading) return <div className="center-state">Loading...</div>;
    if (!user) return <Navigate to="/login"/>;
    if (!roles.includes(user.role)) return <Navigate to={`/${user.role.toLowerCase()}`}/>;
    return <>{children}</>
}
