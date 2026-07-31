import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { getAllPresentations } from '../../../controllers/api/warehouse/presentationController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.PRESENTATIONS_READ),
    getAllPresentations
);

export default router;
