import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import XLSX from 'xlsx';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';

const suffix = randomUUID().slice(0, 8);
const materialCount = 5005;
const ids = {};
const offers = [];
let prisma;
let app;
let adminCookie;
let deniedCookie;
let previousSecret;

const readReport = async query => {
  const response = await request(app).get('/reports/inventory/excel').set('Cookie', adminCookie).query(query)
    .buffer(true).parse((res, callback) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => callback(null, Buffer.concat(chunks)));
    }).expect(200);
  const workbook = XLSX.read(response.body, { type: 'buffer' });
  return { response, rows: XLSX.utils.sheet_to_json(workbook.Sheets.Inventario, { header: 1, defval: null }) };
};

describe('exportación paginada de inventario', () => {
  beforeAll(async () => {
    previousSecret = process.env.JWT_SECRET_ACCESS;
    process.env.JWT_SECRET_ACCESS = randomUUID();
    prisma = (await import('../../../src/lib/prisma.js')).prisma;
    const router = (await import('../../../src/routes/api/warehouse/reportApiRoute.js')).default;
    app = createControllerTestApp({ registerRoutes: app => {
      app.use(cookieParser());
      app.use('/reports', router);
    } });
    const role = await prisma.role.upsert({ where: { name: 'Administrador del sistema' }, update: {}, create: { name: 'Administrador del sistema' } });
    const department = await prisma.department.upsert({ where: { name: 'SISTEMAS' }, update: {}, create: { name: 'SISTEMAS' } });
    ids.admin = (await prisma.user.create({ data: { name: `IT STREAM A ${suffix}`, password: 'integration-only',
      accesses: { create: { roleId: role.id, departmentId: department.id } } } })).id;
    ids.deniedRole = (await prisma.role.create({ data: { name: `IT STREAM Denied ${suffix}` } })).id;
    ids.denied = (await prisma.user.create({ data: { name: `IT STREAM D ${suffix}`, password: 'integration-only',
      accesses: { create: { roleId: ids.deniedRole, departmentId: department.id } } } })).id;
    adminCookie = `accessToken=${jwt.sign({ id: ids.admin }, process.env.JWT_SECRET_ACCESS, { expiresIn: '10m' })}`;
    deniedCookie = `accessToken=${jwt.sign({ id: ids.denied }, process.env.JWT_SECRET_ACCESS, { expiresIn: '10m' })}`;
    ids.presentation = (await prisma.presentation.create({ data: { name: `IT STREAM ${suffix}` } })).id;
    ids.unit = (await prisma.unitMeasure.create({ data: { name: `IT STREAM ${suffix}`, symbol: 'm²' } })).id;
    ids.supplier = (await prisma.supplier.create({ data: { codeNumber: Date.now() % 100000000,
      code: suffix, tradeName: `IT STREAM ${suffix}`, legalName: `IT STREAM ${suffix}` } })).id;
    const materials = Array.from({ length: materialCount }, (_, index) => {
      const id = randomUUID();
      const type = index % 2 ? 'CONSUMABLE' : 'MATERIAL';
      offers.push({ id: randomUUID(), materialId: id, supplierId: ids.supplier,
        currentStock: index >= materialCount - 2 ? 0 : index + 1, convertedQuantity: index + 0.5,
        maxUnitCost: 1.234567, isActive: index < materialCount - 4, type, base: index + 0.25 });
      return { id, name: `IT STREAM ${suffix}`, base: index + 0.25, height: 2, minStock: 3,
        presentationId: ids.presentation, unitMeasureId: ids.unit, type };
    });
    await prisma.material.createMany({ data: materials });
    await prisma.supplierMaterial.createMany({ data: offers.map(({ type, base, ...offer }) => offer) });
  });

  afterAll(async () => {
    if (ids.supplier) await prisma.supplierMaterial.deleteMany({ where: { supplierId: ids.supplier } });
    if (ids.presentation) await prisma.material.deleteMany({ where: { presentationId: ids.presentation } });
    if (ids.supplier) await prisma.supplier.delete({ where: { id: ids.supplier } });
    if (ids.presentation) await prisma.presentation.delete({ where: { id: ids.presentation } });
    if (ids.unit) await prisma.unitMeasure.delete({ where: { id: ids.unit } });
    const userIds = [ids.admin, ids.denied].filter(Boolean);
    await prisma.userRoleDepartment.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    if (ids.deniedRole) await prisma.role.delete({ where: { id: ids.deniedRole } });
    if (previousSecret === undefined) delete process.env.JWT_SECRET_ACCESS;
    else process.env.JWT_SECRET_ACCESS = previousSecret;
  });

  it('exporta más de un bloque sin omitir ni repetir nombres iguales, y no modifica existencias', async () => {
    const before = await prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier }, orderBy: { id: 'asc' } });
    const { response, rows } = await readReport({ search: suffix });
    const expected = offers.filter(row => row.isActive || row.currentStock !== 0).sort((a, b) => a.id.localeCompare(b.id));

    expect(rows[0]).toEqual(['Proveedor', 'Material', 'Base', 'Altura', 'Stock actual', 'Stock mínimo', 'Presentación', 'Conversión', 'Unidad', 'Costo unitario']);
    expect(rows.slice(1).map(row => row[4])).toEqual(expected.map(row => row.currentStock));
    expect(rows.slice(1).map(row => row[2])).toEqual(expected.map(row => row.base));
    expect(rows[1][9]).toBe(1.234567);
    expect(response.headers['content-disposition']).toContain('reporte_inventario_materiales');
    expect(await prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier }, orderBy: { id: 'asc' } })).toEqual(before);
  });

  it.each(['active', 'inStock'])('conserva el alcance %s, el tipo y el orden descendente por medida', async inventoryScope => {
    const type = inventoryScope === 'active' ? 'CONSUMABLE' : undefined;
    const { rows } = await readReport({ search: suffix, inventoryScope, type,
      'order[0][column]': 1, 'order[0][dir]': 'desc' });
    const expected = offers.filter(row => (inventoryScope === 'active' ? row.isActive : row.currentStock !== 0)
      && (!type || row.type === type)).sort((a, b) => b.base - a.base);
    expect(rows.slice(1).map(row => row[2])).toEqual(expected.map(row => row.base));
  });

  it('conserva encabezados para una búsqueda sin resultados', async () => {
    const { rows } = await readReport({ search: `not-found-${suffix}` });
    expect(rows).toHaveLength(1);
  });

  it('mantiene autenticación y autorización antes de generar un archivo', async () => {
    await request(app).get('/reports/inventory/excel').expect(401);
    await request(app).get('/reports/inventory/excel').set('Cookie', deniedCookie).expect(403);
  });
});
