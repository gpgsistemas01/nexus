import express from 'express';
import { getCurrentUser, login, refreshAuthToken } from '../../controllers/api/authController.js';
import { loginValidation } from '../../validators/forms/authValidations.js';
import { validateLogin } from '../../middleware/validatorMiddleware.js';
import { verifyApiTokenRequired } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post(
    '/login', 
    loginValidation, 
    validateLogin, 
    login
);

router.get(
    '/me',
    verifyApiTokenRequired,
    getCurrentUser
);

router.post(
    '/refresh', 
    refreshAuthToken
);

export default router;
