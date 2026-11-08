import { getDb } from '../../../repository/baseRepository.js';
import { UUID_V4_PATTERN } from '../../../shared/constants/inputValidation.js';
import { INVENTORY_IMPORT_LIMITS as limits } from '../../../shared/constants/inventoryImport.js';
import { InventoryImportError } from '../../../errors/warehouse/inventoryImportError.js';
import { findWasteMaterialTemplates } from '../wastes/wasteMaterialService.js';
import { authorizeInventoryImport, importUnitLabel } from './inventoryImportConfig.js';
import { processInventoryWorkbook } from './inventoryWorkbookService.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

export const createInventoryImportTemplate = async ({ user, resource, mode, query = {}, signal }) => {
    const config = authorizeInventoryImport(user, resource, mode);
    const supplierId = query.supplierId || undefined;
    const search = query.search ?? '';
    const rawPage = String(query.page ?? 1);
    if ((supplierId && (typeof supplierId !== 'string' || !UUID_V4_PATTERN.test(supplierId)))
        || typeof search !== 'string' || search.length > 200 || !/^[1-9]\d{0,2}$/.test(rawPage)) throw new InventoryImportError();
    const page = Number(rawPage);
    const db = getDb();
    const catalogs = { suppliers: [], presentations: [], units: [], materials: [], reasons: [] };
    let rows = [];
    const decimal = value => value == null ? '' : Number(value);
    const mixedFields = item => ({ operation: 'Conservar', currentStock: Number(item.currentStock), newStock: '', reasonId: '', observations: '',
        supplierCode: item.supplier.code, supplierName: item.supplier.tradeName,
        presentationName: (item.material ?? item).presentation.name, unitLabel: importUnitLabel((item.material ?? item).unitMeasure),
        base: decimal((item.material ?? item).base), height: decimal((item.material ?? item).height),
        materialId: item.sourceMaterialId ?? '', coneWeightKg: decimal(item.coneWeightKg), totalWeightKg: decimal(item.totalWeightKg),
        referenceRollTotalWeightKg: decimal(item.referenceRollTotalWeightKg) });
    if (config.mode !== 'create') {
        const countFields = item => ({ currentStock: Number(item.currentStock), newStock: '', reasonId: '', observations: '',
            supplierName: item.supplier.tradeName, presentationName: (item.material ?? item).presentation.name,
            unitLabel: importUnitLabel((item.material ?? item).unitMeasure) });
        const where = { ...(supplierId && { supplierId }), ...(search && {
            ...(resource === 'wastes' ? { name: { contains: search, mode: 'insensitive' } }
                : { material: { name: { contains: search, mode: 'insensitive' }, type: config.type } })
        }) };
        if (resource === 'wastes') {
            rows = (await db.waste.findMany({ where, skip: (page - 1) * limits.maxRows,
                take: limits.maxRows, orderBy: [{ name: 'asc' }, { id: 'asc' }],
                include: { supplier: true, presentation: true, unitMeasure: true } })).map(item => ({
                id: item.id, expectedVersion: item.version, name: item.name,
                ...(config.mode === 'adjust' && countFields(item)),
                ...(config.mode === 'mixed' && mixedFields(item)),
                minStock: Number(item.minStock), maxUnitCost: !user.permissions.includes(PERMISSIONS.INVENTORY_COSTS_READ) || item.maxUnitCost == null ? '' : Number(item.maxUnitCost),
                isActive: item.isActive ? 'SI' : 'NO'
            }));
        } else {
            where.material = { ...where.material, type: config.type };
            rows = (await db.supplierMaterial.findMany({ where, skip: (page - 1) * limits.maxRows,
                take: limits.maxRows, orderBy: [{ material: { name: 'asc' } }, { materialId: 'asc' }, { supplierId: 'asc' }],
                include: { material: { include: { presentation: true, unitMeasure: true } }, supplier: true } })).map(item => ({
                id: item.materialId, supplierId: item.supplierId, expectedVersion: item.version,
                expectedMaterialVersion: item.material.version, name: item.material.name,
                ...(config.mode === 'adjust' && countFields(item)),
                ...(config.mode === 'mixed' && mixedFields(item)),
                minStock: Number(item.material.minStock), maxUnitCost: !user.permissions.includes(PERMISSIONS.INVENTORY_COSTS_READ) || item.maxUnitCost == null ? '' : Number(item.maxUnitCost),
                isActive: item.isActive ? 'SI' : 'NO'
            }));
        }
        if (!rows.length && config.mode !== 'mixed') throw new InventoryImportError('VALIDATION', { hint: 'No hay registros en esa página de la consulta.' });
        if (['adjust', 'mixed'].includes(config.mode)) {
            catalogs.reasons = (await db.stockAdjustmentReason.findMany({ where: { isActive: true },
                orderBy: { name: 'asc' }, take: limits.maxCatalogRows })).map(item => `${item.id} | ${item.name}`);
        }
    }
    if (['create', 'mixed'].includes(config.mode)) {
        catalogs.suppliers = await db.supplier.findMany({ where: { isActive: true, ...(supplierId && { id: supplierId }) },
            orderBy: { code: 'asc' }, take: limits.maxCatalogRows, select: { code: true, tradeName: true } });
        if (resource === 'wastes') {
            if (!supplierId && config.mode === 'create') throw new InventoryImportError('VALIDATION', { hint: 'Selecciona un proveedor para descargar la plantilla de mermas.' });
            if (supplierId) {
                const references = await findWasteMaterialTemplates({ supplierId, search, take: limits.maxCatalogRows });
                catalogs.materials = references.data.map(material => `${material.id} | ${material.name} | ${material.base ?? ''} × ${material.height ?? ''} | ${material.presentation.name}`);
            }
        } else {
            catalogs.presentations = await db.presentation.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, take: limits.maxCatalogRows, select: { name: true } });
            catalogs.units = (await db.unitMeasure.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, take: limits.maxCatalogRows, select: { name: true, symbol: true } })).map(importUnitLabel);
        }
    }
    return processInventoryWorkbook({ action: 'template', config, rows, catalogs }, signal);
};
