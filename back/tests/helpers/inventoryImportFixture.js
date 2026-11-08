import { randomUUID } from 'node:crypto';
import ExcelJS from 'exceljs';
import { getImportConfig } from '../../src/services/warehouse/imports/inventoryImportConfig.js';
import { INVENTORY_IMPORT_FORMAT } from '../../src/shared/constants/inventoryImport.js';
import { PERMISSIONS } from '../../src/shared/constants/permissions.js';
import { ROLE_KEYS } from '../../src/constants/roles.js';
import { DEPARTMENT_KEYS } from '../../src/constants/departments.js';

export const writeInventoryWorkbook = async workbook => {
    // XLSX puede omitir sheetFormatPr. ExcelJS pierde su valor por defecto al leerlo
    // y luego escribiría un sheetFormatPr inválido sin defaultRowHeight.
    for (const sheet of workbook.worksheets) sheet.properties.defaultRowHeight ??= 15;
    return Buffer.from(await workbook.xlsx.writeBuffer());
};

export const inventoryWorkbook = async ({ resource = 'materials', mode = 'create', rows, alter }) => {
    const workbook = new ExcelJS.Workbook();
    const config = getImportConfig(resource, mode);
    const sheet = workbook.addWorksheet('Datos');
    sheet.addRow(config.columns.map(([header]) => header));
    for (const row of rows) sheet.addRow(config.columns.map(([, key]) => row[key] ?? ''));
    const instructions = workbook.addWorksheet('Instrucciones');
    instructions.getCell('B1').value = INVENTORY_IMPORT_FORMAT;
    instructions.getCell('B2').value = resource;
    instructions.getCell('B3').value = mode;
    workbook.addWorksheet('Catalogos');
    alter?.(workbook);
    return writeInventoryWorkbook(workbook);
};

export const createInventoryImportFixture = async prisma => {
    const suffix = randomUUID().slice(0, 8);
    const role = await prisma.role.upsert({ where: { name: 'Administrador del sistema' }, update: {},
        create: { name: 'Administrador del sistema', key: ROLE_KEYS.SYSTEM_ADMIN } });
    const department = await prisma.department.upsert({ where: { name: 'SISTEMAS' }, update: {},
        create: { name: 'SISTEMAS', key: DEPARTMENT_KEYS.SYSTEMS } });
    const user = await prisma.user.create({ data: { name: `Import ${suffix}`, password: 'test-fixture',
        accesses: { create: { roleId: role.id, departmentId: department.id } } } });
    const deniedRole = await prisma.role.create({ data: { name: `Import denied ${suffix}` } });
    const denied = await prisma.user.create({ data: { name: `Import denied ${suffix}`, password: 'test-fixture',
        accesses: { create: { roleId: deniedRole.id, departmentId: department.id } } } });
    const presentation = await prisma.presentation.create({ data: { name: `Import ${suffix}` } });
    const unit = await prisma.unitMeasure.create({ data: { name: 'METRO CUADRADO', symbol: suffix } });
    const suppliers = [];
    for (let index = 0; index < 2; index++) suppliers.push(await prisma.supplier.create({ data: {
        code: `${suffix}${index}`, codeNumber: Date.now() % 100000000 + index, legalName: suffix, tradeName: suffix
    } }));
    await prisma.stockAdjustmentReason.upsert({ where: { name: 'Stock inicial' }, update: {}, create: { name: 'Stock inicial' } });
    const row = (name, overrides = {}) => ({ name: `${name} ${suffix}`, supplierCode: suppliers[0].code,
        presentationName: presentation.name, unitLabel: `${unit.symbol} · ${unit.name}`,
        minStock: 1, maxUnitCost: 10, isActive: 'SI', base: 2, height: 3, newStock: 2, ...overrides });
    const extraPresentations = [];
    const cleanup = async () => {
        const supplierIds = suppliers.map(item => item.id);
        const userIds = [user.id, denied.id];
        const ownedMaterials = await prisma.supplierMaterial.findMany({ where: { supplierId: { in: supplierIds } }, select: { materialId: true } });
        await prisma.criticalWriteAudit.deleteMany({ where: { actorId: { in: userIds } } });
        const adjustments = await prisma.stockAdjustment.findMany({ where: { createdById: user.id }, select: { id: true } });
        const adjustmentIds = adjustments.map(item => item.id);
        const wasteEntries = await prisma.wasteStockEntry.findMany({ where: { createdById: user.id }, select: { wasteMovementId: true } });
        const movementIds = wasteEntries.map(item => item.wasteMovementId);
        await prisma.wasteStockEntry.deleteMany({ where: { createdById: user.id } });
        await prisma.wasteMovementDetail.deleteMany({ where: { movementId: { in: movementIds } } });
        await prisma.wasteMovement.deleteMany({ where: { id: { in: movementIds } } });
        await prisma.waste.deleteMany({ where: { supplierId: { in: supplierIds } } });
        await prisma.movementDetail.deleteMany({ where: { supplierId: { in: supplierIds } } });
        await prisma.inventoryMovement.deleteMany({ where: { stockAdjustmentId: { in: adjustmentIds } } });
        await prisma.stockAdjustmentDetail.deleteMany({ where: { stockAdjustmentId: { in: adjustmentIds } } });
        await prisma.stockAdjustment.deleteMany({ where: { id: { in: adjustmentIds } } });
        await prisma.supplierMaterial.deleteMany({ where: { supplierId: { in: supplierIds } } });
        await prisma.material.deleteMany({ where: { OR: [{ presentationId: presentation.id }, { id: { in: ownedMaterials.map(item => item.materialId) } }] } });
        await prisma.inventoryImport.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.userRoleDepartment.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
        await prisma.role.delete({ where: { id: deniedRole.id } });
        await prisma.supplier.deleteMany({ where: { id: { in: supplierIds } } });
        await prisma.presentation.delete({ where: { id: presentation.id } });
        await prisma.presentation.deleteMany({ where: { id: { in: extraPresentations } } });
        await prisma.unitMeasure.delete({ where: { id: unit.id } });
    };
    return { suffix, user: { ...user, permissions: Object.values(PERMISSIONS) }, denied, presentation, unit, suppliers, row, cleanup, extraPresentations };
};
