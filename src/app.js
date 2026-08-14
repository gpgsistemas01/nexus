import 'dotenv/config.js';
import { getRequestLogContext, logger, pinoLogger } from './utils/logger.js';
import { hasPermission } from './public/js/constants/permissions.js';

import { registerApiRoutes } from './routes/api/index.js';
import { registerWebRoutes } from './routes/web/index.js';

import { checkTypeContentJson, checkTypeContentFile, checkContentTypePlainText } from './middleware/contentTypeMiddleware.js';
import cookieParser from 'cookie-parser';

import express from 'express';
import http from 'node:http';
import expressEjsLayouts from 'express-ejs-layouts';
import { Server } from 'socket.io';
import { publicDir, viewsDir } from './utils/pathsUtils.js';
import { errorMap } from './messages/codeMessages.js';
import { initSocket } from './utils/socketUtils.js';
import { isAppError } from './errors/AppError.js';
import { appConfig } from './config/appConfig.js';
import { getAuthTokenInfo } from './middleware/authMiddleware.js';
import { auditWrites } from './middleware/auditMiddleware.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
initSocket(io);

const rootRoute = '/';
const apiRoute = '/api';
const textRoute = '/text';
const uploadRoute = '/upload';

app.set('views', viewsDir);
app.set('view engine', 'ejs');

app.use(expressEjsLayouts);
app.set('layout', 'layout/base');
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

app.use(rootRoute, express.static(publicDir));

app.use(apiRoute, express.json());
app.use(textRoute, express.text({ type: 'text/plain' }));
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));

app.use(pinoLogger);
app.use(auditWrites);

//middleware
app.use(apiRoute, checkTypeContentJson);
app.use(uploadRoute, checkTypeContentFile);
app.use(textRoute, checkContentTypePlainText);

app.use((req, res, next) => {
    res.locals.appName = appConfig.name;
    res.locals.flash = req.cookies.flash || null;
    res.locals.hasPermission = hasPermission;
    res.clearCookie('flash');
    next();
});

registerWebRoutes(app);
app.get('/error/404', (req, res) => {
    const homeHref = getAuthTokenInfo(req, res) ? '/almacen/materiales' : '/inicio-sesion';

    return res.status(404).render('pages/error/404', { homeHref });
});

registerApiRoutes(app, { apiPrefix: apiRoute });

app.use((req, res, next) => {
    if (req.path.startsWith(apiRoute) || !req.accepts('html')) {
        return res.status(404).json({ message: 'Ruta no encontrada.' });
    }

    const homeHref = getAuthTokenInfo(req, res) ? '/almacen/materiales' : '/inicio-sesion';

    return res.status(404).render('pages/error/404', { homeHref });
});

app.use((err, req, res, next) => {

    if (isAppError(err)) return res.status(err.statusCode).json({
        code: err.code,
        message: err.message,
        meta: err.meta
    });

    logger.error(
        {
            err,
            ...getRequestLogContext(req),
            method: req.method
        },
        'Error no controlado'
    );

    res.status(500).json({
        code: errorMap.message.SERVER_ERROR,
        message: err?.message || 'Error interno del servidor.'
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});

process.on('warning', (warning) => {
    logger.warn({ warning }, 'Warning detectado');
});
