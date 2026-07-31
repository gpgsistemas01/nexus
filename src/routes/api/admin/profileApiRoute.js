import express from 'express';
import { editProfile, getAllProfiles, registerProfile } from "../../../controllers/api/admin/profileController.js";
import { authorizeUserApi, verifyApiTokenRequired } from "../../../middleware/authMiddleware.js";
import { profileValidation } from '../../../validators/forms/profileValidations.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.PROFILES_READ),
    getAllProfiles
);

router.post(
    '/',
    verifyApiTokenRequired,
    profileValidation,
    authorizeUserApi(PERMISSIONS.PROFILES_WRITE),
    registerProfile
);

router.put(
    '/:id',
    verifyApiTokenRequired,
    profileValidation,
    authorizeUserApi(PERMISSIONS.PROFILES_WRITE),
    editProfile
);

export default router;
