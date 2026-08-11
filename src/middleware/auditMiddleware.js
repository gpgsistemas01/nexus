import { logger } from '../utils/logger.js';
import { isAuditWriteRequest, persistWriteAudit } from '../services/audit/auditService.js';

export const auditWrites = (req, res, next) => {
    if (!isAuditWriteRequest(req)) return next();

    res.once('finish', () => {
        if (res.statusCode >= 400 || !(req.userId ?? req.user?.id)) return;

        void persistWriteAudit({ req, statusCode: res.statusCode }).catch(err => {
            logger.error({ err, method: req.method, path: req.originalUrl }, 'No se pudo persistir la auditoría de escritura crítica');
        });
    });

    next();
};
