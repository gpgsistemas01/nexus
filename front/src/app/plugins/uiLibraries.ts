import type { App } from 'vue';

const installedLibraries = new WeakMap<App, Set<string>>();

// Los documentos del comparador conservan proveedores y estilos aislados.
export const installUiLibrary = async (app: App, library: unknown) => {
    if (library !== 'vuetify' && library !== 'primevue') return;

    const libraries = installedLibraries.get(app) ?? new Set<string>();
    installedLibraries.set(app, libraries);
    if (libraries.has(library)) return;

    if (library === 'vuetify') {
        const { vuetify } = await import('./vuetify.js');
        app.use(vuetify);
    } else {
        const [{ default: PrimeVue }, { default: Aura }] = await Promise.all([
            import('primevue/config'),
            import('@primeuix/themes/aura')
        ]);

        app.use(PrimeVue, {
            theme: {
                preset: Aura,
                options: { darkModeSelector: false }
            }
        });
    }

    libraries.add(library);
};
