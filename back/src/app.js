import 'dotenv/config';
import { pinoLogger } from './utils/logger.js';

import { registerApiRoutes } from './routes/api/index.js';
import { registerSystemRoutes } from './routes/system/index.js';

import {
    checkTypeContentJson,
    checkTypeContentFile,
    checkContentTypePlainText
} from './middleware/contentTypeMiddleware.js';
import cookieParser from 'cookie-parser';

import express from 'express';
import { handleError } from './middleware/errorMiddleware.js';
import { auditWrites } from './middleware/auditMiddleware.js';

export const createApp = ({ isReady = () => true } = {}) => {
    const app = express();
    app.locals.isReady = isReady;

    const apiRoute = '/api';
    const textRoute = '/text';
    const uploadRoute = '/upload';

    app.use(apiRoute, express.json());
    app.use(textRoute, express.text({ type: 'text/plain' }));
    app.use(cookieParser());

    app.use(pinoLogger);
    app.use(auditWrites);

    //middleware
    app.use(apiRoute, checkTypeContentJson);
    app.use(uploadRoute, checkTypeContentFile);
    app.use(textRoute, checkContentTypePlainText);

    registerSystemRoutes(app);
    registerApiRoutes(app, { apiPrefix: apiRoute });

    app.use((_req, res) => res.status(404).json({ message: 'Ruta no encontrada.' }));

    app.use(handleError);

    return app;
};
