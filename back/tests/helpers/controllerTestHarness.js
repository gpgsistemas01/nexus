import express from 'express';

import { isAppError } from '../../src/errors/AppError.js';
import { normalizeDatabaseError } from '../../src/errors/databaseError.js';

export const createControllerTestApp = ({ registerRoutes }) => {
  const app = express();

  app.use(express.json());
  registerRoutes(app);
  app.use((error, _request, response, next) => {
    if (response.headersSent || response.destroyed) return next(error);
    const responseError = isAppError(error) ? error : normalizeDatabaseError(error);

    if (isAppError(responseError)) {
      return response.status(responseError.statusCode).json({
        type: responseError.constructor.name,
        code: responseError.code,
        message: responseError.message,
        meta: responseError.meta
      });
    }

    return response.status(500).json({
      type: error?.constructor?.name || 'Error',
      code: 'UNEXPECTED_ERROR',
      message: error?.message || 'Error inesperado'
    });
  });

  return app;
};
