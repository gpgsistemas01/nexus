import healthRoutes from './healthRoute.js';
import apiDocsRoutes from './apiDocsRoute.js';
import logoutRoutes from './logoutRoute.js';

const SYSTEM_ROUTES = [
    ['/health', healthRoutes],
    ['/api-docs', apiDocsRoutes],
    ['/cerrar-sesion', logoutRoutes]
];

export const registerSystemRoutes = app => {
    SYSTEM_ROUTES.forEach(([path, router]) => app.use(path, router));
};
