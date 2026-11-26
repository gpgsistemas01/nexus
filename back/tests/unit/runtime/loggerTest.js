import { Writable } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';
import express from 'express';
import pino from 'pino';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../src/errors/AppError.js';

let app;
let restoreStream;
const records = [];
const sensitive = 'SECRET_LOG_TEST_VALUE';

beforeAll(async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('LOG_LEVEL', 'info');
    vi.stubEnv('LOG_HTTP_ROUTINE', 'false');
    vi.stubEnv('LOG_SLOW_HTTP_MS', '200');
    const { createServiceLogger, logInvalidToken, logger, logServiceError, pinoLogger } =
        await import('../../../src/utils/logger.js');
    const { handleError } = await import('../../../src/middleware/errorMiddleware.js');
    const stream = pino.symbols.streamSym;
    const originalStream = logger[stream];
    restoreStream = () => { logger[stream] = originalStream; };
    logger[stream] = new Writable({
        write(chunk, _encoding, done) {
            records.push(JSON.parse(chunk.toString()));
            done();
        }
    });

    app = express();
    app.use(pinoLogger);
    app.use(express.json());
    app.get('/fast', (_req, res) => res.sendStatus(200));
    app.get('/cached', (_req, res) => res.sendStatus(304));
    app.get('/slow', async (_req, res) => {
        await delay(240);
        res.sendStatus(204);
    });
    app.get('/expected', (_req, _res) => { throw new AppError('Conflicto', 'DOMAIN_CONFLICT', 409); });
    app.get('/forbidden', (_req, res) => res.sendStatus(403));
    app.get('/expired', (_req, res) => {
        logInvalidToken({ name: 'TokenExpiredError' });
        res.sendStatus(401);
    });
    app.get('/invalid', (_req, res) => {
        logInvalidToken({ name: 'JsonWebTokenError' });
        res.sendStatus(401);
    });
    app.get('/database/:id', (_req, res) => {
        res.set('Set-Cookie', sensitive);
        const error = Object.assign(new Error(sensitive), { code: 'P2021', meta: { password: sensitive } });
        logServiceError(createServiceLogger('tests'), error, { operation: 'tests.database' });
        throw new AppError('La base no está disponible', 'DATABASE_TABLE_MISSING', 503);
    });
    app.get('/interrupted', (_req, res) => {
        res.write('partial');
        throw new Error(sensitive);
    });
    app.use(handleError);
});

afterAll(() => {
    restoreStream?.();
    vi.unstubAllEnvs();
});

beforeEach(() => records.splice(0));

describe('logging HTTP en producción', () => {
    it('omite respuestas rutinarias y emite los éxitos lentos con un UUID propio', async () => {
        const fast = await request(app).get('/fast').expect(200);
        await request(app).get('/cached').expect(304);
        await request(app).get('/expected').expect(409);
        expect(records).toEqual([]);
        const slow = await request(app).get('/slow').set('X-Request-Id', sensitive).expect(204);
        expect(slow.headers['x-request-id']).toMatch(/^[a-f0-9-]{36}$/);
        expect(slow.headers['x-request-id']).not.toBe(fast.headers['x-request-id']);
        expect(records).toEqual([expect.objectContaining({
            event: 'http_slow',
            requestId: slow.headers['x-request-id'],
            statusCode: 204,
            durationMs: expect.any(Number)
        })]);
    });

    it('registra una vez el error de servicio traducido y excluye los datos sensibles', async () => {
        const response = await request(app).get(`/database/${sensitive}?token=${sensitive}`)
            .set('Cookie', sensitive).set('Authorization', sensitive).expect(503);
        expect(response.body.code).toBe('DATABASE_TABLE_MISSING');
        expect(records).toEqual([expect.objectContaining({
            event: 'http_error',
            route: '/database/:id',
            errorCode: 'DATABASE_TABLE_MISSING',
            operation: 'tests.database',
            err: expect.objectContaining({ code: 'P2021' }),
            requestId: response.headers['x-request-id']
        })]);
        expect(JSON.stringify(records)).not.toContain(sensitive);
    });

    it('distingue los eventos de seguridad de la caducidad de sesión', async () => {
        await request(app).get('/expired').expect(401);
        await request(app).get('/invalid').expect(401);
        await request(app).get('/forbidden').expect(403);
        expect(records.map(record => record.event)).toEqual(['security_invalid_token', 'security_forbidden']);
    });

    it('correlaciona los errores de parsing e informa respuestas interrumpidas una sola vez', async () => {
        const response = await request(app).post('/example').type('json').send('{"bad":').expect(500);
        expect(records).toEqual([expect.objectContaining({
            event: 'http_error', requestId: response.headers['x-request-id']
        })]);
        records.splice(0);
        await expect(request(app).get('/interrupted')).rejects.toThrow();
        expect(records).toEqual([expect.objectContaining({ event: 'http_interrupted' })]);
        expect(JSON.stringify(records)).not.toContain(sensitive);
    });
});
