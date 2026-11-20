import { isAppError } from '../errors/AppError.js';
import { normalizeDatabaseError } from '../errors/databaseError.js';
import { errorMap } from '../messages/codeMessages.js';
import { getRequestLogContext, logger } from '../utils/logger.js';

export const handleError = (err, req, res, next) => {

    if (res.headersSent || res.destroyed) {
        logger.error({ err, ...getRequestLogContext(req) }, 'La respuesta se interrumpió');
        return next(err);
    }

    const responseError = isAppError(err) ? err : normalizeDatabaseError(err);

    if (isAppError(responseError)) {
        if (responseError !== err && responseError.statusCode >= 500) logger.error(
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
};
