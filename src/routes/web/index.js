import homeWebRoutes from './homeWebRoute.js';
import loginWebRoutes from './auth/loginWebRoute.js';
import refreshWebRoutes from './auth/refreshWebRoute.js';
import logoutWebRoutes from './auth/logoutWebRoute.js';
import materialWebRoutes from './warehouse/materialWebRoute.js';
import wasteWebRoutes from './warehouse/wasteWebRoute.js';
import goodsReceiptWebRoutes from './warehouse/goodsReceiptWebRoute.js';
import goodsIssueWebRoutes from './warehouse/goodsIssueWebRoute.js';
import wasteIssueWebRoutes from './warehouse/wasteIssueWebRoute.js';
import userWebRoutes from './admin/userWebRoute.js';
import personWebRoutes from './admin/personWebRoute.js';
import clientWebRoutes from './sales/clientWebRoute.js';
import supplierWebRoutes from './warehouse/supplierWebRoute.js';
import movementWebRoutes from './admin/movementWebRoute.js';

const WEB_ROUTES = [
    ['/', homeWebRoutes],
    ['/inicio-sesion', loginWebRoutes],
    ['/revocar-sesion', refreshWebRoutes],
    ['/cerrar-sesion', logoutWebRoutes],
    ['/almacen/materiales', materialWebRoutes],
    ['/almacen/mermas', wasteWebRoutes],
    ['/compras', goodsReceiptWebRoutes],
    ['/salidas/materiales', goodsIssueWebRoutes],
    ['/salidas/mermas', wasteIssueWebRoutes],
    ['/usuarios-sistemas', userWebRoutes],
    ['/personas', personWebRoutes],
    ['/clientes', clientWebRoutes],
    ['/proveedores', supplierWebRoutes],
    ['/movimientos', movementWebRoutes]
];

const WEB_REDIRECTS = [
    ['/materiales', '/almacen/materiales'],
    ['/mermas', '/almacen/mermas'],
    ['/salidas-materiales', '/salidas/materiales'],
    ['/salidas-mermas', '/salidas/mermas'],
    ['/perfiles', '/personas']
];

export const registerWebRoutes = (app) => {
    WEB_REDIRECTS.forEach(([path, destination]) => {
        app.get(path, (req, res) => res.redirect(308, destination));
    });
    WEB_ROUTES.forEach(([path, router]) => app.use(path, router));
};
