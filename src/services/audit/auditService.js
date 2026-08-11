import { getDb } from '../../repository/baseRepository.js';

const WRITE_ACTIONS = Object.freeze({
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE'
});

const UUID_PATH_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SENSITIVE_FIELD = /password|token|secret|authorization|cookie/i;

const truncate = (value, maxLength) =>
    value == null ? null : String(value).slice(0, maxLength);

const getPathSegments = (path) =>
    path.split('?')[0].split('/').filter(Boolean);

const getEntityId = (req) => {
    if (req.params?.id) return truncate(req.params.id, 100);

    return getPathSegments(req.originalUrl || req.url || '')
        .find(segment => UUID_PATH_SEGMENT.test(segment)) || null;
};

const getResource = (req) => {
    const segments = getPathSegments(req.baseUrl || req.originalUrl || req.url || '');
    const apiIndex = segments.indexOf('api');
    const resourceSegments = apiIndex >= 0 ? segments.slice(apiIndex + 1) : segments;

    return truncate(
        resourceSegments.filter(segment => !UUID_PATH_SEGMENT.test(segment)).join('/'),
        100
    ) || 'unknown';
};

const sanitizeChanges = (value) => {
    if (Array.isArray(value)) return value.map(sanitizeChanges);
    if (!value || typeof value !== 'object') return value;

    return Object.fromEntries(
        Object.entries(value)
            .filter(([key]) => !SENSITIVE_FIELD.test(key))
            .map(([key, childValue]) => [key, sanitizeChanges(childValue)])
    );
};

const buildAuditData = (req, statusCode) => ({
    actorId: req.userId ?? req.user?.id ?? null,
    action: WRITE_ACTIONS[req.method],
    resource: getResource(req),
    entityId: getEntityId(req),
    method: req.method,
    path: truncate(req.originalUrl || req.url || '/', 500),
    statusCode,
    changes: req.body && Object.keys(req.body).length
        ? sanitizeChanges(req.body)
        : null,
    requestId: truncate(req.id, 100),
    ipAddress: truncate(req.ip, 45),
    userAgent: truncate(req.get?.('user-agent'), 500)
});

export const isAuditWriteRequest = (req) =>
    req.path?.startsWith('/api') && Boolean(WRITE_ACTIONS[req.method]);

export const persistWriteAudit = ({ req, statusCode, db = getDb() }) =>
    db.criticalWriteAudit.create({
        data: buildAuditData(req, statusCode)
    });
