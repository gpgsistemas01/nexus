import type { App } from 'vue';

// Cada variante se abre en su propio documento para aislar estilos y proveedores.
export const installPreviewLibrary = async (app: App, library: unknown) => {
  if (library === 'vuetify') {
    const { vuetify } = await import('./vuetifyPreview.js');
    app.use(vuetify);
  } else if (library === 'primevue') {
    const [{ default: PrimeVue }, { default: Aura }] = await Promise.all([
      import('primevue/config'), import('@primeuix/themes/aura'),
    ]);
    app.use(PrimeVue, { theme: { preset: Aura, options: { darkModeSelector: false } } });
  }
};
