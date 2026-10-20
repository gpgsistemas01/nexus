import { ROLE_KEYS } from '../../../src/constants/roles.js';
import { DEPARTMENT_KEYS } from '../../../src/constants/departments.js';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';

const suffix = randomUUID().slice(0, 8);
const parentId = randomUUID();
const relationId = randomUUID();
const editData = { name: 'Registro de prueba', isActive: true, expectedVersion: 0 };
const materialData = { ...editData, supplierId: relationId, maxUnitCost: 10, expectedMaterialVersion: 0 };
const stockData = { supplierId: relationId, reasonId: relationId, newStock: 1, expectedVersion: 0 };
const compositeOrder = {
  userRoleDepartment: [{ userId: 'asc' }, { roleId: 'asc' }, { departmentId: 'asc' }],
  wasteOperation: [{ userId: 'asc' }, { operationId: 'asc' }]
};
let prisma;
let app;
let userId;
let cookie;
let previousSecret;
let personData;
let userData;
let initialState;

const readState = () => prisma.$transaction([
  'material', 'supplierMaterial', 'waste', 'supplier', 'person', 'user', 'userRoleDepartment',
  'inventoryMovement', 'wasteOperation', 'goodsIssue', 'goodsIssueDetail',
  'goodsReceipt', 'goodsReceiptDetail', 'wasteIssue', 'wasteIssueDetail'
].map(model => prisma[model].findMany({
  orderBy: compositeOrder[model] || { id: 'asc' }
})));

describe('identificadores de ruta resueltos por el servicio y errores de captura separados', () => {
  beforeAll(async () => {
    previousSecret = process.env.JWT_SECRET_ACCESS;
    process.env.JWT_SECRET_ACCESS = randomUUID();
    ({ prisma } = await import('../../../src/lib/prisma.js'));
    const { registerApiRoutes } = await import('../../../src/routes/api/index.js');
    const role = await prisma.role.upsert({
      where: { name: 'Administrador del sistema' }, update: {}, create: { name: 'Administrador del sistema', key: ROLE_KEYS.SYSTEM_ADMIN }
    });
    const department = await prisma.department.upsert({
      where: { name: 'SISTEMAS' }, update: {}, create: { name: 'SISTEMAS', key: DEPARTMENT_KEYS.SYSTEMS }
    });
    personData = { fullName: 'Persona de prueba', accesses: [{ roleId: role.id, departmentId: department.id }], expectedVersion: 0 };
    userData = { name: 'itvalidation', roleId: role.id, departmentId: department.id, expectedVersion: 0 };
    userId = (await prisma.user.create({ data: {
      name: `IT Validation ${suffix}`, password: 'integration-only',
      accesses: { create: { roleId: role.id, departmentId: department.id } }
    } })).id;
    cookie = `accessToken=${jwt.sign({ id: userId }, process.env.JWT_SECRET_ACCESS, { expiresIn: '10m' })}`;
    app = createControllerTestApp({ registerRoutes: router => {
      router.use(cookieParser());
      registerApiRoutes(router);
    } });
    initialState = await readState();
  });

  afterAll(async () => {
    if (userId) {
      await prisma.userRoleDepartment.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    }
    if (previousSecret === undefined) delete process.env.JWT_SECRET_ACCESS;
    else process.env.JWT_SECRET_ACCESS = previousSecret;
  });

  it.each([
    ['patch', '/warehouse/materials/invalid', () => materialData],
    ['patch', '/warehouse/materials/invalid/stock', () => stockData],
    ['delete', '/warehouse/materials/invalid', () => ({})],
    ['patch', '/warehouse/consumables/invalid', () => materialData],
    ['patch', '/warehouse/consumables/invalid/stock', () => stockData],
    ['delete', '/warehouse/consumables/invalid', () => ({})],
    ['patch', '/warehouse/wastes/invalid', () => ({ ...editData, maxUnitCost: 10 })],
    ['patch', '/warehouse/wastes/invalid/stock', () => stockData],
    ['post', '/warehouse/wastes/invalid/stock-additions', () => ({ operationId: randomUUID(), quantity: 1 })],
    ['put', '/warehouse/suppliers/invalid', () => ({ legalName: 'Proveedor de prueba', tradeName: 'Proveedor', isActive: true, expectedVersion: 0 })],
    ['patch', '/admin/users/invalid', () => userData],
    ['patch', '/admin/users/invalid/password', () => ({ password: 'Almacen1!', expectedVersion: 0 })],
    ['put', '/admin/persons/invalid', () => personData],
    ['put', '/admin/catalogs/roles/invalid', () => editData],
    ['put', '/sales/clients/invalid', () => editData]
  ])('%s %s devuelve un código global sin simular un campo del formulario', async (method, path, getBody) => {
    const response = await request(app)[method](`/api${path}`).set('Cookie', cookie).send(getBody()).expect(400);

    expect(response.body).toMatchObject({ code: 'RECORD_ID_INVALID' });
    expect(response.body).not.toHaveProperty('errors');
    expect(response.body.message).not.toMatch(/Prisma|SQL|invalid input|22P02/);
    expect(await readState()).toEqual(initialState);
  });

  it.each([
    ['goods-issues/materials', 'returns'],
    ['goods-issues/consumables', 'returns'],
    ['waste-issues', 'returns'],
    ['goods-receipts/materials', 'corrections'],
    ['goods-receipts/consumables', 'corrections'],
    ['goods-receipts/materials', 'cancel'],
    ['goods-receipts/consumables', 'cancel']
  ])('%s rechaza el identificador de partida en %s', async (resource, action) => {
    const response = await request(app).patch(`/api/warehouse/${resource}/${parentId}/details/invalid/${action}`)
      .set('Cookie', cookie).send({ returnQuantity: 1, quantity: 1, costPerUnitType: 1 }).expect(400);
    expect(response.body).toMatchObject({ code: 'RECORD_ID_INVALID' });
    expect(response.body).not.toHaveProperty('errors');
    expect(await readState()).toEqual(initialState);
  });

  it.each(['goods-issues/materials', 'goods-issues/consumables', 'goods-receipts/materials', 'goods-receipts/consumables', 'waste-issues'])(
    '%s conserva el código global al consultar un documento con UUID mal formado', async resource => {
      const response = await request(app).get(`/api/warehouse/${resource}/invalid`).set('Cookie', cookie).expect(400);

      expect(response.body.code).toBe('RECORD_ID_INVALID');
      expect(response.body).not.toHaveProperty('errors');
    }
  );

  it.each([
    ['put', '/sales/clients', () => editData, 'CLIENT_NOT_FOUND'],
    ['put', '/admin/persons', () => personData, 'PERSON_NOT_FOUND'],
    ['put', '/admin/catalogs/roles', () => editData, 'CATALOG_ENTRY_NOT_FOUND'],
    ['patch', '/warehouse/wastes', () => ({ ...editData, maxUnitCost: 10 }), 'WASTE_NOT_FOUND']
  ])('%s %s conserva el error de dominio para un UUID que no existe', async (method, path, getBody, code) => {
    const response = await request(app)[method](`/api${path}/${randomUUID()}`).set('Cookie', cookie).send(getBody()).expect(404);

    expect(response.body.code).toBe(code);
    expect(await readState()).toEqual(initialState);
  });

  it('rechaza los inputs inválidos antes de intentar resolver el registro', async () => {
    const response = await request(app).put('/api/sales/clients/invalid').set('Cookie', cookie)
      .send({ ...editData, name: '' }).expect(400);

    expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR', errors: { name: { code: 'NAME_REQUIRED' } } });
    expect(response.body.errors).not.toHaveProperty('id');
    expect(await readState()).toEqual(initialState);
  });

  it.each([
    ['put', '/sales/clients', () => ({ ...editData, name: 123 }), 'name', 'NAME_INVALID_TYPE'],
    ['put', '/sales/clients', () => ({ ...editData, isActive: [true] }), 'isActive', 'ACTIVE_INVALID_BOOLEAN'],
    ['put', '/admin/persons', () => ({ ...personData, accesses: [null] }), 'accesses', 'PERSON_ACCESSES_INVALID_FORMAT'],
    ['put', '/admin/persons', () => ({ ...personData, accesses: [{ ...personData.accesses[0], roleId: [relationId] }] }), 'accesses[0].roleId', 'PERSON_ACCESSES_INVALID_ROLE'],
    ['patch', '/warehouse/materials', () => ({ ...stockData, newStock: [2] }), 'newStock', 'NEW_STOCK_INVALID_NUMBER'],
    ['patch', '/warehouse/materials', () => ({ ...stockData, newStock: '1.001' }), 'newStock', 'NEW_STOCK_TOO_LONG'],
    ['patch', '/warehouse/materials', () => ({ ...stockData, creationContext: 'goodsReceipt', newStock: 'valor-ignorado' }), 'newStock', 'NEW_STOCK_INVALID_NUMBER'],
    ['patch', '/warehouse/consumables', () => ({ ...materialData, creationContext: 'goodsReceipt', maxUnitCost: 'valor-ignorado' }), 'maxUnitCost', 'MAX_UNIT_COST_INVALID_NUMBER'],
    ['patch', '/warehouse/wastes', () => ({ ...editData, maxUnitCost: 10, minStock: '1.001' }), 'minStock', 'MIN_STOCK_TOO_LONG'],
    ['put', '/sales/clients', () => ({ ...editData, expectedVersion: [0] }), 'expectedVersion', 'RECORD_VERSION_REQUIRED']
  ])('%s %s rechaza tipos o precisión inválidos sin modificar datos (DP-VAL-004)', async (method, path, data, field, code) => {
    const suffix = path === '/warehouse/materials' ? `/${parentId}/stock` : `/${parentId}`;
    const response = await request(app)[method](`/api${path}${suffix}`).set('Cookie', cookie).send(data()).expect(400);
    expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR', errors: { [field]: { code } } });
    expect(await readState()).toEqual(initialState);
  });

  it('rechaza una fecha imposible de recepción antes de resolver personas o proveedor (DP-VAL-004)', async () => {
    const response = await request(app).post('/api/warehouse/goods-receipts/materials').set('Cookie', cookie).send({
      supplierId: relationId, receivedById: relationId, isInvoiced: false,
      receptionDate: '2026-02-30T12:00:00Z', details: [{ materialId: relationId, quantity: 1, costPerUnitType: 1 }]
    }).expect(400);
    expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR', errors: { receptionDate: { code: 'RECEPTION_DATE_INVALID_FORMAT' } } });
    expect(await readState()).toEqual(initialState);
  });

  it('resuelve el catálogo permitido en el servicio y rechaza el resto sin escribir', async () => {
    const response = await request(app).put(`/api/admin/catalogs/users/${parentId}`).set('Cookie', cookie).send(editData).expect(404);

    expect(response.body.code).toBe('CATALOG_NOT_FOUND');
    expect(await readState()).toEqual(initialState);
  });

  it.each(['goods-issues/materials', 'goods-issues/consumables', 'waste-issues'])(
    '%s conserva el 400 por campo para reglas personalizadas antes de resolver la salida', async resource => {
      const response = await request(app).patch(`/api/warehouse/${resource}/${parentId}/details`)
        .set('Cookie', cookie).send({ details: [{ id: relationId, projectConvertedQuantity: 2.5, isSupplied: 'invalid' }] }).expect(400);

      expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR', errors: { [relationId]: { isSupplied: { code: 'SUPPLIED_INVALID_BOOLEAN' } } } });
      expect(await readState()).toEqual(initialState);
    }
  );
});
