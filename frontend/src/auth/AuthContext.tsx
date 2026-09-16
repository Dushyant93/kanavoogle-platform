import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import {api} from '../api';
import type {User} from '../types';

type V = {
    user: User | null,
    loading: boolean,
    refresh: () => Promise<void>,
    login: (e: string, p: string) => Promise<User>,
    logout: () => Promise<void>
};
const C = createContext<V | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const refresh = async () => {
        try {
            setUser((await api.get<User>('/auth/me')).data)
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    };
    useEffect(() => {
        refresh()
    }, []);
    const login = async (email: string, password: string) => {
        const u = (await api.post<User>('/auth/login', {email, password})).data;
        setUser(u);
        return u
    };
    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null)
    };
    return <C.Provider
        value={useMemo(() => ({user, loading, refresh, login, logout}), [user, loading])}>{children}</C.Provider>
}

export function useAuth() {
    const v = useContext(C);
    if (!v) throw new Error('AuthProvider missing');
    return v
}
