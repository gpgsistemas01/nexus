import pino from 'pino';
import pinoHttp from 'pino-http';
import { AppError } from '../errors/AppError.js';

const DEFAULT_LOG_LEVEL = 'info';
const LOG_LEVELS = new Set(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']);

const normalizeLogLevel = (level, fallback = DEFAULT_LOG_LEVEL) => {
    if (typeof level !== 'string') return fallback;

    const normalizedLevel = level.toLowerCase();

    return LOG_LEVELS.has(normalizedLevel) ? normalizedLevel : fallback;
};

const configuredLogLevel = normalizeLogLevel(process.env.LOG_LEVEL);

const isLogValuePresent = (value) => value !== undefined && value !== null && value !== '';

const getObjectIfNotEmpty = (value) =>
    value && Object.keys(value).length > 0 ? value : undefined;

const isIdentifierField = (key) => key === 'id' || key.endsWith('Id') || key.endsWith('Ids');

const getLogSafeField = (key, value) => {
    if (!isLogValuePresent(value)) return undefined;

    if (isIdentifierField(key)) return value;

    return undefined;
};

const getLogSafeData = (data = {}) => Object.entries(data).reduce((context, [key, value]) => {
    if (key === 'details') return { ...context, ...getModelContextDetails(value) };

    const safeValue = getLogSafeField(key, value);

    if (safeValue !== undefined) context[key] = safeValue;

    return context;
}, {});

const getModelContextDetails = (details) => Array.isArray(details)
    ? { detailsCount: details.length }
    : {};

const getRequestDataLogContext = (data = {}) => Object.entries(data).reduce((context, [key, value]) => {
    const safeValue = getLogSafeField(key, value);

    if (safeValue !== undefined) context[key] = safeValue;

    return context;
}, {});

export const getModelLogContext = (model, data = {}) => ({
    model,
    ...getLogSafeData(data)
});

export const getRequestLogContext = (req) => ({
    userId: req.userId ?? req.user?.id,
    path: req.path ?? req.baseUrl ?? req.url,
    route: req.route?.path,
    params: getObjectIfNotEmpty(getRequestDataLogContext(req.params)),
    query: getObjectIfNotEmpty(getRequestDataLogContext(req.query)),
    ip: req.ip,
    userAgent: req.get?.('user-agent')
});

export const logger = pino({
    level: configuredLogLevel,
    serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res
    },
    timestamp: pino.stdTimeFunctions.isoTime
});

if (process.env.LOG_LEVEL && configuredLogLevel !== process.env.LOG_LEVEL.toLowerCase()) {
    logger.warn(
        {
            configuredLevel: process.env.LOG_LEVEL,
            fallbackLevel: DEFAULT_LOG_LEVEL,
            supportedLevels: [...LOG_LEVELS]
        },
        'Nivel de log no soportado; se usará el nivel por defecto'
    );
}

export const createServiceLogger = (service) => logger.child({ layer: 'service', service });

const getDefaultErrorLogLevel = (err) => err instanceof AppError ? 'warn' : 'error';

const STOCK_ERROR_CODES_WITH_REQUESTED_QUANTITY = new Set([
    'GOODS_ISSUE_INSUFFICIENT_STOCK'
]);

const getAppErrorMetaLogContext = (err) => {
    const meta = getLogSafeData(err.meta);

    if (
        STOCK_ERROR_CODES_WITH_REQUESTED_QUANTITY.has(err.code) &&
        isLogValuePresent(err.meta?.requestedQuantity)
    ) {
        meta.requestedQuantity = err.meta.requestedQuantity;
    }

    return meta;
};

const getAppErrorLogContext = (err) => err instanceof AppError
    ? {
        errorCode: err.code,
        statusCode: err.statusCode,
        meta: getAppErrorMetaLogContext(err)
    }
    : {};

export const logServiceError = (
    serviceLogger,
    err,
    { level, ...context } = {},
    message = 'Error en servicio'
) => {
    serviceLogger[normalizeLogLevel(level, getDefaultErrorLogLevel(err))](
        { err, errorMessage: err?.message, ...getAppErrorLogContext(err), ...context },
        message
    );
};

export const logServiceInfo = (
    serviceLogger,
    context = {},
    message = 'Operación de negocio completada'
) => {
    serviceLogger.info(context, message);
};

export const pinoLogger = pinoHttp({
    logger,
    customProps: (req) => getRequestLogContext(req),
    customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';

        return 'silent';
    },
    customSuccessMessage: (req, res) => `${req.method} ${req.url} completado`,
    customErrorMessage: (req, res) => `${req.method} ${req.url} falló`,
    redact: [
        'req.headers.cookie',
        'req.headers.authorization'
    ]
});
