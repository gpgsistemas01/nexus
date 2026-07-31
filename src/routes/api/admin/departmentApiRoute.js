import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from "../../../middleware/authMiddleware.js";
import { getAllDepartments } from '../../../controllers/api/admin/departmentController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();

router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.DEPARTMENTS_READ),
    getAllDepartments
);

export default router;
