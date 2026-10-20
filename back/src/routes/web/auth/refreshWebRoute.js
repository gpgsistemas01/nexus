import express from 'express';
import { refreshAuthToken } from '../../../controllers/web/authController.js';

const router = express.Router();

router.get(
    '/', 
    refreshAuthToken
);

export default router;