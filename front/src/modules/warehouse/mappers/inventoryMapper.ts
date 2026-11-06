import { ApiError } from '../../../shared/http/apiError.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import type { InventoryRow, Numeric } from '../inventory.js';

const numberValue = (value: unknown): Numeric =>
    typeof value === 'number' || typeof value === 'string' ? value : null;

const text = (value: unknown) => (typeof value === 'string' ? value : '');

const record = (value: unknown) => (isRecord(value) ? value : {});

export const normalizeInventoryRow = (raw: Record<string, unknown>): InventoryRow => {
    const material = isRecord(raw.material) ? raw.material : raw;
    const supplier = record(raw.supplier);
    const presentation = record(material.presentation);
    const unit = record(material.unitMeasure);

    if (
        typeof raw.id !== 'string' ||
        typeof material.id !== 'string' ||
        !Number.isInteger(raw.version) ||
        (isRecord(raw.material) && !Number.isInteger(material.version))
    ) {
        throw new ApiError('El servidor devolvió un registro de inventario inesperado.');
    }

    return {
        id: raw.id,
        entityId: material.id,
        version: Number(raw.version),
        materialVersion: isRecord(raw.material) ? Number(material.version) : undefined,
        name: text(material.name),
        supplierId: text(supplier.id) || text(raw.supplierId),
        supplierName: text(supplier.tradeName),
        presentationId: text(presentation.id),
        presentation: text(presentation.name),
        unitMeasureId: text(unit.id),
        unitMeasure: text(unit.symbol) || text(unit.name),
        base: numberValue(material.base),
        height: numberValue(material.height),
        minStock: numberValue(material.minStock),
        currentStock: numberValue(raw.currentStock),
        convertedQuantity: numberValue(raw.convertedQuantity),
        ...(raw.maxUnitCost !== undefined ? { maxUnitCost: numberValue(raw.maxUnitCost) } : {}),
        isActive: raw.isActive === true,
        canDelete: raw.canDelete === true,
        coneWeightKg: numberValue(raw.coneWeightKg),
        totalWeightKg: numberValue(raw.totalWeightKg),
        weightKg: numberValue(raw.weightKg),
        referenceRollTotalWeightKg: numberValue(raw.referenceRollTotalWeightKg),
        sampleLengthM: numberValue(raw.sampleLengthM),
        sampleNetWeightKg: numberValue(raw.sampleNetWeightKg),
    };
};
