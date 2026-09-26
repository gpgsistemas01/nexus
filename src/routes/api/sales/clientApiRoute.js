import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editClient, getAllClients, registerClient } from '../../../controllers/api/sales/clientController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { clientValidation } from '../../../validators/forms/clientValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

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
    clientValidation,
    validate,
    authorizeUserApi(PERMISSIONS.CLIENTS_CREATE),
    registerClient
);

router.put(
    '/:id',
    verifyApiTokenRequired,
    clientValidation,
    validate,
    authorizeUserApi(PERMISSIONS.CLIENTS_UPDATE),
    editClient
);

export default router;
