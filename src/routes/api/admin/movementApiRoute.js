import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from "../../../middleware/authMiddleware.js";
import { getAllMovements } from '../../../controllers/api/admin/movementController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();

router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.MOVEMENTS_READ),
    getAllMovements
);

export default router;
