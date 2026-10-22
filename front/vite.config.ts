import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'BACKEND_');
    const proxy = {
        // Sólo la API y la acción de cierre de sesión pertenecen a Express.
        '^/(api|cerrar-sesion)(/|$)': {
            target: env.BACKEND_PROXY_TARGET || 'http://127.0.0.1:3000',
            changeOrigin: true,
            ws: true,
        },
    };
    return {
        plugins: [vue()],
        // Prepara también los controles de las rutas diferidas para evitar que
        // Vite recargue la página al descubrirlos durante el primer login.
        optimizeDeps: {
            include: ['@mdi/js', 'vuetify/components/*', 'vuetify/directives/*'],
        },
        resolve: {
            alias: {
                '@nexus/login-validation': fileURLToPath(
                    new URL(
                        '../back/src/public/js/utils/validations/loginValidation.js',
                        import.meta.url,
                    ),
                ),
                '@nexus/form-validation': fileURLToPath(
                    new URL(
                        '../back/src/public/js/utils/validations/validators.js',
                        import.meta.url,
                    ),
                ),
                '@nexus/waste-measurements': fileURLToPath(
                    new URL('../back/src/shared/inventory/wasteMeasurements.js', import.meta.url),
                ),
                '@nexus/catalogs': fileURLToPath(
                    new URL('../back/src/shared/constants/catalogs.js', import.meta.url),
                ),
                '@nexus/permissions': fileURLToPath(
                    new URL('../back/src/shared/constants/permissions.js', import.meta.url),
                ),
                '@nexus/api-messages': fileURLToPath(
                    new URL('../back/src/public/js/constants/apiMessages.js', import.meta.url),
                ),
            },
        },
        server: { host: '0.0.0.0', port: 5173, strictPort: true, proxy },
        preview: { proxy },
    };
});
