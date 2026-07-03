import express from 'express';
import { login, refreshAuthToken } from '../../controllers/api/authController.js';
import { loginValidation } from '../../validators/forms/authValitdations.js';
import { validateLogin } from '../../middleware/validatorMiddleware.js';

const router = express.Router();

router.post(
    '/login', 
    loginValidation, 
    validateLogin, 
    login
);

router.post(
    '/refresh', 
    refreshAuthToken
);

export default router;