import express from 'express';
import { getAuthTokenInfo } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get(
    '/',
    (req, res) => {
        if (req.user || getAuthTokenInfo(req, res)) return res.redirect('/almacen/materiales');

        return res.redirect('/inicio-sesion');
    }
)

export default router;
