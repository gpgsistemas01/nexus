import express from 'express';
import { checkDatabaseReady } from '../../services/healthService.js';

const router = express.Router();

router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

router.get('/live', (_req, res) => res.status(200).json({ status: 'ok' }));

router.get('/ready', async (req, res) => {
    const ready = req.app.locals.isReady() && await checkDatabaseReady();
    // El estado puede haber cambiado mientras se comprobaba PostgreSQL.
    const available = ready && req.app.locals.isReady();
    return res.status(available ? 200 : 503).json({ status: available ? 'ready' : 'unavailable' });
});

export default router;
