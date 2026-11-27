import { randomUUID } from 'node:crypto';
import { prepareMaterialData } from '../materials/materialHelpers.js';
import { createMaterialStockAdjustmentDocuments } from '../adjustmentService.js';
import { registerWasteStockAdjustmentDocument } from '../wastes/wasteStockAdjustmentService.js';
import { registerWasteStockEntriesBatch } from '../wastes/wasteStockEntryService.js';
import { assertPieceQuantity } from '../../inventory/stockHelpers.js';
import { materialImportIdentity } from './inventoryImportContext.js';
import { lockInventoryImportReferences, lockInventoryStockCount, updateImportedSupplierMaterials, updateImportedWastes } from '../../../repository/warehouse/inventoryImportWriteRepository.js';
import { ARTICLE_IMPORT_RESOURCE, INVENTORY_IMPORT_MODES as modes, INVENTORY_IMPORT_ROW_ACTIONS as actions } from '../../../shared/constants/inventoryImport.js';
import { writeArticleImport } from './articleImportService.js';

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
            minStock: relations.minStock, maxUnitCost: relations.maxUnitCost, isActive: relations.isActive };
        offers.push(offer);
        initialStock.push({ materialId: material.id, supplierId: offer.supplierId, newStock, observations,
            supplierMaterial: { ...offer, currentStock: 0, convertedQuantity: 0,
                material: { ...material, presentation: context.presentations.get(material.presentationId) },
                supplier: context.suppliers.get(offer.supplierId) } });
        saved.set(row.row, material.id);
    }
    if (materials.length) await tx.material.createMany({ data: materials });
    await tx.supplierMaterial.createMany({ data: offers });
    await createMaterialStockAdjustmentDocuments({
        tx, documents: initialStock.map(entry => [{ ...entry, reasonId: context.initialStockReason.id }]), userId
    });
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
export const writeInventoryImport = async ({ tx, config, rows, context, userId, inventoryImportId }) => {
    const changed = rows.filter(row => row.action !== actions.UNCHANGED);
    if (config.mode === modes.ADJUST) {
        await lockInventoryStockCount({ tx, context });
        if (!changed.length) return { savedIds: new Map() };

        let adjustment;
        if (config.type) {
            const entries = changed.map(row => ({
                ...row.dto, materialId: row.id, supplierMaterial: context.offers.get(`${row.id}:${row.dto.supplierId}`)
            }));
            [adjustment] = await createMaterialStockAdjustmentDocuments({ tx, userId, inventoryImportId, documents: [entries] });
        } else {
            const entries = changed.map(row => ({
                ...row.dto, waste: context.wastes.get(row.id)
            }));
            adjustment = await registerWasteStockAdjustmentDocument({ tx, userId, inventoryImportId, entries });
        }
        for (const row of changed) row.details.adjustmentReference = adjustment.referenceNumber;
        return { savedIds: new Map(), adjustment };
    }
    if (!changed.length) return { savedIds: new Map() };
    if (config.resource === ARTICLE_IMPORT_RESOURCE) {
        return { savedIds: await writeArticleImport({ tx, config, rows: changed, context }) };
    }
    if (config.mode === modes.CREATE) {
        await lockInventoryImportReferences({ tx, context });
        const savedIds = config.resource === 'wastes'
            ? await createWastes({ tx, rows: changed, context, userId })
            : await createMaterials({ tx, config, rows: changed, context, userId });
        return { savedIds };
    }
    if (config.resource === 'wastes') {
        const changes = changed.map(row => {
            assertPieceQuantity({ quantity: row.dto.minStock, item: context.wastes.get(row.id) });
            return { id: row.id, version: row.dto.expectedVersion, ...row.after };
        });
        await updateImportedWastes({ tx, changes });
    } else {
        const offers = changed.map(row => {
            const dto = row.dto;
            return { materialId: row.id, supplierId: dto.supplierId, version: dto.expectedVersion,
                minStock: dto.minStock, maxUnitCost: dto.maxUnitCost, isActive: dto.isActive };
        });
        await updateImportedSupplierMaterials({ tx, offers });
    }
    return { savedIds: new Map() };
};
