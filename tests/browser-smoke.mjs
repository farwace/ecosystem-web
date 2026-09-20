// Requires a local Vite server on 5174 and a disposable Chrome --remote-debugging-port=9223.
// All API/third-party HTTP requests are intercepted; no real accounts or email are used.
import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:5174';
const target = await (await fetch(`http://127.0.0.1:9223/json/new?about:blank`, {method: 'PUT'})).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let nextId = 0;
const pending = new Map();
let sessionUser = null;
const apiCalls = [];
const runtimeErrors = [];
function send(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
        pending.set(id, {resolve, reject}); socket.send(JSON.stringify({id, method, params}));
    });
}
async function intercept({requestId, request}) {
    const url = new URL(request.url);
    const isApi = url.pathname.includes('/api/web/v1.0');
    if (isApi) {
        apiCalls.push({path: url.pathname, method: request.method, data: request.postData ? JSON.parse(request.postData) : null});
        let data = {}; let code = 200;
        if (request.method === 'OPTIONS') data = {};
        else if (url.pathname.endsWith('/auth/session')) data = {user: sessionUser, csrfToken: 'test-csrf'};
        else if (url.pathname.endsWith('/auth/csrf')) data = {csrfToken: 'test-csrf'};
        else if (url.pathname.endsWith('/auth/register')) {
            sessionUser = {id: 123, email: 'smoke@example.test', verified: false};
            data = {user: sessionUser, csrfToken: 'new-csrf'};
        } else if (url.pathname.endsWith('/auth/login')) {
            data = {user: sessionUser, csrfToken: 'new-csrf'};
        } else if (url.pathname.endsWith('/auth/logout')) sessionUser = null;
        else if (url.pathname.endsWith('/auth/resend-verification')) data = {message: 'Письмо подтверждения отправлено.'};
        else if (url.pathname.endsWith('/auth/forgot-password')) data = {message: 'Если аккаунт существует, письмо для восстановления отправлено.'};
        else if (url.pathname.endsWith('/auth/reset-password')) data = {message: 'Пароль изменён. Войдите с новым паролем.'};
        else if (url.pathname.endsWith('/user/info')) { code = 503; data = {message: 'Smoke test stops at protected API.'}; }
        else throw new Error(`Unexpected API call: ${url.pathname}`);
        await send('Fetch.fulfillRequest', {requestId, responseCode: code,
            responseHeaders: [
                {name: 'Content-Type', value: 'application/json'},
                {name: 'Access-Control-Allow-Origin', value: origin},
                {name: 'Access-Control-Allow-Credentials', value: 'true'},
                {name: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS'},
                {name: 'Access-Control-Allow-Headers', value: 'content-type,x-csrf-token'},
            ], body: Buffer.from(JSON.stringify(data)).toString('base64')});
    } else if (url.origin === origin) await send('Fetch.continueRequest', {requestId});
    else await send('Fetch.failRequest', {requestId, errorReason: 'BlockedByClient'});
}
socket.onmessage = ({data}) => {
    const message = JSON.parse(data);
    if (message.id) {
        const entry = pending.get(message.id); pending.delete(message.id);
        if (message.error) entry?.reject(new Error(JSON.stringify(message.error))); else entry?.resolve(message.result);
    } else if (message.method === 'Fetch.requestPaused') intercept(message.params).catch(error => runtimeErrors.push(error.message));
    else if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text);
};
const evaluate = async expression => {
    const result = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
};
async function until(expression) {
    for (let i = 0; i < 100; i++) {
        if (await evaluate(expression)) return;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Timed out: ${expression}; page: ${await evaluate('document.body.innerText')}`);
}
const click = text => evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === ${JSON.stringify(text)}).click()`);
const fill = (selector, value) => evaluate(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); e.value = ${JSON.stringify(value)}; e.dispatchEvent(new Event('input', {bubbles: true})); })()`);

try {
    await send('Page.enable'); await send('Runtime.enable'); await send('Fetch.enable', {patterns: [{urlPattern: '*'}]});
    await send('Page.navigate', {url: origin + '/games/bunker?room_id=smoke-room'});
    await until(`document.querySelector('h1')?.textContent === 'Вход' && document.querySelector('form')`);
    assert.equal(apiCalls.some(c => c.path.endsWith('/user/info')), false);
    await click('Создать аккаунт');
    await fill('input[autocomplete=nickname]', 'Smoke');
    await fill('input[type=email]', 'smoke@example.test');
    await evaluate(`document.querySelectorAll('input[type=password]').forEach(e => { e.value = 'SmokePassword123'; e.dispatchEvent(new Event('input', {bubbles: true})); })`);
    await evaluate(`document.querySelector('form').requestSubmit()`);
    await until(`document.querySelector('h1')?.textContent === 'Подтвердите почту'`);
    assert.equal(apiCalls.some(c => c.path.endsWith('/user/info')), false);
    assert.match(await evaluate('location.href'), /room_id=smoke-room/);
    await click('Отправить письмо повторно');
    await until(`document.body.innerText.includes('Письмо подтверждения отправлено.')`);
    sessionUser.verified = true;
    await click('Я подтвердил почту');
    await until(`document.body.innerText.includes('Не удалось завершить загрузку приложения.')`);
    assert.ok(apiCalls.some(c => c.path.endsWith('/user/info')));
    assert.match(await evaluate('location.href'), /room_id=smoke-room/);
    await click('Выйти');
    await until(`document.querySelector('h1')?.textContent === 'Вход' && document.querySelector('form')`);
    await click('Забыли пароль?'); await fill('input[type=email]', 'smoke@example.test');
    await evaluate(`document.querySelector('form').requestSubmit()`);
    await until(`document.body.innerText.includes('Если аккаунт существует')`);
    await send('Page.navigate', {url: origin + '/?auth=reset#token=smoke-token&email=smoke%40example.test'});
    await until(`document.querySelector('h1')?.textContent === 'Новый пароль' && !document.body.innerText.includes('Проверяем вход')`);
    assert.equal(await evaluate('location.hash'), '');
    await evaluate(`document.querySelectorAll('input[type=password]').forEach(e => { e.value = 'NewPassword123'; e.dispatchEvent(new Event('input', {bubbles: true})); })`);
    await evaluate(`document.querySelector('form').requestSubmit()`);
    await until(`document.body.innerText.includes('Пароль изменён.')`);
    assert.equal(apiCalls.find(c => c.path.endsWith('/auth/reset-password') && c.method === 'POST')?.data.token, 'smoke-token');
    assert.deepEqual(runtimeErrors, []);
    console.log('Browser smoke passed: guest gate, registration, verification, invitation return, logout, recovery, reset. API mocked.');
} finally {
    socket.close();
    await fetch(`http://127.0.0.1:9223/json/close/${target.id}`);
}
