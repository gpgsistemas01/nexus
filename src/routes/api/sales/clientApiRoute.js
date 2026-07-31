import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editClient, getAllClients, registerClient } from '../../../controllers/api/sales/clientController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();



router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.CLIENTS_READ),
    getAllClients
);


router.post(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.CLIENTS_CREATE),
    registerClient
);

router.put(
    '/:id',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.CLIENTS_UPDATE),
    editClient
);

export default router;
