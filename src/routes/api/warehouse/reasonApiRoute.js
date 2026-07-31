import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { getAllReasons } from '../../../controllers/api/warehouse/reasonController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.REASONS_READ),
    getAllReasons
);

export default router;
