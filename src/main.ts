import '@/assets/main.scss'
import "reflect-metadata";
import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import {AppBuilder} from "@/app-builder.ts";
import * as Sentry from "@sentry/vue";


const $app = createApp(App);
AppBuilder().build($app);
$app.use(router);

$app.mount('#app');

Sentry.init({
    dsn: import.meta.env.VITE_HAWK_TOKEN!,
    app: $app,
    enableLogs: true,
    sendDefaultPii: true,
    integrations: [
        Sentry.browserTracingIntegration({router})
    ]
})