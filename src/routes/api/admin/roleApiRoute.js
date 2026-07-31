import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { getAllRoles } from '../../../controllers/api/admin/roleController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.ROLES_READ),
    getAllRoles
);

export default router;
