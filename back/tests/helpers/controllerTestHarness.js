import express from 'express';

import { handleError } from '../../src/middleware/errorMiddleware.js';

export const createControllerTestApp = ({ registerRoutes }) => {
  const app = express();

  app.use(express.json());
  registerRoutes(app);
  app.use(handleError);

  return app;
};
