<template>
  <LoadingPage
    v-if="applicationState.checking || (applicationState.user?.verified && !applicationState.error && mode !== 'reset')"
  />
  <main v-else class="auth-screen">
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
        <p>{{ applicationState.error || 'Не удалось завершить загрузку приложения.' }}</p>
        <button @click="reload">Повторить</button>
        <button class="secondary" :disabled="busy" @click="signOut">Выйти</button>
      </template>
      <form v-else @submit.prevent="submit">
        <label v-if="mode === 'register'">Имя
          <input v-model="name" autocomplete="nickname" required minlength="2" maxlength="20"/>
        </label>
        <label>Почта
          <input v-model="email" type="email" autocomplete="email" required maxlength="255"/>
        </label>
        <label v-if="mode !== 'forgot'">Пароль
          <span class="password-field">
            <input v-model="password" :type="showPassword ? 'text' : 'password'"
                   :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" required
                   :minlength="mode === 'login' ? 1 : 10" maxlength="72"/>
            <button
              type="button"
              class="password-toggle"
              :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
              :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
              @click="showPassword = !showPassword"
            >
              <UiIcon :name="showPassword ? 'eye-off' : 'eye'" />
            </button>
          </span>
        </label>
        <template v-if="mode === 'register' || mode === 'reset'">
          <p class="hint">Не менее 10 символов, включая буквы и цифры.</p>
          <label>Повторите пароль
            <span class="password-field">
              <input v-model="confirmation" :type="showConfirmation ? 'text' : 'password'"
                     autocomplete="new-password" required minlength="10" maxlength="72"/>
              <button
                type="button"
                class="password-toggle"
                :aria-label="showConfirmation ? 'Скрыть пароль' : 'Показать пароль'"
                :title="showConfirmation ? 'Скрыть пароль' : 'Показать пароль'"
                @click="showConfirmation = !showConfirmation"
              >
                <UiIcon :name="showConfirmation ? 'eye-off' : 'eye'" />
              </button>
            </span>
          </label>
        </template>
        <RecaptchaChallenge
          v-if="captchaRequired"
          ref="fallbackCaptcha"
          @verified="captchaToken = $event"
          @error="error = $event"
        />
        <button :disabled="busy">{{ busy ? 'Подождите…' : buttonTitle }}</button>
        <nav>
          <button v-if="mode !== 'login'" type="button" class="secondary" @click="switchMode('login')">Уже есть аккаунт?
            Войти
          </button>
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
import LoadingPage from '@/components/pages/LoadingPage.vue';
import UiIcon from '@/components/common/icons/UiIcon.vue';
import {getRecaptchaToken} from './recaptcha';
import RecaptchaChallenge from './RecaptchaChallenge.vue';

type Mode = 'login' | 'register' | 'forgot' | 'reset';
const mode = ref<Mode>(passwordResetLink.token ? 'reset' : 'login');
const email = ref(passwordResetLink.email);
const name = ref('');
const password = ref('');
const confirmation = ref('');
const showPassword = ref(false);
const showConfirmation = ref(false);
const busy = ref(false);
const error = ref('');
const captchaRequired = ref(false);
const captchaToken = ref('');
const fallbackCaptcha = ref<{reset: () => void} | null>(null);
const message = ref(new URLSearchParams(location.search).has('verified') ? 'Почта подтверждена. Войдите в аккаунт.' : '');
const title = computed(() => applicationState.user && !applicationState.user.verified && mode.value !== 'reset'
    ? 'Подтвердите почту' : ({
      login: 'Вход',
      register: 'Регистрация',
      forgot: 'Восстановление пароля',
      reset: 'Новый пароль'
    })[mode.value]);
const buttonTitle = computed(() => ({
  login: 'Войти',
  register: 'Зарегистрироваться',
  forgot: 'Отправить письмо',
  reset: 'Сохранить пароль'
})[mode.value]);

function switchMode(next: Mode) {
  mode.value = next;
  error.value = '';
  message.value = '';
  applicationState.error = '';
  password.value = '';
  confirmation.value = '';
  showPassword.value = false;
  showConfirmation.value = false;
  captchaRequired.value = false;
  captchaToken.value = '';
  fallbackCaptcha.value?.reset();
}

const reload = () => location.reload();

async function run(action: () => Promise<void>) {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  applicationState.error = '';
  try {
    await action();
  } catch (e) {
    if (e instanceof Error && e.message.includes('Не удалось подтвердить, что запрос отправлен человеком')) {
      captchaRequired.value = true;
      captchaToken.value = '';
      fallbackCaptcha.value?.reset();
      return;
    }
    error.value = e instanceof Error ? e.message : 'Не удалось выполнить запрос.';
  } finally {
    busy.value = false;
  }
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
  const action = {login: 'login', register: 'register', forgot: 'forgot_password', reset: 'reset_password'}[mode.value];
  if (captchaRequired.value && !captchaToken.value) {
    throw new Error('Пройдите проверку капчи.');
  }
  const recaptchaVersion = captchaRequired.value ? 'v2' : 'v3';
  const recaptchaToken = captchaRequired.value ? captchaToken.value : await getRecaptchaToken(action);
  const data = await webRequest(`/auth/${path}`, {
    method: 'POST', body: JSON.stringify({
      email: email.value, name: name.value, password: password.value,
      password_confirmation: confirmation.value, token: passwordResetLink.token,
      recaptcha_token: recaptchaToken,
      recaptcha_version: recaptchaVersion,
    })
  });
  captchaRequired.value = false;
  captchaToken.value = '';
  password.value = '';
  confirmation.value = '';
  if (mode.value === 'reset') {
    passwordResetLink.token = '';
    const url = new URL(location.href);
    url.searchParams.delete('auth');
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    applicationState.user = null;
    switchMode('login');
    message.value = data.message;
  } else if (mode.value === 'forgot') message.value = data.message;
  else {
    applicationState.user = data.user;
    if (data.user?.verified) {
      const url = new URL(location.href);
      url.searchParams.delete('auth');
      url.searchParams.delete('verified');
      location.replace(url.href);
    }
  }
});
</script>

<style scoped>
.auth-screen {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  background: #fff2e2;
  color: #5c3a22;
  overflow: auto;
}

.auth-card {
  width: min(100%, 420px);
  padding: 28px;
  border-radius: 24px;
  background: #fffaf3;
  box-shadow: 0 8px 32px #70431c18;
}

.brand {
  letter-spacing: .12em;
  font-weight: 800;
  color: #c8662b;
}

h1 {
  font-size: 26px;
  margin: 12px 0 20px;
}

p {
  line-height: 1.5;
  margin: 12px 0;
}

label {
  display: grid;
  gap: 8px;
  margin: 14px 0;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid #c9ae95;
  border-radius: 10px;
  background: white;
  color: #352314;
  font: inherit;
  font-size: 16px;
}

.password-field {
  position: relative;
  display: block;
}

.password-field input {
  padding-right: 48px;
}

button {
  display: block;
  width: 100%;
  padding: 12px;
  margin-top: 14px;
  border: 0;
  border-radius: 12px;
  background: #f49b55;
  color: #352314;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: .6;
  cursor: wait;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 8px;
  width: 32px;
  height: 32px;
  margin: 0;
  padding: 6px;
  transform: translateY(-50%);
  background: transparent;
  color: #8b6952;
  line-height: 0;
}

.password-toggle :deep(svg) {
  width: 20px;
  height: 20px;
}

.secondary {
  background: transparent;
  text-decoration: underline;
}

.hint {
  font-size: 13px;
}

.error {
  color: #a32121;
}

[theme="dark"] {
  .auth-screen {
    background: #141414;
    color: #f0d8bd;
  }

  .auth-card {
    background: #222222;
    box-shadow: 0 8px 32px #00000050;
  }

  .brand {
    color: #e48d58;
  }

  input {
    border-color: #5b4638;
    background: #2d2d2d;
    color: #f5e6d5;
    caret-color: #f49b55;
  }

  .password-toggle {
    color: #d2ad8d;
  }

  input::placeholder {
    color: #a99686;
  }

  button {
    //background: #e48d58;
    color: #24170f;
  }

  .secondary {
    background: transparent;
    color: #f0c39d;
  }

  .error {
    color: #ff8f8f;
  }
}
</style>
