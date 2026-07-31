import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { getLatestNotifications, readAllNotifications } from '../../../controllers/api/warehouse/notificationController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.NOTIFICATIONS_MANAGE),
    getLatestNotifications
);

router.patch(
    '/read-all',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.NOTIFICATIONS_MANAGE),
    readAllNotifications
);

export default router;
