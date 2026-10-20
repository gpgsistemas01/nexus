import express from 'express';
import { getCurrentUser, login, refreshAuthToken } from '../../controllers/api/authController.js';
import { loginValidation } from '../../validators/forms/authValidations.js';
import { validate } from '../../middleware/validatorMiddleware.js';
import { verifyApiTokenRequired } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post(
    '/login', 
    loginValidation, 
    validate,
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
