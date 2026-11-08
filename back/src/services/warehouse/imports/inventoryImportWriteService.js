import { randomUUID } from 'node:crypto';
import { prepareMaterialData } from '../materials/materialHelpers.js';
import { createInitialMaterialStockBatch, createMaterialStockAdjustmentsBatch } from '../adjustmentService.js';
import { registerWasteStockAdjustmentsBatch } from '../wastes/wasteStockAdjustmentService.js';
import { registerWasteStockEntriesBatch } from '../wastes/wasteStockEntryService.js';
import { assertPieceQuantity } from '../../inventory/stockHelpers.js';
import { materialImportIdentity } from './inventoryImportContext.js';
import { lockInventoryImportReferences, lockInventoryStockCount, updateImportedMaterials, updateImportedWastes } from '../../../repository/warehouse/inventoryImportWriteRepository.js';

const createMaterials = async ({ tx, config, rows, context, userId }) => {
    const identities = new Map(context.identities);
    const materials = [];
    const offers = [];
    const initialStock = [];
    const saved = new Map();
    for (const row of rows) {
        const { newStock, observations, ...data } = row.dto;
        const { rest, relations } = await prepareMaterialData({ tx, materialDto: { ...data, type: config.type }, context });
        const key = materialImportIdentity({ ...rest, ...relations });
        let material = identities.get(key);
        if (!material) {
            material = { id: randomUUID(), ...rest, presentationId: relations.presentationId, unitMeasureId: relations.unitMeasureId };
            materials.push(material);
            identities.set(key, material);
        }
        const offer = { id: randomUUID(), materialId: material.id, supplierId: relations.supplierId,
            maxUnitCost: relations.maxUnitCost, isActive: relations.isActive };
        offers.push(offer);
        initialStock.push({ materialId: material.id, supplierId: offer.supplierId, newStock, observations,
            supplierMaterial: { ...offer, currentStock: 0, convertedQuantity: 0,
                material: { ...material, presentation: context.presentations.get(material.presentationId) },
                supplier: context.suppliers.get(offer.supplierId) } });
        saved.set(row.row, material.id);
    }
    if (materials.length) await tx.material.createMany({ data: materials });
    await tx.supplierMaterial.createMany({ data: offers });
    await createInitialMaterialStockBatch({ tx, entries: initialStock, userId, reasonId: context.initialStockReason.id });
    return saved;
};

const createWastes = async ({ tx, rows, context, userId }) => {
    const entries = rows.map(row => {
        const dto = row.dto;
        const material = context.offers.get(`${dto.materialId}:${dto.supplierId}`).material;
        const { base, height, weightKg } = row.reference;
        return { id: randomUUID(), name: dto.name, supplierId: dto.supplierId,
            presentationId: material.presentationId, unitMeasureId: material.unitMeasureId,
            sourceMaterialId: material.id, maxUnitCost: dto.maxUnitCost, minStock: dto.minStock, isActive: dto.isActive,
            base, height, weightKg, coneWeightKg: dto.coneWeightKg ?? null, totalWeightKg: dto.totalWeightKg ?? null,
            referenceRollTotalWeightKg: dto.referenceRollTotalWeightKg ?? null };
    });
    await tx.waste.createMany({ data: entries });
    await registerWasteStockEntriesBatch({ tx, userId, entries: entries.flatMap((waste, index) => {
        const dto = rows[index].dto;
        return dto.initialQuantity > 0 ? [{ waste, quantity: dto.initialQuantity, observations: dto.observations }] : [];
    }) });
    return new Map(entries.map((entry, index) => [rows[index].row, entry.id]));
};

// Las reglas y conversiones son las de los formularios; el lote agrupa las escrituras dentro de su única tx.
export const writeInventoryImport = async ({ tx, config, rows, context, userId, referencesLocked = false }) => {
    if (config.mode === 'mixed') {
        for (const group of context.groups) {
            if (group.config.mode === 'create') await lockInventoryImportReferences({ tx, context: group.context });
            if (group.config.mode === 'adjust') await lockInventoryStockCount({ tx, context: group.context });
        }
        const saved = new Map();
        for (const mode of ['update', 'create', 'adjust']) for (const group of context.groups.filter(group => group.config.mode === mode)) {
            const clean = group.rows.map(row => { const { operation, ...dto } = row.dto; return { ...row, dto }; });
            const ids = await writeInventoryImport({ tx, ...group, rows: clean, userId, referencesLocked: true });
            for (const [row, id] of ids) saved.set(row, id);
            for (const row of clean) if (row.details.adjustmentReference) rows.find(item => item.row === row.row).details.adjustmentReference = row.details.adjustmentReference;
        }
        return saved;
    }
    const changed = rows.filter(row => row.action !== 'unchanged');
    if (config.mode === 'adjust') {
        if (!referencesLocked) await lockInventoryStockCount({ tx, context });
        const references = config.type
            ? await createMaterialStockAdjustmentsBatch({ tx, userId, entries: changed.map(row => ({
                ...row.dto, materialId: row.id, supplierMaterial: context.offers.get(`${row.id}:${row.dto.supplierId}`)
            })) })
            : await registerWasteStockAdjustmentsBatch({ tx, userId, entries: changed.map(row => ({
                ...row.dto, waste: context.wastes.get(row.id)
            })) });
        changed.forEach((row, index) => { row.details.adjustmentReference = references[index]; });
        return new Map(changed.map(row => [row.row, row.id]));
    }
    if (!changed.length) return new Map();
    if (config.mode === 'create') {
        if (!referencesLocked) await lockInventoryImportReferences({ tx, context });
        return config.resource === 'wastes'
            ? createWastes({ tx, rows: changed, context, userId })
            : createMaterials({ tx, config, rows: changed, context, userId });
    }
    if (config.resource === 'wastes') {
        const changes = changed.map(row => {
            assertPieceQuantity({ quantity: row.dto.minStock, item: context.wastes.get(row.id) });
            return { id: row.id, version: row.dto.expectedVersion, ...row.after };
        });
        await updateImportedWastes({ tx, changes });
    } else {
        const materials = new Map();
        const offers = changed.map(row => {
            const dto = row.dto;
            const material = context.offers.get(`${row.id}:${dto.supplierId}`).material;
            assertPieceQuantity({ quantity: dto.minStock, item: material });
            materials.set(row.id, { id: row.id, version: dto.expectedMaterialVersion, name: dto.name, minStock: dto.minStock });
            return { materialId: row.id, supplierId: dto.supplierId, version: dto.expectedVersion,
                maxUnitCost: dto.maxUnitCost, isActive: dto.isActive };
        });
        await updateImportedMaterials({ tx, type: config.type, materials: [...materials.values()], offers });
    }
    return new Map(changed.map(row => [row.row, row.id]));
};
