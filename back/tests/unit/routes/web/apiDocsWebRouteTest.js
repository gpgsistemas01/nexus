import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bundleOpenApiContract, validateOpenApiContract } from '../../../../scripts/openApiContractUtils.js';
import { rootDir } from '../../../../src/utils/pathsUtils.js';
import { join } from 'node:path';

vi.mock('../../../../src/lib/prisma.js', () => ({ prisma: {} }));
const { createApp } = await import('../../../../src/app.js');

afterEach(() => vi.unstubAllEnvs());

describe('Swagger UI de desarrollo', () => {
    it('sirve la interfaz y su configuración sin CDN ni autorización persistente', async () => {
        vi.stubEnv('NODE_ENV', 'development');
        const app = createApp();
        const page = await request(app).get('/api-docs/').expect(200).expect('Content-Type', /html/);
        expect(page.text).toContain('<title>Nexus API</title>');
        expect(page.text).toContain('./swagger-ui-bundle.js');
        const initialization = await request(app).get('/api-docs/swagger-ui-init.js').expect(200);
        expect(initialization.text).toContain('"url": "./openapi.json"');
        expect(initialization.text).toContain('"withCredentials": true');
        expect(initialization.text).toContain('"validatorUrl": null');
        expect(initialization.text).toContain('"persistAuthorization": false');
        await request(app).get('/api-docs/swagger-ui.css').expect(200).expect('Content-Type', /css/);
    });

    it('publica el mismo contrato OpenAPI validado, con referencias internas y cookies', async () => {
        vi.stubEnv('NODE_ENV', 'development');
        const response = await request(createApp()).get('/api-docs/openapi.json').expect(200);
        const expected = await bundleOpenApiContract(join(rootDir, 'docs/architecture/openapi/openapi.json'));
        expect(response.headers['cache-control']).toBe('no-store');
        expect(response.body).toEqual(expected);
        expect(validateOpenApiContract(response.body).length).toBeGreaterThan(0);
        expect(response.body.servers).toEqual([{ url: '/' }]);
        expect(response.body.components.securitySchemes.cookieAuth).toMatchObject({
            type: 'apiKey', in: 'cookie', name: 'accessToken'
        });
    });

    it('permite abrir la URL sin barra final sin romper los recursos relativos', async () => {
        vi.stubEnv('NODE_ENV', 'development');
        const response = await request(createApp()).get('/api-docs').expect(301);
        expect(response.headers.location).toBe('/api-docs/');
    });

    it.each(['/', '/openapi.json', '/swagger-ui.css', '/swagger-ui-init.js'])(
        'producción omite el visor y sus recursos: %s', async suffix => {
            vi.stubEnv('NODE_ENV', 'production');
            await request(createApp()).get(`/api-docs${suffix}`).expect(404);
        }
    );
});
