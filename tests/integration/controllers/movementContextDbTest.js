import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import XLSX from 'xlsx';
import { randomUUID } from 'node:crypto';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';

const suffix = randomUUID().slice(0, 8);
const ids = {};
const movementIds = [];
const detailIds = { materials: [], consumables: [] };
const authCookies = {};
let prisma;
let app;
let previousSecret;

const binaryParser = (response, callback) => {
    const chunks = [];
    response.on('data', chunk => chunks.push(chunk));
    response.on('end', () => callback(null, Buffer.concat(chunks)));
};

describe('movimientos por contexto, permisos y reportes', () => {
    beforeAll(async () => {
        previousSecret = process.env.JWT_SECRET_ACCESS;
        const testSecret = randomUUID();
        process.env.JWT_SECRET_ACCESS = testSecret;
        prisma = (await import('../../../src/lib/prisma.js')).prisma;
        const movementRouter = (await import('../../../src/routes/api/admin/movementApiRoute.js')).default;
        const reportRouter = (await import('../../../src/routes/api/admin/reportApiRoute.js')).default;
        app = createControllerTestApp({ registerRoutes: router => {
            router.use(cookieParser());
            router.use('/movements', movementRouter);
            router.use('/reports', reportRouter);
        } });
        for (const [resource, roleName, departmentName] of [
            ['admin', 'Administrador del sistema', 'SISTEMAS'], ['warehouse', 'Almacenista', 'ALMACÉN Y PROVEDURÍA']
        ]) {
            const role = await prisma.role.upsert({ where: { name: roleName }, update: {}, create: { name: roleName } });
            const department = await prisma.department.upsert({ where: { name: departmentName }, update: {}, create: { name: departmentName } });
            const user = await prisma.user.create({ data: {
                name: `IT MOV ${resource} ${suffix}`, password: 'integration-only',
                accesses: { create: { roleId: role.id, departmentId: department.id } }
            } });
            ids[resource] = user.id;
            authCookies[resource] = `accessToken=${jwt.sign({ id: user.id }, testSecret, { expiresIn: '10m' })}`;
        }
        ids.unit = (await prisma.unitMeasure.create({ data: { name: `IT MOV Unit ${suffix}`, symbol: `m${suffix}` } })).id;
        ids.presentation = (await prisma.presentation.create({ data: { name: `IT MOV Presentation ${suffix}` } })).id;
        ids.supplier = (await prisma.supplier.create({ data: {
            codeNumber: Number.parseInt(Date.now().toString().slice(-8)), code: `MV${suffix}`,
            legalName: `IT MOV Legal ${suffix}`, tradeName: `IT MOV Supplier ${suffix}`
        } })).id;
        for (const [resource, type] of [['materials', 'MATERIAL'], ['consumables', 'CONSUMABLE']]) {
            ids[resource] = (await prisma.material.create({ data: {
                name: `IT MOV ${resource} ${suffix}`, type, presentationId: ids.presentation, unitMeasureId: ids.unit
            } })).id;
            for (const movementType of ['ENTRY', 'ISSUE', 'ADJUSTMENT']) {
                const movement = await prisma.inventoryMovement.create({ data: {
                    type: movementType, referenceNumber: `IT-MOV-${resource}-${movementType}-${suffix}`, date: new Date('2026-10-12T12:00:00Z'),
                    details: { create: { materialId: ids[resource], supplierId: ids.supplier, quantity: 2, previousStock: 10, newStock: 12 } }
                }, include: { details: true } });
                movementIds.push(movement.id);
                detailIds[resource].push(movement.details[0].id);
            }
        }
    });

    afterAll(async () => {
        if (prisma) {
            await prisma.movementDetail.deleteMany({ where: { movementId: { in: movementIds } } });
            await prisma.inventoryMovement.deleteMany({ where: { id: { in: movementIds } } });
            await prisma.material.deleteMany({ where: { id: { in: [ids.materials, ids.consumables].filter(Boolean) } } });
            if (ids.supplier) await prisma.supplier.delete({ where: { id: ids.supplier } });
            if (ids.presentation) await prisma.presentation.delete({ where: { id: ids.presentation } });
            if (ids.unit) await prisma.unitMeasure.delete({ where: { id: ids.unit } });
            const userIds = [ids.admin, ids.warehouse].filter(Boolean);
            await prisma.userRoleDepartment.deleteMany({ where: { userId: { in: userIds } } });
            await prisma.user.deleteMany({ where: { id: { in: userIds } } });
        }
        if (previousSecret === undefined) delete process.env.JWT_SECRET_ACCESS;
        else process.env.JWT_SECRET_ACCESS = previousSecret;
    });

    it.each(['materials', 'consumables'])('lista y pagina sólo %s, sin permitir cambiar el tipo por query', async resource => {
        const other = resource === 'materials' ? 'consumables' : 'materials';
        const response = await request(app).get(`/movements/${resource}`).set('Cookie', authCookies.admin)
            .query({ supplierId: ids.supplier, type: other === 'materials' ? 'MATERIAL' : 'CONSUMABLE', context: other }).expect(200);
        expect(response.body.data.map(row => row.id).sort()).toEqual([...detailIds[resource]].sort());
        expect(response.body.recordsTotal).toBe(3);
        expect(response.body.recordsFiltered).toBe(3);
        const page = await request(app).get(`/movements/${resource}`).set('Cookie', authCookies.admin)
            .query({ supplierId: ids.supplier, start: 1, length: 1 }).expect(200);
        expect(page.body.data).toHaveLength(1);
        expect(detailIds[resource]).toContain(page.body.data[0].id);
    });

    it.each(['materials', 'consumables'])('rechaza filtros cruzados y limita la búsqueda y los tipos de movimiento en %s', async resource => {
        const other = resource === 'materials' ? 'consumables' : 'materials';
        for (const query of [{ materialId: ids[other] }, { search: { value: `IT MOV ${other}` } }]) {
            const response = await request(app).get(`/movements/${resource}`).set('Cookie', authCookies.admin)
                .query({ supplierId: ids.supplier, ...query }).expect(200);
            expect(response.body.data).toEqual([]);
            expect(response.body.recordsTotal).toBe(3);
            expect(response.body.recordsFiltered).toBe(0);
        }
        const response = await request(app).get(`/movements/${resource}`).set('Cookie', authCookies.admin)
            .query({ supplierId: ids.supplier, movementType: 'ISSUE', startDate: '2026-10-01', endDate: '2026-10-31' }).expect(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].type).toBe('Salida');
    });

    it.each(['materials', 'consumables'])('exporta Excel personalizado y mensual exclusivamente de %s', async resource => {
        const other = resource === 'materials' ? 'consumables' : 'materials';
        const before = await prisma.movementDetail.findMany({ where: { movementId: { in: movementIds } }, orderBy: { id: 'asc' } });
        for (const query of [{ supplierId: ids.supplier }, { monthlyReport: true, reportMonth: '2026-10' }]) {
            const response = await request(app).get(`/reports/movements/${resource}/excel`).set('Cookie', authCookies.admin)
                .query({ ...query, type: 'WRONG', context: other }).buffer(true).parse(binaryParser).expect(200);
            const workbook = XLSX.read(response.body, { type: 'buffer' });
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
            expect(rows).toHaveLength(4);
            expect(rows.slice(1).every(row => row[4] === `IT MOV ${resource} ${suffix}`)).toBe(true);
            if (resource === 'consumables') {
                expect(workbook.SheetNames).toEqual(['Movimientos de consumibles']);
                expect(rows[0][4]).toBe('Consumible');
                expect(response.headers['content-disposition']).toContain('informe_movimientos_consumibles');
            }
        }
        expect(await prisma.movementDetail.findMany({ where: { movementId: { in: movementIds } }, orderBy: { id: 'asc' } })).toEqual(before);
    });

    it('protege los tres listados y reportes contra sesiones ausentes y personal de almacén', async () => {
        for (const resource of ['materials', 'consumables', 'wastes']) {
            for (const path of [`/movements/${resource}`, `/reports/movements/${resource}/excel`]) {
                await request(app).get(path).expect(401);
                await request(app).get(path).set('Cookie', authCookies.warehouse).expect(403);
            }
        }
    });
});
