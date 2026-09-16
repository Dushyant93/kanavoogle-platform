import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {'X-Requested-With': 'XMLHttpRequest'}
});

export function errorMessage(e: unknown) {
    return axios.isAxiosError(e) ? (e.response?.data?.message || 'Request failed') : 'Something went wrong'
}
