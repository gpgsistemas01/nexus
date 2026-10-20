import { createRouter, createWebHistory } from 'vue-router';
import type { RouterHistory } from 'vue-router';

export const createAppRouter = (history: RouterHistory = createWebHistory(import.meta.env.BASE_URL)) => createRouter({
  history,
  routes: [
    { path: '/', redirect: { name: 'comparison' } },
    {
      path: '/inicio',
      name: 'comparison',
      component: () => import('../../modules/uiComparison/pages/UiComparisonPage.vue'),
    },
    {
      path: '/comparar/login/:library(mdb|vuetify|primevue)',
      name: 'login-preview',
      props: true,
      component: () => import('../../modules/uiComparison/pages/LoginPreviewPage.vue'),
    },
    {
      path: '/ejemplo',
      name: 'welcome',
      component: () => import('../../modules/welcome/pages/WelcomePage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../pages/NotFoundPage.vue'),
    },
  ],
});
