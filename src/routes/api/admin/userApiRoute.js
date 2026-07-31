import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editUser, editUserPassword, getAllUsers, registerUser } from '../../../controllers/api/admin/userController.js';
import { userEditValidation, userPasswordValidation, userValidation } from '../../../validators/forms/userValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.USERS_MANAGE),
    getAllUsers
);

router.post(
    '/',
    verifyApiTokenRequired,
    userValidation,
    validate,
    authorizeUserApi(PERMISSIONS.USERS_MANAGE),
    registerUser
);

router.patch(
    '/:id',
    verifyApiTokenRequired,
    userEditValidation,
    validate,
    authorizeUserApi(PERMISSIONS.USERS_MANAGE),
    editUser
);

router.patch(
    '/:id/password',
    verifyApiTokenRequired,
    userPasswordValidation,
    validate,
    authorizeUserApi(PERMISSIONS.USERS_MANAGE),
    editUserPassword
);

export default router;
