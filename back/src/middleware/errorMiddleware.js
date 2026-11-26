import { isAppError } from '../errors/AppError.js';
import { normalizeDatabaseError } from '../errors/databaseError.js';
import { errorMap } from '../messages/codeMessages.js';
import { recordHttpError } from '../utils/logger.js';

// Express identifies error handlers by their four parameters, including next.
export const handleError = (err, req, res, next) => {
    const responseError = isAppError(err) ? err : normalizeDatabaseError(err);
    const operational = isAppError(responseError);
    const code = operational ? responseError.code : errorMap.message.SERVER_ERROR;
    const statusCode = operational ? responseError.statusCode : 500;
    recordHttpError(req, err, code, statusCode);

    if (res.headersSent || res.destroyed) {
        if (!res.destroyed) res.destroy();
        return;
    }

    if (operational) {
        return res.status(statusCode).json({
            code: responseError.code,
            message: responseError.message,
            meta: responseError.meta
        });
    }

    res.status(statusCode).json({
        code,
        message: 'Error interno del servidor.'
    });
};
