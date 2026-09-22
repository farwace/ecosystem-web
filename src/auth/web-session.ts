import {reactive} from 'vue';

type SessionUser = {id: number; email: string; verified: boolean};
export const applicationState = reactive({ready: false, checking: true, error: '', user: null as SessionUser | null});
const base = `${import.meta.env.VITE_API_ENDPOINT.replace(/\/$/, '')}/api/web/v1.0`;
let csrfToken = '';
// Keep reset credentials in memory and remove them before analytics/route navigation.
const initialUrl = new URL(location.href);
const resetParams = new URLSearchParams(initialUrl.hash.slice(1));
export const passwordResetLink = {
    token: initialUrl.searchParams.get('auth') === 'reset' ? resetParams.get('token') || '' : '',
    email: initialUrl.searchParams.get('auth') === 'reset' ? resetParams.get('email') || '' : '',
};
if (passwordResetLink.token) {
    initialUrl.hash = '';
    history.replaceState(history.state, '', initialUrl.pathname + initialUrl.search + initialUrl.hash);
}

export const webApiUrl = (path = '') => `${base}${path}`;

export async function webRequest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const method = options.method || 'GET';
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase()) && !csrfToken) {
        const res = await fetch(webApiUrl('/auth/csrf'), {credentials: 'include', headers: {Accept: 'application/json'}, cache: 'no-store'});
        if (!res.ok) throw new Error('Не удалось установить защищённое соединение.');
        csrfToken = (await res.json()).csrfToken;
    }
    const res = await fetch(path.startsWith(base) ? path : webApiUrl(path), {
        ...options, credentials: 'include', cache: 'no-store',
        headers: {...options.headers, Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken},
    });
    const data = await res.json().catch(() => ({}));
    if (data.csrfToken) csrfToken = data.csrfToken;
    if (!res.ok) {
        if ([401, 419].includes(res.status)) {
            csrfToken = '';
            applicationState.ready = false;
            applicationState.user = null;
            window.dispatchEvent(new Event('web-session-ended'));
        }
        const messages = Object.values(data.errors || {}).flat();
        throw new Error(messages.join(' ') || data.message || `Ошибка запроса (${res.status}).`);
    }
    return data as T;
}

export async function loadWebSession() {
    const data = await webRequest<{user: SessionUser | null}>('/auth/session');
    applicationState.user = data.user;
    return data.user;
}

export const requestConnectionTicket = async (purpose: 'game' | 'reverb') => {
    const data = await webRequest<{ticket: string}>('/auth/ticket', {method: 'POST', body: JSON.stringify({purpose})});
    return data.ticket;
};

export async function logoutWeb() {
    await webRequest('/auth/logout', {method: 'POST'});
    window.location.reload();
}
