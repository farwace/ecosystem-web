import '@/assets/main.scss'
import "reflect-metadata";
import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import {AppBuilder} from "@/app-builder.ts";

const $app = createApp(App);
AppBuilder().build($app);
$app.use(router);

$app.mount('#app');
