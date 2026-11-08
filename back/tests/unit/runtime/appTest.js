import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
const { query } = vi.hoisted(() => ({ query: vi.fn().mockResolvedValue([]) }));
vi.mock('../../../src/lib/prisma.js', () => ({ prisma: { $queryRaw: query } }));
const { createApp } = await import('../../../src/app.js');

describe('aplicación Express sin arranque de infraestructura', () => {
    it('conserva salud y respuestas JSON al construir aplicaciones independientes', async () => {
        const app = createApp();
        expect((await request(app).get('/health/live')).body).toEqual({ status: 'ok' });
        expect((await request(app).get('/health/ready')).status).toBe(200);
        const missing = await request(app).get('/api/no-existe');
        expect(missing.status).toBe(404);
        expect(missing.body).toEqual({ message: 'Ruta no encontrada.' });
        expect((await request(createApp({ isReady: () => false })).get('/health/ready')).status).toBe(503);
    });

    it.each(['/', '/inicio-sesion', '/almacen/materiales', '/compras/materiales', '/error/404', '/css/style.css', '/js/pages/home/index/indexPage.js', '/shared/constants/auth.js'])(
        'responde JSON 404 para la ruta de presentación retirada %s', async path => {
            const response = await request(createApp()).get(path).set('Accept', 'text/html');
            expect(response.status).toBe(404);
            expect(response.type).toBe('application/json');
            expect(response.body).toEqual({ message: 'Ruta no encontrada.' });
        }
    );

    it('cierra las cookies de sesión y devuelve el navegador al login Vue', async () => {
        const response = await request(createApp()).post('/cerrar-sesion');
        expect(response.status).toBe(303);
        expect(response.headers.location).toBe('/inicio-sesion');
        for (const name of ['accessToken', 'refreshToken']) {
            expect(response.headers['set-cookie']).toEqual(expect.arrayContaining([
                expect.stringMatching(new RegExp(`^${name}=;.*Expires=Thu, 01 Jan 1970`))
            ]));
        }
    });
});
