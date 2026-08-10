import express from 'express';

import { isAppError } from '../../src/errors/AppError.js';

export const createControllerTestApp = ({ registerRoutes }) => {
  const app = express();

  app.use(express.json());
  registerRoutes(app);
  app.use((error, _request, response, _next) => {
    if (isAppError(error)) {
      return response.status(error.statusCode).json({
        type: error.constructor.name,
        code: error.code,
        message: error.message,
        meta: error.meta
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
