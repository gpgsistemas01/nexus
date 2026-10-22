import { createApp } from 'vue';
import '@fontsource-variable/montserrat/wght.css';
import App from './App.vue';
import StartupErrorPage from './app/pages/StartupErrorPage.vue';
import { createAppRouter } from './app/router/index.js';
import { authSessionKey, createAuthSession } from './modules/auth/session.js';
import './style.css';

const bootstrap = async () => {
    const app = createApp(App);
    const { vuetify } = await import('./app/plugins/vuetify.js');
    app.use(vuetify);
    const session = createAuthSession();
    const router = createAppRouter(undefined, session);
    app.provide(authSessionKey, session);
    app.use(router);
    await router.isReady();
    app.mount('#app');
};

void bootstrap().catch(() => {
    createApp(StartupErrorPage).mount('#app');
});
