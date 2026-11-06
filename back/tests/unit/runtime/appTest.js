import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
const { query } = vi.hoisted(() => ({ query: vi.fn().mockResolvedValue([]) }));
vi.mock('../../../src/lib/prisma.js', () => ({ prisma: { $queryRaw: query } }));
const { createApp } = await import('../../../src/app.js');

describe('aplicación Express sin arranque de infraestructura', () => {
    it('conserva rutas de salud, navegación y errores al construir aplicaciones independientes', async () => {
        const app = createApp();
        expect((await request(app).get('/health/live')).body).toEqual({ status: 'ok' });
        expect((await request(app).get('/health/ready')).status).toBe(200);
        const redirect = await request(app).get('/');
        expect(redirect.status).toBe(302);
        expect(redirect.headers.location).toBe('/inicio-sesion');
        const missing = await request(app).get('/api/no-existe');
        expect(missing.status).toBe(404);
        expect(missing.body).toEqual({ message: 'Ruta no encontrada.' });
        expect((await request(createApp({ isReady: () => false })).get('/health/ready')).status).toBe(503);
    });
});
