import { createApp } from 'vue';
import App from './App.vue';
import { createAppRouter } from './app/router/index.js';
import { installPreviewLibrary } from './app/plugins/previewLibraries.js';
import './style.css';

const bootstrap = async () => {
  const app = createApp(App);
  const router = createAppRouter();
  app.use(router);
  await router.isReady();
  await installPreviewLibrary(app, router.currentRoute.value.params.library);
  app.mount('#app');
};

void bootstrap();
