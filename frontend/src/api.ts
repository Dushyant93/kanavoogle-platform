import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {'X-Requested-With': 'XMLHttpRequest'}
});

export function errorMessage(e: unknown) {
    return axios.isAxiosError(e) ? (e.response?.data?.message || 'Request failed') : 'Something went wrong'
}

export function humanize(code?: string | null) {
    if (!code) return '';
    const s = code.toLowerCase().replace(/_/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDate(iso?: string | null) {
    return iso ? new Date(iso).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'}) : '—';
}
