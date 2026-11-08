import { UUID_V4_PATTERN } from '../../../shared/constants/inputValidation.js';
import { importUnitLabel } from './inventoryImportConfig.js';
import { findInitialStockAdjustmentReason } from '../reasonService.js';
import { INVENTORY_IMPORT_LIMITS } from '../../../shared/constants/inventoryImport.js';
import { InventoryImportError } from '../../../errors/warehouse/inventoryImportError.js';

export const importText = value => String(value ?? '').trim();
export const importKey = value => importText(value).toLowerCase();
export const importReferenceId = value => importText(value).split(' | ')[0];
export const materialImportIdentity = value => JSON.stringify([
    importKey(value.name), value.type, value.presentationId, value.unitMeasureId,
    value.base == null ? null : Number(value.base), value.height == null ? null : Number(value.height)
]);
export const wasteImportIdentity = value => JSON.stringify([
    value.supplierId, value.name, Number(value.base), Number(value.height),
    value.coneWeightKg == null ? null : Number(value.coneWeightKg), value.totalWeightKg == null ? null : Number(value.totalWeightKg)
]);
const unique = values => [...new Set(values.filter(Boolean))];
const ids = values => unique(values.map(importReferenceId).filter(value => UUID_V4_PATTERN.test(value)));
const catalogLimit = INVENTORY_IMPORT_LIMITS.maxRows * 2;
const bounded = rows => {
    if (rows.length > catalogLimit) throw new InventoryImportError('LIMIT');
    return rows;
};

export const loadInventoryImportContext = async ({ db, config, rows }) => {
    const values = rows.map(row => row.values);
    const supplierCodes = unique(values.map(row => importText(row.supplierCode)).filter(Boolean));
    const supplierIds = ids(values.map(row => row.supplierId));
    const suppliers = bounded(await db.supplier.findMany({ take: catalogLimit + 1, where: { OR: [
        { id: { in: supplierIds } }, { code: { in: supplierCodes, mode: 'insensitive' } }
    ] } }));
    const context = {
        suppliers: new Map(suppliers.map(row => [row.id, row])),
        supplierCodes: new Map(),
        presentations: new Map(), units: new Map(), offers: new Map(), wastes: new Map(),
        identities: new Map()
    };
    for (const row of suppliers) {
        const key = importKey(row.code);
        context.supplierCodes.set(key, context.supplierCodes.has(key) ? null : row);
    }
    if (config.mode === 'create' && config.resource !== 'wastes') {
        const names = unique(values.map(row => importText(row.presentationName)).filter(Boolean));
        const presentationIds = ids(values.map(row => row.presentationId));
        const presentations = bounded(await db.presentation.findMany({ take: catalogLimit + 1, where: { isActive: true, OR: [
            { id: { in: presentationIds } }, { name: { in: names, mode: 'insensitive' } }
        ] } }));
        const unitIds = ids(values.map(row => row.unitMeasureId));
        const unitNames = unique(values.map(row => {
            const label = importText(row.unitLabel);
            const separator = label.indexOf(' · ');
            return separator < 0 ? label : label.slice(separator + 3);
        }).filter(Boolean));
        const units = bounded(await db.unitMeasure.findMany({ take: catalogLimit + 1, where: { isActive: true, OR: [
            { id: { in: unitIds } }, { name: { in: unitNames, mode: 'insensitive' } }
        ] } }));
        context.presentations = new Map(presentations.map(row => [row.id, row]));
        context.units = new Map(units.map(row => [row.id, row]));
        context.presentationNames = new Map();
        context.unitLabels = new Map();
        for (const row of presentations) {
            const key = importKey(row.name);
            context.presentationNames.set(key, context.presentationNames.has(key) ? null : row);
        }
        for (const row of units) {
            const key = importKey(importUnitLabel(row));
            context.unitLabels.set(key, context.unitLabels.has(key) ? null : row);
        }
        const identities = values.flatMap(row => {
            const presentationId = row.presentationId || context.presentationNames.get(importKey(row.presentationName))?.id;
            const unitMeasureId = row.unitMeasureId || context.unitLabels.get(importKey(row.unitLabel))?.id;
            const base = row.base === '' || row.base == null ? null : Number(row.base);
            const height = row.height === '' || row.height == null ? null : Number(row.height);
            if (!presentationId || !unitMeasureId || !Number.isFinite(base ?? 0) || !Number.isFinite(height ?? 0)) return [];
            return [{ name: { equals: importText(row.name), mode: 'insensitive' }, presentationId, unitMeasureId,
                type: config.type, base, height }];
        });
        if (identities.length) {
            const materials = bounded(await db.material.findMany({ take: catalogLimit + 1, where: { OR: identities } }));
            for (const row of materials) context.identities.set(materialImportIdentity(row), row);
        }
        context.initialStockReason = await findInitialStockAdjustmentReason({ tx: db });
    }
    const pairs = [];
    for (const row of values) {
        const supplierId = row.supplierId || context.supplierCodes.get(importKey(row.supplierCode))?.id;
        let materialId = config.mode === 'update' ? importReferenceId(row.id) : importReferenceId(row.materialId);
        if (config.mode === 'create' && config.resource !== 'wastes') {
            const presentationId = row.presentationId || context.presentationNames.get(importKey(row.presentationName))?.id;
            const unitMeasureId = row.unitMeasureId || context.unitLabels.get(importKey(row.unitLabel))?.id;
            materialId = context.identities.get(materialImportIdentity({ ...row, type: config.type, presentationId, unitMeasureId,
                base: row.base === '' ? null : row.base, height: row.height === '' ? null : row.height }))?.id;
        }
        if (UUID_V4_PATTERN.test(supplierId ?? '') && UUID_V4_PATTERN.test(materialId ?? '')) pairs.push({ materialId, supplierId });
    }
    if (pairs.length && (config.resource !== 'wastes' || config.mode === 'create')) {
        const offers = await db.supplierMaterial.findMany({ where: { OR: pairs }, include: {
            material: { include: { presentation: true, unitMeasure: true } }, supplier: true
        } });
        for (const row of offers) context.offers.set(`${row.materialId}:${row.supplierId}`, row);
    }
    if (config.resource === 'wastes' && config.mode === 'update') {
        const wastes = await db.waste.findMany({ where: { id: { in: ids(values.map(row => row.id)) } },
            include: { presentation: true, unitMeasure: true, supplier: true } });
        for (const row of wastes) {
            context.wastes.set(row.id, row);
        }
    }
    return context;
};
