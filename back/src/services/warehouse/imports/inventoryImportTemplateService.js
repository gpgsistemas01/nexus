import { getDb } from '../../../repository/baseRepository.js';
import { UUID_V4_PATTERN } from '../../../shared/constants/inputValidation.js';
import { INVENTORY_IMPORT_LIMITS as limits, INVENTORY_IMPORT_MODES as modes } from '../../../shared/constants/inventoryImport.js';
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
        || typeof search !== 'string' || search.length > limits.maxSearchLength || !/^[1-9]\d*$/.test(rawPage)
        || Number(rawPage) > limits.maxTemplatePage) throw new InventoryImportError();
    const page = Number(rawPage);
    const db = getDb();
    const catalogs = { suppliers: [], presentations: [], units: [], materials: [], reasons: [] };
    let rows = [];
    if (config.mode !== modes.CREATE) {
        const referenceFields = item => ({ currentStock: Number(item.currentStock), convertedQuantity: Number(item.convertedQuantity),
            base: (item.material ?? item).base == null ? '' : Number((item.material ?? item).base),
            height: (item.material ?? item).height == null ? '' : Number((item.material ?? item).height),
            newStock: '', reasonId: '', observations: '',
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
                ...referenceFields(item),
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
                ...referenceFields(item),
                minStock: Number(item.material.minStock), maxUnitCost: !user.permissions.includes(PERMISSIONS.INVENTORY_COSTS_READ) || item.maxUnitCost == null ? '' : Number(item.maxUnitCost),
                isActive: item.isActive ? 'SI' : 'NO'
            }));
        }
        if (!rows.length) throw new InventoryImportError('VALIDATION', { hint: 'No hay registros en esa página de la consulta.' });
        if (config.mode === modes.ADJUST) {
            catalogs.reasons = (await db.stockAdjustmentReason.findMany({ where: { isActive: true },
                orderBy: { name: 'asc' }, take: limits.maxCatalogRows })).map(item => `${item.id} | ${item.name}`);
        }
    }
    if (config.mode === modes.CREATE) {
        catalogs.suppliers = await db.supplier.findMany({ where: { isActive: true, ...(supplierId && { id: supplierId }) },
            orderBy: { code: 'asc' }, take: limits.maxCatalogRows, select: { code: true, tradeName: true } });
        if (resource === 'wastes') {
            if (!supplierId) throw new InventoryImportError('VALIDATION', { hint: 'Selecciona un proveedor para descargar la plantilla de mermas.' });
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
