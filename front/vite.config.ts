import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'BACKEND_');
    const proxy = {
        // Las pantallas EJS conservan sus rutas y recursos hasta su migración.
        '^/(api|compras|salidas|usuarios-sistemas|personas|clientes|proveedores|movimientos|catalogos|revocar-sesion|cerrar-sesion|error|css|js|img|shared|socket\\.io)(/|$)': {
            target: env.BACKEND_PROXY_TARGET || 'http://127.0.0.1:3000',
            changeOrigin: true,
            ws: true,
        },
    };
    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@nexus/login-validation': fileURLToPath(new URL('../back/src/public/js/utils/validations/loginValidation.js', import.meta.url)),
                '@nexus/warehouse-validation': fileURLToPath(new URL('../back/src/public/js/utils/validations/validators.js', import.meta.url)),
                '@nexus/waste-measurements': fileURLToPath(new URL('../back/src/shared/inventory/wasteMeasurements.js', import.meta.url)),
                '@nexus/permissions': fileURLToPath(new URL('../back/src/shared/constants/permissions.js', import.meta.url)),
                '@nexus/api-messages': fileURLToPath(new URL('../back/src/public/js/constants/apiMessages.js', import.meta.url)),
            },
        },
        server: { host: '0.0.0.0', port: 5173, strictPort: true, proxy },
        preview: { proxy },
    };
});
