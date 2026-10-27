import { ROLE_KEYS } from '../../../src/constants/roles.js';
import { DEPARTMENT_KEYS } from '../../../src/constants/departments.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';

const areaKeys = { 'IMPRESIÓN': DEPARTMENT_KEYS.PRINTING, 'TALLER 3D': DEPARTMENT_KEYS.WORKSHOP_3D, 'PT/TRÁFICO': DEPARTMENT_KEYS.PT_TRAFFIC, 'INSTALACIONES': DEPARTMENT_KEYS.INSTALLATIONS, 'ACABADOS': DEPARTMENT_KEYS.FINISHING, 'ROUTER': DEPARTMENT_KEYS.ROUTER };
const areas = ['IMPRESIÓN', 'TALLER 3D', 'PT/TRÁFICO', 'INSTALACIONES', 'ACABADOS', 'ROUTER'];
const suffix = randomUUID().slice(0, 8);
const ids = {};
const sessions = {};
const users = [];
let prisma;
let app;
let previousSecret;

const header = departmentId => ({
    departmentId, requesterId: ids.requester, advisorId: ids.advisor, clientId: ids.client,
    projectNumber: 'ACC-100', requestDate: '2026-10-16T12:00:00.000Z', observations: 'Solicitud operativa'
});
const detail = resource => resource === 'wastes'
    ? { wasteId: ids.waste, quantity: 2 }
    : { materialId: ids[resource], supplierId: ids.supplier, quantity: 2 };
const issuePath = resource => resource === 'wastes' ? '/api/warehouse/waste-issues' : `/api/warehouse/goods-issues/${resource}`;
const stockSnapshot = () => Promise.all([
    prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier }, orderBy: { id: 'asc' } }),
    prisma.waste.findUnique({ where: { id: ids.waste } }),
    prisma.goodsIssue.count({ where: { clientId: ids.client } }),
    prisma.wasteIssue.count({ where: { clientId: ids.client } })
]);

describe('acceso operativo a salidas e inventario con sesión y políticas reales', () => {
    beforeAll(async () => {
        prisma = (await import('../../../src/lib/prisma.js')).prisma;
        previousSecret = process.env.JWT_SECRET_ACCESS;
        const secret = randomUUID();
        process.env.JWT_SECRET_ACCESS = secret;
        const { registerApiRoutes } = await import('../../../src/routes/api/index.js');
        const { registerWebRoutes } = await import('../../../src/routes/web/index.js');
        app = createControllerTestApp({ registerRoutes: router => {
            router.use(cookieParser());
            // Comprueba acceso al controller web; no representa un recorrido de navegador/EJS.
            router.use((_req, res, next) => {
                res.render = view => res.json({ view });
                next();
            });
            registerApiRoutes(router);
            registerWebRoutes(router);
        } });
        for (const name of ['Pendiente', 'Surtido parcial', 'Surtido', 'Cancelado']) {
            await prisma.fulfillmentStatus.upsert({ where: { name }, update: {}, create: { name } });
        }
        for (const name of ['Aprobada', 'Cancelada']) {
            await prisma.status.upsert({ where: { name }, update: {}, create: { name } });
        }
        const operator = await prisma.role.upsert({ where: { name: 'Operador' }, update: {}, create: { name: 'Operador', key: ROLE_KEYS.OPERATOR } });
        const installer = await prisma.role.upsert({ where: { name: 'Instalador' }, update: {}, create: { name: 'Instalador', key: ROLE_KEYS.INSTALLER } });
        const deniedRole = await prisma.role.upsert({ where: { name: 'Asesor de ventas' }, update: {}, create: { name: 'Asesor de ventas', key: ROLE_KEYS.SALES_ADVISOR } });
        ids.requester = (await prisma.person.create({ data: { fullName: `IT Access Requester ${suffix}` } })).id;
        ids.advisor = (await prisma.person.create({ data: { fullName: `IT Access Advisor ${suffix}` } })).id;
        for (const area of areas) {
            const department = await prisma.department.upsert({ where: { name: area }, update: {}, create: { name: area, key: areaKeys[area] } });
            const roleId = area === 'INSTALACIONES' ? installer.id : operator.id;
            const user = await prisma.user.create({ data: {
                name: `IT Access ${area} ${suffix}`, password: 'integration-only',
                accesses: { create: { roleId, departmentId: department.id } }
            } });
            users.push(user.id);
            sessions[area] = { departmentId: department.id, cookie: `accessToken=${jwt.sign({ id: user.id }, secret, { expiresIn: '10m' })}` };
            await prisma.personRoleDepartment.create({ data: { personId: ids.requester, roleId, departmentId: department.id } });
        }
        const warehouse = await prisma.department.upsert({
            where: { key: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY }, update: {},
            create: { name: 'ALMACÉN Y PROVEDURÍA', key: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY }
        });
        for (const [key, name] of [[ROLE_KEYS.AUXILIARY, 'Auxiliar'], [ROLE_KEYS.COORDINATOR, 'Coordinador']]) {
            const role = await prisma.role.upsert({ where: { key }, update: {}, create: { name, key } });
            const user = await prisma.user.create({ data: {
                name: `IT Access Warehouse ${key} ${suffix}`, password: 'integration-only',
                accesses: { create: { roleId: role.id, departmentId: warehouse.id } }
            } });
            users.push(user.id);
            sessions[key] = { cookie: `accessToken=${jwt.sign({ id: user.id }, secret, { expiresIn: '10m' })}` };
            if (key === ROLE_KEYS.COORDINATOR) {
                const coordinator = await prisma.user.create({ data: {
                    name: `IT Access Printing Coordinator ${suffix}`, password: 'integration-only',
                    accesses: { create: { roleId: role.id, departmentId: sessions[areas[0]].departmentId } }
                } });
                users.push(coordinator.id);
                sessions.printingCoordinator = { cookie: `accessToken=${jwt.sign({ id: coordinator.id }, secret, { expiresIn: '10m' })}` };
            }
        }
        const denied = await prisma.user.create({ data: {
            name: `IT Access Denied ${suffix}`, password: 'integration-only',
            accesses: { create: { roleId: deniedRole.id, departmentId: sessions[areas[0]].departmentId } }
        } });
        users.push(denied.id);
        ids.deniedCookie = `accessToken=${jwt.sign({ id: denied.id }, secret, { expiresIn: '10m' })}`;
        ids.client = (await prisma.client.create({ data: { name: `IT Access Client ${suffix}`, advisorId: ids.advisor } })).id;
        ids.unit = (await prisma.unitMeasure.create({ data: { name: `IT AU ${suffix}`, symbol: `a${suffix}` } })).id;
        ids.presentation = (await prisma.presentation.create({ data: { name: `IT Access Presentation ${suffix}` } })).id;
        ids.supplier = (await prisma.supplier.create({ data: {
            codeNumber: Number.parseInt(Date.now().toString().slice(-8)), code: `AC${suffix}`,
            legalName: `IT Access Legal ${suffix}`, tradeName: `IT Access Supplier ${suffix}`
        } })).id;
        for (const [resource, type] of [['materials', 'MATERIAL'], ['consumables', 'CONSUMABLE']]) {
            ids[resource] = (await prisma.material.create({ data: {
                name: `IT Access ${resource} ${suffix}`, type, presentationId: ids.presentation, unitMeasureId: ids.unit
            } })).id;
            await prisma.supplierMaterial.create({ data: {
                supplierId: ids.supplier, materialId: ids[resource], currentStock: 10, convertedQuantity: 10, maxUnitCost: 25
            } });
        }
        ids.waste = (await prisma.waste.create({ data: {
            name: `IT Access Waste ${suffix}`, supplierId: ids.supplier, presentationId: ids.presentation,
            unitMeasureId: ids.unit, base: 1, height: 1, currentStock: 10, convertedQuantity: 10, maxUnitCost: 25
        } })).id;
    });

    afterAll(async () => {
        if (prisma) {
            const issueWhere = { clientId: ids.client ?? randomUUID() };
            await prisma.goodsIssueDetail.deleteMany({ where: { goodsIssue: issueWhere } });
            await prisma.goodsIssue.deleteMany({ where: issueWhere });
            await prisma.wasteIssue.deleteMany({ where: issueWhere });
            if (ids.waste) await prisma.waste.delete({ where: { id: ids.waste } });
            if (ids.supplier) {
                await prisma.supplierMaterial.deleteMany({ where: { supplierId: ids.supplier } });
                await prisma.supplier.delete({ where: { id: ids.supplier } });
            }
            await prisma.material.deleteMany({ where: { id: { in: [ids.materials, ids.consumables].filter(Boolean) } } });
            if (ids.presentation) await prisma.presentation.delete({ where: { id: ids.presentation } });
            if (ids.unit) await prisma.unitMeasure.delete({ where: { id: ids.unit } });
            if (ids.client) await prisma.client.delete({ where: { id: ids.client } });
            const persons = [ids.requester, ids.advisor].filter(Boolean);
            await prisma.personRoleDepartment.deleteMany({ where: { personId: { in: persons } } });
            await prisma.person.deleteMany({ where: { id: { in: persons } } });
            await prisma.userRoleDepartment.deleteMany({ where: { userId: { in: users } } });
            await prisma.user.deleteMany({ where: { id: { in: users } } });
        }
        if (previousSecret === undefined) delete process.env.JWT_SECRET_ACCESS;
        else process.env.JWT_SECRET_ACCESS = previousSecret;
    });

    it.each(areas)('%s abre páginas y crea/edita solicitudes sin descontar stock', async area => {
        const { cookie, departmentId } = sessions[area];
        for (const path of ['/salidas/materiales', '/salidas/consumibles', '/salidas/mermas',
            '/almacen/materiales', '/almacen/consumibles', '/almacen/mermas']) {
            const response = await request(app).get(path).set('Cookie', cookie).expect(200);
            expect(response.body.view).toMatch(/^pages\/warehouse\//);
        }
        for (const resource of ['materials', 'consumables', 'wastes']) {
            const before = await stockSnapshot();
            const payload = { ...header(departmentId), details: [detail(resource)] };
            const path = issuePath(resource);
            const created = await request(app).post(path).set('Cookie', cookie).send(payload).expect(resource === 'wastes' ? 201 : 200);
            const issue = created.body[resource === 'wastes' ? 'wasteIssue' : 'goodsIssue'];
            const edited = await request(app).patch(`${path}/${issue.id}`).set('Cookie', cookie)
                .send({ ...payload, projectNumber: 'ACC-101', details: [{ ...detail(resource), quantity: 3 }] }).expect(200);
            expect(edited.body[resource === 'wastes' ? 'wasteIssue' : 'goodsIssue'].details[0].quantity).toBe('3');
            await request(app).patch(`${path}/${issue.id}/header`).set('Cookie', cookie)
                .send({ ...header(departmentId), observations: 'Encabezado revisado' }).expect(200);
            const model = resource === 'wastes' ? prisma.wasteIssue : prisma.goodsIssue;
            const saved = await model.findUnique({ where: { id: issue.id }, include: { details: true, fulfillmentStatus: true } });
            expect(saved).toMatchObject({ observations: 'Encabezado revisado', departmentId, fulfillmentStatus: { name: 'Pendiente' } });
            expect(saved.details[0].quantity.toNumber()).toBe(3);
            expect(saved.details.every(row => !row.isSupplied)).toBe(true);
            const listed = await request(app).get(path).set('Cookie', cookie).query({ search: { value: issue.referenceNumber } }).expect(200);
            expect(listed.body.data.map(row => row.id)).toContain(issue.id);
            expect(listed.body.data.find(row => row.id === issue.id)).not.toHaveProperty('details');
            const retrieved = await request(app).get(`${path}/${issue.id}`).set('Cookie', cookie).expect(200);
            expect(retrieved.body[resource === 'wastes' ? 'wasteIssue' : 'goodsIssue'].details[0].id).toBe(saved.details[0].id);
            expect((await stockSnapshot()).slice(0, 2)).toEqual(before.slice(0, 2));
        }
    });

    it.each(areas)('%s consulta existencias y selectores sin recibir costos', async area => {
        const { cookie } = sessions[area];
        for (const resource of ['materials', 'consumables', 'wastes']) {
            const result = await request(app).get(`/api/warehouse/${resource}`).set('Cookie', cookie).query({ supplierId: ids.supplier }).expect(200);
            expect(result.body.data).toHaveLength(1);
            expect(result.body.data[0]).not.toHaveProperty('maxUnitCost');
            expect(result.body.data[0]).not.toHaveProperty('unitCost');
        }
        const suppliers = await request(app).get('/api/warehouse/suppliers').set('Cookie', cookie)
            .query({ onlyActive: true, search: { value: suffix } }).expect(200);
        expect(suppliers.body.data.map(row => row.id)).toContain(ids.supplier);
        const persons = await request(app).get('/api/admin/persons').set('Cookie', cookie)
            .query({ department: area, strictDepartmentFilter: true, search: { value: suffix } }).expect(200);
        expect(persons.body.data.map(row => row.id)).toContain(ids.requester);
        const clients = await request(app).get('/api/sales/clients').set('Cookie', cookie).query({ search: { value: suffix } }).expect(200);
        expect(clients.body.data.map(row => row.id)).toContain(ids.client);
    });

    it.each(['IMPRESIÓN', 'printingCoordinator'])('%s sólo consulta y registra salidas para su área, incluso con IDs o permisos manipulados', async sessionKey => {
        const { cookie } = sessions[sessionKey];
        const ownDepartmentId = sessions[areas[0]].departmentId;
        const foreignDepartmentId = sessions[areas[1]].departmentId;
        const before = await stockSnapshot();
        const departments = await request(app).get('/api/admin/departments').set('Cookie', cookie)
            .query({ context: 'issues' }).expect(200);
        expect(departments.body.data.map(row => row.id)).toEqual([ownDepartmentId]);
        expect(departments.body.recordsTotal).toBe(1);
        for (const resource of ['materials', 'consumables', 'wastes']) {
            const path = issuePath(resource);
            const model = resource === 'wastes' ? prisma.wasteIssue : prisma.goodsIssue;
            const where = { clientId: ids.client, ...(resource !== 'wastes' && { type: resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE' }) };
            const own = await model.findFirst({ where: { ...where, departmentId: ownDepartmentId }, include: { details: true } });
            const foreign = await model.findFirst({ where: { ...where, departmentId: foreignDepartmentId }, include: { details: true } });
            const result = await request(app).get(path).set('Cookie', cookie).query({ clientId: ids.client }).expect(200);
            expect(result.body.data.map(row => row.id)).toEqual([own.id]);
            expect(result.body.recordsTotal).toBe(1);
            expect(result.body.recordsFiltered).toBe(1);
            const outside = await request(app).get(path).set('Cookie', cookie)
                .query({ clientId: ids.client, departmentId: foreignDepartmentId }).expect(200);
            expect(outside.body).toMatchObject({ data: [], recordsTotal: 0, recordsFiltered: 0 });
            await request(app).get(`${path}/${foreign.id}`).set('Cookie', cookie).expect(404);
            const forged = { ...header(foreignDepartmentId), details: [detail(resource)],
                accesses: [{ roleKey: ROLE_KEYS.SYSTEM_ADMIN }], scope: { canReadAll: true } };
            await request(app).post(path).set('Cookie', cookie).send(forged).expect(403);
            for (const suffix of ['', '/header']) {
                await request(app).patch(`${path}/${foreign.id}${suffix}`).set('Cookie', cookie)
                    .send({ ...header(ownDepartmentId), details: [detail(resource)] }).expect(404);
                await request(app).patch(`${path}/${own.id}${suffix}`).set('Cookie', cookie).send(forged).expect(403);
            }
            expect(await model.findUnique({ where: { id: own.id }, include: { details: true } })).toEqual(own);
            expect(await model.findUnique({ where: { id: foreign.id }, include: { details: true } })).toEqual(foreign);
        }
        expect(await stockSnapshot()).toEqual(before);
    });

    it.each([ROLE_KEYS.AUXILIARY, ROLE_KEYS.COORDINATOR])('Almacén / %s consulta todas las áreas y registra solicitudes para otra área', async roleKey => {
        const { cookie } = sessions[roleKey];
        const departmentId = sessions[areas[1]].departmentId;
        const before = await stockSnapshot();
        const departments = await request(app).get('/api/admin/departments').set('Cookie', cookie)
            .query({ context: 'issues', length: '100' }).expect(200);
        expect(departments.body.data.map(row => row.id)).toEqual(expect.arrayContaining(areas.map(area => sessions[area].departmentId)));
        for (const resource of ['materials', 'consumables', 'wastes']) {
            const path = issuePath(resource);
            const result = await request(app).get(path).set('Cookie', cookie)
                .query({ clientId: ids.client, length: '100' }).expect(200);
            expect(new Set(result.body.data.map(row => row.departmentId))).toEqual(new Set(areas.map(area => sessions[area].departmentId)));
            const row = result.body.data.find(row => row.departmentId === departmentId);
            await request(app).get(`${path}/${row.id}`).set('Cookie', cookie).expect(200);
            const created = await request(app).post(path).set('Cookie', cookie)
                .send({ ...header(departmentId), details: [detail(resource)] }).expect(resource === 'wastes' ? 201 : 200);
            expect(created.body[resource === 'wastes' ? 'wasteIssue' : 'goodsIssue'].departmentId).toBe(departmentId);
        }
        expect((await stockSnapshot()).slice(0, 2)).toEqual(before.slice(0, 2));
    });

    it('rechaza surtido, devoluciones y cambios de inventario sin efectos persistidos', async () => {
        const { cookie } = sessions[areas[0]];
        const before = await stockSnapshot();
        for (const resource of ['materials', 'consumables', 'wastes']) {
            const path = issuePath(resource);
            const model = resource === 'wastes' ? prisma.wasteIssue : prisma.goodsIssue;
            const issue = await model.findFirst({ where: {
                clientId: ids.client,
                departmentId: sessions[areas[0]].departmentId,
                ...(resource !== 'wastes' && { type: resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE' })
            }, include: { details: true } });
            const detailId = issue.details[0].id;
            await request(app).patch(`${path}/${issue.id}/details`).set('Cookie', cookie)
                .send({ details: [{ id: detailId, isSupplied: true, projectConvertedQuantity: 3 }] }).expect(403);
            await request(app).patch(`${path}/${issue.id}/details/${detailId}/returns`).set('Cookie', cookie)
                .send({ returnQuantity: 1 }).expect(403);
            if (resource !== 'wastes') {
                await request(app).delete(`/api/warehouse/${resource}/${ids[resource]}`).set('Cookie', cookie).expect(403);
            }
            const saved = await model.findUnique({ where: { id: issue.id }, include: { details: true } });
            expect(saved.details.every(row => !row.isSupplied)).toBe(true);
            const inventoryPayload = {
                operationId: randomUUID(),
                name: `IT Access Rejected ${suffix}`, supplierId: ids.supplier,
                materialId: ids.materials, presentationId: ids.presentation, unitMeasureId: ids.unit,
                base: 1, height: 1, maxUnitCost: 1, [resource === 'wastes' ? 'initialQuantity' : 'newStock']: 1, isActive: true
            };
            await request(app).post(`/api/warehouse/${resource}`).set('Cookie', cookie).send(inventoryPayload).expect(403);
            const itemId = resource === 'wastes' ? ids.waste : ids[resource];
            await request(app).patch(`/api/warehouse/${resource}/${itemId}`).set('Cookie', cookie)
                .send({ expectedVersion: 0, expectedMaterialVersion: 0, name: inventoryPayload.name, supplierId: ids.supplier, maxUnitCost: 1, isActive: true }).expect(403);
            await request(app).patch(`/api/warehouse/${resource}/${itemId}/stock`).set('Cookie', cookie)
                .send({ expectedVersion: 0, newStock: 1, supplierId: ids.supplier, reasonId: randomUUID() }).expect(403);
        }
        await request(app).get('/api/warehouse/wastes/material-templates').set('Cookie', cookie)
            .query({ supplierId: ids.supplier }).expect(403);
        await request(app).get('/api/warehouse/reports/inventory/excel').set('Cookie', cookie).expect(403);
        await request(app).post(`/api/warehouse/wastes/${ids.waste}/stock-additions`).set('Cookie', cookie).send({ operationId: randomUUID(), quantity: 1 }).expect(403);
        await request(app).post('/api/warehouse/suppliers').set('Cookie', cookie)
            .send({ legalName: 'Proveedor rechazado', tradeName: 'Proveedor rechazado', isActive: true }).expect(403);
        expect(await stockSnapshot()).toEqual(before);
    });

    it('distingue sesión ausente de rol no autorizado sin crear documentos', async () => {
        const before = await stockSnapshot();
        for (const resource of ['materials', 'consumables', 'wastes']) {
            const path = issuePath(resource);
            const payload = { ...header(sessions[areas[0]].departmentId), details: [detail(resource)] };
            const unauthenticated = await request(app).post(path).send(payload).expect(401);
            expect(unauthenticated.body.code).toBe('INVALID_AUTH');
            const forbidden = await request(app).post(path).set('Cookie', ids.deniedCookie).send(payload).expect(403);
            expect(forbidden.body.code).toBe('FORBIDDEN');
            await request(app).get(`/api/warehouse/${resource}`).set('Cookie', ids.deniedCookie).expect(403);
        }
        const denied = await request(app).get('/salidas/materiales').set('Cookie', ids.deniedCookie).expect(302);
        expect(denied.headers.location).toBe('/error/404');
        expect(await stockSnapshot()).toEqual(before);
    });
});
