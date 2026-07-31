import express from 'express';
import { editPerson, getAllPersons, registerPerson } from "../../../controllers/api/admin/personController.js";
import { authorizeUserApi, verifyApiTokenRequired } from "../../../middleware/authMiddleware.js";
import { personValidation } from '../../../validators/forms/personValidations.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.PERSONS_READ),
    getAllPersons
);

router.post(
    '/',
    verifyApiTokenRequired,
    personValidation,
    authorizeUserApi(PERMISSIONS.PERSONS_WRITE),
    registerPerson
);

router.put(
    '/:id',
    verifyApiTokenRequired,
    personValidation,
    authorizeUserApi(PERMISSIONS.PERSONS_WRITE),
    editPerson
);

export default router;
