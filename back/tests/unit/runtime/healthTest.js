import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('../../../src/lib/prisma.js', () => ({ prisma: { $queryRaw: query } }));
const { checkDatabaseReady } = await import('../../../src/services/healthService.js');
const { default: healthRouter } = await import('../../../src/routes/web/healthWebRoute.js');
let app;
let ready;
beforeEach(() => {
    query.mockReset().mockResolvedValue([{ '?column?': 1 }]);
    ready = true;
    app = express();
    app.locals.isReady = () => ready;
    app.use('/health', healthRouter);
});

describe('salud del proceso y disponibilidad de PostgreSQL', () => {
    it('mantiene vida sin base y no expone detalles del fallo en readiness', async () => {
        query.mockRejectedValue(new Error('private connection string'));
        expect((await request(app).get('/health/live')).status).toBe(200);
        expect(query).not.toHaveBeenCalled();
        const response = await request(app).get('/health/ready');
        expect(response.status).toBe(503);
        expect(response.body).toEqual({ status: 'unavailable' });
        expect(response.headers['cache-control']).toBe('no-store');
    });
    it('acepta tráfico sólo con proceso disponible y base accesible', async () => {
        expect((await request(app).get('/health/ready')).status).toBe(200);
        ready = false;
        query.mockClear();
        expect((await request(app).get('/health/ready')).status).toBe(503);
        expect(query).not.toHaveBeenCalled();
    });
    it('rechaza disponibilidad si comienza el cierre durante la consulta', async () => {
        query.mockImplementation(async () => { ready = false; return []; });
        expect((await request(app).get('/health/ready')).status).toBe(503);
    });
    it('limita espera y comparte una consulta bloqueada entre comprobaciones', async () => {
        let release;
        query.mockReturnValue(new Promise(resolve => { release = resolve; }));
        expect(await checkDatabaseReady({ timeoutMs: 5 })).toBe(false);
        expect(await checkDatabaseReady({ timeoutMs: 5 })).toBe(false);
        expect(query).toHaveBeenCalledTimes(1);
        release([]);
        await Promise.resolve();
        await Promise.resolve();
    });
});
