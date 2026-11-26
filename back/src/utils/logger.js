import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { PRISMA_ERROR_CODES } from '../constants/prisma.js';
import { errorMap } from '../messages/codeMessages.js';
import { isAppError } from '../errors/AppError.js';

const production = process.env.NODE_ENV === 'production';
const defaultLevel = production ? 'info' : 'warn';
const supportedLevels = new Set(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']);
const configuredLevel = process.env.LOG_LEVEL?.trim().toLowerCase();
const configuredSlowMs = Number(process.env.LOG_SLOW_HTTP_MS ?? 1000);
const slowHttpMs = Number.isSafeInteger(configuredSlowMs) && configuredSlowMs > 0 ? configuredSlowMs : 1000;
const routineHttp = !production && process.env.LOG_HTTP_ROUTINE !== 'false'
    || process.env.LOG_HTTP_ROUTINE === 'true';
const requestContext = new AsyncLocalStorage();

const safeCode = value => typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_.-]{0,79}$/.test(value)
    ? value : undefined;
const safeDatabaseCode = value => typeof value === 'string' && /^[A-Z0-9]{5}$/.test(value)
    ? value : undefined;

const serializeError = error => {
    if (!error) return undefined;

    // Error messages and Prisma metadata can embed SQL, credentials or request data.
    const frames = typeof error.stack === 'string'
        ? error.stack.split('\n').filter(line => /^\s+at /.test(line)).flatMap(line => {
            const location = line.match(/\/(?:back\/)?src\/[\w/.-]+:\d+:\d+(?=\)?$)/)?.[0];
            return location ? [location.replace(/^\/back\//, '/')] : [];
        }).slice(0, 8)
        : [];

    return {
        type: safeCode(error.name) ?? 'Error',
        code: safeCode(error.code),
        databaseCode: safeDatabaseCode(error.meta?.driverAdapterError?.cause?.originalCode ?? error.meta?.code),
        frames: frames.length ? frames : undefined
    };
};

export const logger = pino({
    level: supportedLevels.has(configuredLevel) ? configuredLevel : defaultLevel,
    base: { log_schema: 'nexus.v1' },
    mixin: () => ({ requestId: requestContext.getStore()?.requestId }),
    serializers: { err: serializeError, error: serializeError, warning: serializeError },
    timestamp: pino.stdTimeFunctions.isoTime
});

if (configuredLevel && !supportedLevels.has(configuredLevel)) {
    logger.warn({ fallbackLevel: defaultLevel }, 'Nivel de log no soportado');
}

if (slowHttpMs !== configuredSlowMs) {
    logger.warn({ slowHttpMs }, 'Umbral HTTP no válido; se usará el valor predeterminado');
}

export const createServiceLogger = service => logger.child({ layer: 'service', service });

export const getModelLogContext = (model, data) => ({
    model,
    detailsCount: Array.isArray(data?.details) ? data.details.length : undefined
});

export const logServiceError = (
    serviceLogger,
    err,
    { level, operation, model, inventoryType, attempts, detailsCount } = {},
    message = 'Error en servicio'
) => {
    const severity = supportedLevels.has(level) ? level : isAppError(err) && err.statusCode < 500 ? 'debug' : 'error';
    const fields = { err, operation, model, inventoryType, attempts, detailsCount };
    const context = requestContext.getStore();

    if (context && severity === 'error') {
        context.serviceFailure ??= fields;
        return;
    }

    serviceLogger[severity](fields, message);
};

export const logServiceInfo = (serviceLogger, context, message) => {
    serviceLogger.info({ event: 'inventory_import', ...context }, message);
};

export const logInvalidToken = error => {
    if (error?.name === 'TokenExpiredError') return;

    const context = requestContext.getStore();
    if (context) {
        context.invalidToken = true;
        return;
    }

    logger.warn({ event: 'security_invalid_token' }, 'Token rechazado');
};

export const recordHttpError = (req, err, code, statusCode) => {
    const context = requestContext.getStore();
    if (context) {
        context.httpError = { err, errorCode: safeCode(code) };
        return;
    }

    if (statusCode >= 500) {
        logger.error({ err, method: req.method, errorCode: safeCode(code) }, 'Error HTTP');
    }
};

const requestLogger = pinoHttp({
    logger,
    autoLogging: false,
    genReqId: () => randomUUID(),
    quietReqLogger: true,
    quietResLogger: true,
    customAttributeKeys: { reqId: 'requestId' },
    serializers: { req: () => undefined }
});

const logHttpCompletion = (req, res, context, started) => {
    const elapsedMs = performance.now() - started;
    const statusCode = res.headersSent ? res.statusCode : undefined;
    const interrupted = !res.writableFinished;
    const serviceErrorCode = context.serviceFailure?.err?.code;
    const expectedConflict = (statusCode === 409 && (
        serviceErrorCode === PRISMA_ERROR_CODES.RECORD_NOT_UNIQUE
        || serviceErrorCode === PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT
    )) || (statusCode === 404 && serviceErrorCode === PRISMA_ERROR_CODES.RECORD_NOT_FOUND);
    const expectedIdentifier = statusCode === 400 && context.httpError?.errorCode === errorMap.id.INVALID_UUID;
    const serviceRejection = statusCode >= 400 && context.serviceFailure && !expectedConflict && !expectedIdentifier;
    const failure = interrupted || statusCode >= 500 || serviceRejection;
    const security = context.invalidToken || statusCode === 403 || context.httpError?.errorCode === 'LOGIN_ERROR';
    const success = (statusCode >= 200 && statusCode < 300) || statusCode === 304;
    const slowSuccess = success && elapsedMs >= slowHttpMs;

    if (!failure && !security && !slowSuccess && !routineHttp) return;

    const route = typeof req.route?.path === 'string' ? req.route.path : undefined;
    const fields = {
        requestId: context.requestId, method: req.method, route, statusCode, durationMs: Math.round(elapsedMs)
    };

    if (failure) {
        const { err, operation, model, inventoryType, detailsCount } = context.serviceFailure ?? {};
        logger.error({
            ...fields, event: interrupted ? 'http_interrupted' : 'http_error',
            err: err ?? context.httpError?.err, operation, model, inventoryType, detailsCount, errorCode: context.httpError?.errorCode
        }, 'Error HTTP');
    }
    if (security) {
        const event = context.invalidToken ? 'security_invalid_token'
            : statusCode === 403 ? 'security_forbidden' : 'security_login_failed';
        logger.warn({ ...fields, event }, 'Solicitud de seguridad rechazada');
    }
    if (!failure && !security) {
        const event = slowSuccess ? 'http_slow' : 'http_request';
        const level = slowSuccess ? 'warn' : statusCode >= 400 ? 'debug' : 'info';
        logger[level]({ ...fields, event }, 'Solicitud HTTP completada');
    }
};

export const pinoLogger = (req, res, next) => {
    const started = performance.now();
    requestLogger(req, res, () => {
        const context = { requestId: req.id };
        res.setHeader('X-Request-Id', context.requestId);
        const complete = () => {
            res.removeListener('finish', complete);
            res.removeListener('close', complete);
            logHttpCompletion(req, res, context, started);
        };
        res.once('finish', complete);
        res.once('close', complete);
        requestContext.run(context, next);
    });
};
