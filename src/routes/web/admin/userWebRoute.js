import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getUsersPage } from '../../../controllers/web/admin/userController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/', 
    verifyCookiesAuthTokenRequired, 
    authorizeUserWeb(PERMISSIONS.USERS_MANAGE),
    getUsersPage
);

export default router;
