import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '../../../../../src/shared/constants/permissions.js';

const auth = vi.hoisted(() => ({ permissions: [] }));
vi.mock('../../../../../src/middleware/authMiddleware.js', async importOriginal => ({
    ...await importOriginal(),
    verifyApiTokenRequired: (req, _res, next) => {
        req.user = { permissions: auth.permissions };
        next();
    }
}));
vi.mock('../../../../../src/controllers/api/admin/catalogController.js', () => ({
    getAllCatalogEntries: (_req, res) => res.json({ ok: true }),
    registerCatalogEntry: (_req, res) => res.json({ ok: true }),
    editCatalogEntry: (_req, res) => res.json({ ok: true })
}));
vi.mock('../../../../../src/validators/forms/catalogValidations.js', () => ({
    catalogEntryValidation: [], catalogEntryEditValidation: []
}));
const { default: catalogRouter } = await import('../../../../../src/routes/api/admin/catalogApiRoute.js');
const app = express();
app.use(express.json());
app.use('/catalogs', catalogRouter);

describe('acceso a catálogos por recurso', () => {
    it.each([
        [PERMISSIONS.MATERIAL_CATALOGS_MANAGE, 'get', 'materials', 200],
        [PERMISSIONS.MATERIAL_CATALOGS_MANAGE, 'post', 'materials', 200],
        [PERMISSIONS.MATERIAL_CATALOGS_MANAGE, 'put', 'materials/id', 200],
        [PERMISSIONS.MATERIAL_CATALOGS_MANAGE, 'get', 'presentations', 200],
        [PERMISSIONS.MATERIAL_CATALOGS_MANAGE, 'get', 'unit-measures', 200],
        [PERMISSIONS.MATERIAL_CATALOGS_MANAGE, 'post', 'presentations', 403],
        [PERMISSIONS.MATERIAL_CATALOGS_MANAGE, 'get', 'roles', 403],
        [PERMISSIONS.MATERIAL_CATALOGS_MANAGE, 'get', 'departments', 403],
        [PERMISSIONS.MATERIALS_READ, 'get', 'materials', 403],
        [PERMISSIONS.MATERIALS_READ, 'post', 'materials', 403],
        [PERMISSIONS.CATALOGS_MANAGE, 'get', 'materials', 200],
        [PERMISSIONS.CATALOGS_MANAGE, 'post', 'roles', 200]
    ])('%s: %s %s responde %s', async (permission, method, path, status) => {
        auth.permissions = [permission];
        const response = await request(app)[method](`/catalogs/${path}`).send({});
        expect(response.status).toBe(status);
    });
});
