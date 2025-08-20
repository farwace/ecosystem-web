import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'
import legacy from '@vitejs/plugin-legacy'
import {builtinModules} from "node:module";
import { visualizer } from 'rollup-plugin-visualizer'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools({
      launchEditor: "phpstorm"
    }),
    legacy({
      targets: ['defaults', 'Chrome 60'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true,
    }),
    svgLoader(),
    // visualizer({
    //   open: true, // откроет в браузере после сборки
    //   filename: 'dist/stats.html', // путь до отчёта
    //   gzipSize: true,
    //   brotliSize: true
    // })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        //additionalData: `@import "./src/assets/base.scss";`
      }
    }
  },
  build: {
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
          'fsevents'
      ]
    }
  }
})
