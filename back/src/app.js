import 'dotenv/config';
import { getRequestLogContext, logger, pinoLogger } from './utils/logger.js';

import { registerApiRoutes } from './routes/api/index.js';
import { registerSystemRoutes } from './routes/system/index.js';

import {
    checkTypeContentJson,
    checkTypeContentFile,
    checkContentTypePlainText
} from './middleware/contentTypeMiddleware.js';
import cookieParser from 'cookie-parser';

import express from 'express';
import { errorMap } from './messages/codeMessages.js';
import { isAppError } from './errors/AppError.js';
import { normalizeDatabaseError } from './errors/databaseError.js';
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

    app.use((err, req, res, next) => {

        if (res.headersSent || res.destroyed) {
            logger.error({ err, ...getRequestLogContext(req) }, 'La respuesta se interrumpió');
            return next(err);
        }

        const responseError = isAppError(err) ? err : normalizeDatabaseError(err);

        if (isAppError(responseError)) {
            if (responseError !== err) logger.error(
                {
                    err,
                    ...getRequestLogContext(req),
                    method: req.method,
                    code: responseError.code
                },
                'Esquema de base de datos desactualizado'
            );

            return res.status(responseError.statusCode).json({
                code: responseError.code,
                message: responseError.message,
                meta: responseError.meta
            });
        }

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
            message: 'Error interno del servidor.'
        });
    });

    return app;
};
