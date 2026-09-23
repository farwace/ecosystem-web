const scriptUrl = 'https://www.google.com/recaptcha/api.js?render=';

type Recaptcha = {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: {action: string}) => Promise<string>;
    render?: (container: HTMLElement, parameters: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        'error-callback': () => void;
    }) => number;
    reset?: (widgetId?: number) => void;
};

declare global {
    interface Window {
        grecaptcha?: Recaptcha;
    }
}

let scriptPromise: Promise<Recaptcha> | null = null;
let fallbackScriptPromise: Promise<Recaptcha> | null = null;

function loadRecaptcha(siteKey: string): Promise<Recaptcha> {
    if (window.grecaptcha) return Promise.resolve(window.grecaptcha);
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptUrl + encodeURIComponent(siteKey);
        script.async = true;
        script.defer = true;
        script.onload = () => window.grecaptcha
            ? resolve(window.grecaptcha)
            : reject(new Error('Не удалось загрузить reCAPTCHA.'));
        script.onerror = () => reject(new Error('Не удалось загрузить reCAPTCHA.'));
        document.head.appendChild(script);
    });

    return scriptPromise;
}

export async function getRecaptchaToken(action: string): Promise<string> {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey || siteKey === 'MY_SITE_KEY') return '';

    const recaptcha = await loadRecaptcha(siteKey);
    return new Promise((resolve, reject) => {
        recaptcha.ready(() => {
            recaptcha.execute(siteKey, {action}).then(resolve).catch(reject);
        });
    });
}

function loadFallbackRecaptcha(): Promise<Recaptcha> {
    if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
    if (fallbackScriptPromise) return fallbackScriptPromise;

    fallbackScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => window.grecaptcha?.render
            ? resolve(window.grecaptcha)
            : reject(new Error('Не удалось загрузить резервную капчу.'));
        script.onerror = () => reject(new Error('Не удалось загрузить резервную капчу.'));
        document.head.appendChild(script);
    });

    return fallbackScriptPromise;
}

export type RecaptchaWidget = {
    reset: () => void;
};

export async function renderFallbackRecaptcha(
    container: HTMLElement,
    onToken: (token: string) => void,
    onError: () => void,
): Promise<RecaptchaWidget> {
    const siteKey = import.meta.env.VITE_RECAPTCHA_FALLBACK_SITE_KEY;
    if (!siteKey || siteKey === 'MY_FALLBACK_SITE_KEY') {
        throw new Error('Резервная капча не настроена.');
    }

    const recaptcha = await loadFallbackRecaptcha();
    return new Promise((resolve, reject) => {
        recaptcha.ready(() => {
            try {
                const widgetId = recaptcha.render!(container, {
                    sitekey: siteKey,
                    callback: onToken,
                    'expired-callback': () => onToken(''),
                    'error-callback': onError,
                });
                resolve({reset: () => recaptcha.reset?.(widgetId)});
            } catch (error) {
                reject(error);
            }
        });
    });
}
