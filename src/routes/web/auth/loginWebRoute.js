import express from 'express';
import { login } from '../../../controllers/web/authController.js';

const router = express.Router();

router.get(
    '/',
    login
);

export default router;