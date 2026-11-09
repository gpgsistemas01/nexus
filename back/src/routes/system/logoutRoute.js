import { Router } from 'express';
import { clearAuthCookies } from '../../utils/cookiesUtils.js';

const router = Router();

router.post('/', (_req, res) => {
    clearAuthCookies(res);
    return res.redirect(303, '/inicio-sesion');
});

export default router;
