import { createApp } from 'vue';
import App from './App.vue';
import StartupErrorPage from './app/pages/StartupErrorPage.vue';
import { createAppRouter } from './app/router/index.js';
import { installUiLibrary } from './app/plugins/uiLibraries.js';
import './style.css';

const bootstrap = async () => {
    const app = createApp(App);
    const router = createAppRouter();
    router.beforeResolve(to => installUiLibrary(app, to.params.library ?? to.meta.uiLibrary));
    app.use(router);
    await router.isReady();
    app.mount('#app');
};

void bootstrap().catch(() => {
    createApp(StartupErrorPage).mount('#app');
});
