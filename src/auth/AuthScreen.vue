<template>
  <main class="auth-screen">
    <section class="auth-card" aria-labelledby="auth-title">
      <p class="brand">LAPA PLAY</p>
      <h1 id="auth-title">{{ title }}</h1>
      <p v-if="applicationState.checking">Проверяем вход…</p>
      <template v-else-if="applicationState.user && !applicationState.user.verified && mode !== 'reset'">
        <p>Отправили ссылку на {{ applicationState.user.email }}. Подтвердите почту, чтобы начать играть.</p>
        <button :disabled="busy" @click="checkVerification">Я подтвердил почту</button>
        <button class="secondary" :disabled="busy" @click="resend">Отправить письмо повторно</button>
        <button class="secondary" :disabled="busy" @click="signOut">Выйти</button>
      </template>
      <template v-else-if="applicationState.user?.verified && mode !== 'reset'">
        <p>Не удалось завершить загрузку приложения.</p>
        <button @click="reload">Повторить</button>
        <button class="secondary" :disabled="busy" @click="signOut">Выйти</button>
      </template>
      <form v-else @submit.prevent="submit">
        <label v-if="mode === 'register'">Имя
          <input v-model="name" autocomplete="nickname" required minlength="2" maxlength="20" />
        </label>
        <label>Почта
          <input v-model="email" type="email" autocomplete="email" required maxlength="255" />
        </label>
        <label v-if="mode !== 'forgot'">Пароль
          <input v-model="password" type="password" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" required :minlength="mode === 'login' ? 1 : 10" maxlength="72" />
        </label>
        <template v-if="mode === 'register' || mode === 'reset'">
          <p class="hint">Не менее 10 символов, включая буквы и цифры.</p>
          <label>Повторите пароль
            <input v-model="confirmation" type="password" autocomplete="new-password" required minlength="10" maxlength="72" />
          </label>
        </template>
        <button :disabled="busy">{{ busy ? 'Подождите…' : buttonTitle }}</button>
        <nav>
          <button v-if="mode !== 'login'" type="button" class="secondary" @click="switchMode('login')">Уже есть аккаунт? Войти</button>
          <template v-else>
            <button type="button" class="secondary" @click="switchMode('register')">Создать аккаунт</button>
            <button type="button" class="secondary" @click="switchMode('forgot')">Забыли пароль?</button>
          </template>
        </nav>
      </form>
      <p v-if="error || applicationState.error" role="alert" class="error">{{ error || applicationState.error }}</p>
      <p v-if="message" role="status">{{ message }}</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {applicationState, loadWebSession, logoutWeb, webRequest, passwordResetLink} from './web-session';

type Mode = 'login' | 'register' | 'forgot' | 'reset';
const mode = ref<Mode>(passwordResetLink.token ? 'reset' : 'login');
const email = ref(passwordResetLink.email);
const name = ref('');
const password = ref('');
const confirmation = ref('');
const busy = ref(false);
const error = ref('');
const message = ref(new URLSearchParams(location.search).has('verified') ? 'Почта подтверждена. Войдите в аккаунт.' : '');
const title = computed(() => applicationState.user && !applicationState.user.verified && mode.value !== 'reset'
    ? 'Подтвердите почту' : ({login: 'Вход', register: 'Регистрация', forgot: 'Восстановление пароля', reset: 'Новый пароль'})[mode.value]);
const buttonTitle = computed(() => ({login: 'Войти', register: 'Зарегистрироваться', forgot: 'Отправить письмо', reset: 'Сохранить пароль'})[mode.value]);

function switchMode(next: Mode) {
    mode.value = next; error.value = ''; message.value = ''; applicationState.error = '';
    password.value = ''; confirmation.value = '';
}
const reload = () => location.reload();
async function run(action: () => Promise<void>) {
    if (busy.value) return;
    busy.value = true; error.value = ''; applicationState.error = '';
    try { await action(); }
    catch (e) { error.value = e instanceof Error ? e.message : 'Не удалось выполнить запрос.'; }
    finally { busy.value = false; }
}
const signOut = () => run(logoutWeb);
const resend = () => run(async () => {
    const data = await webRequest('/auth/resend-verification', {method: 'POST'});
    message.value = data.message;
});
const checkVerification = () => run(async () => {
    const user = await loadWebSession();
    if (user?.verified) reload();
    else message.value = 'Почта ещё не подтверждена. Перейдите по ссылке из письма.';
});
const submit = () => run(async () => {
    if (['register', 'reset'].includes(mode.value) && password.value !== confirmation.value) {
        throw new Error('Пароли не совпадают.');
    }
    const path = {login: 'login', register: 'register', forgot: 'forgot-password', reset: 'reset-password'}[mode.value];
    const data = await webRequest(`/auth/${path}`, {method: 'POST', body: JSON.stringify({
        email: email.value, name: name.value, password: password.value,
        password_confirmation: confirmation.value, token: passwordResetLink.token,
    })});
    password.value = ''; confirmation.value = '';
    if (mode.value === 'reset') {
        passwordResetLink.token = '';
        const url = new URL(location.href); url.searchParams.delete('auth');
        history.replaceState(history.state, '', url.pathname + url.search + url.hash);
        applicationState.user = null;
        switchMode('login'); message.value = data.message;
    } else if (mode.value === 'forgot') message.value = data.message;
    else {
        applicationState.user = data.user;
        if (data.user?.verified) {
            const url = new URL(location.href); url.searchParams.delete('auth'); url.searchParams.delete('verified');
            location.replace(url.href);
        }
    }
});
</script>

<style scoped>
.auth-screen { min-height: 100dvh; display: grid; place-items: center; padding: 24px 16px; background: #fff2e2; color: #5c3a22; overflow: auto; }
.auth-card { width: min(100%, 420px); padding: 28px; border-radius: 24px; background: #fffaf3; box-shadow: 0 8px 32px #70431c18; }
.brand { letter-spacing: .12em; font-weight: 800; color: #c8662b; }
h1 { font-size: 26px; margin: 12px 0 20px; }
p { line-height: 1.5; margin: 12px 0; }
label { display: grid; gap: 8px; margin: 14px 0; }
input { width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid #c9ae95; border-radius: 10px; background: white; color: #352314; font: inherit; font-size: 16px; }
button { display: block; width: 100%; padding: 12px; margin-top: 14px; border: 0; border-radius: 12px; background: #f49b55; color: #352314; font: inherit; font-weight: 600; cursor: pointer; }
button:disabled { opacity: .6; cursor: wait; }
.secondary { background: transparent; text-decoration: underline; }
.hint { font-size: 13px; }
.error { color: #a32121; }
</style>
