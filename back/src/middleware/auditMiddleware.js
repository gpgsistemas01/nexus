import { logger } from '../utils/logger.js';
import { isAuditWriteRequest, persistWriteAudit } from '../services/audit/auditService.js';

export const auditWrites = (req, res, next) => {
    if (!isAuditWriteRequest(req)) return next();

    res.once('finish', () => {
        if (res.statusCode >= 400 || !(req.userId ?? req.user?.id)) return;

        void persistWriteAudit({ req, statusCode: res.statusCode }).catch(err => {
            logger.error({ err, event: 'audit_write_failed', requestId: req.id, method: req.method }, 'No se pudo persistir la auditoría de escritura crítica');
        });
    });

    next();
};
