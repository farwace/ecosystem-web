import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from "@/layouts/MainLayout/MainLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
      {
        path: '/',
        component: () => import('../layouts/MainLayout/MainLayout.vue'),
        children: [{name: 'home', path: '', component: () => import('../pages/Home/HomePage.vue') }],
      },
      {
        path: '/about',
        name: 'about',
        // route level code-splitting
        // this generates a separate chunk (About.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('../pages/AboutView.vue'),
      },
    {
      path: '/:catchAll(.*)*',
      component: () => import('../pages/ErrorNotFound.vue'),
    }
  ],
})

export default router
