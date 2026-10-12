import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from "../../../middleware/authMiddleware.js";
import { getAllMaterialMovements, getAllConsumableMovements, getAllWasteMovements } from '../../../controllers/api/admin/movementController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();

router.get(
    '/consumables',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.MOVEMENTS_READ),
    getAllConsumableMovements
);

router.get(
    '/wastes',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.MOVEMENTS_READ),
    getAllWasteMovements
);

router.get(
    '/materials',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.MOVEMENTS_READ),
    getAllMaterialMovements
);

export default router;
