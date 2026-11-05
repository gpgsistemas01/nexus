import { isRecord } from '../../../shared/utils/isRecord.js';
import type { InventoryPayload, StockAdditionTarget } from '../inventory.js';

// El conflicto devuelve contexto de entrada, no una lectura versionada para editar.
export const mapWasteStockAddition = (
    waste: unknown,
    capture: InventoryPayload,
): StockAdditionTarget | null => {
    if (
        !isRecord(waste) ||
        typeof waste.id !== 'string' ||
        !waste.id ||
        typeof waste.name !== 'string' ||
        (typeof waste.currentStock !== 'string' && typeof waste.currentStock !== 'number') ||
        !Number.isFinite(Number(waste.currentStock))
    )
        return null;

    const supplier = isRecord(waste.supplier) ? waste.supplier : {};
    const presentation = isRecord(waste.presentation) ? waste.presentation : {};
    const unit = isRecord(waste.unitMeasure) ? waste.unitMeasure : {};

    const numeric = (value: unknown) =>
        typeof value === 'string' || typeof value === 'number' ? value : null;

    return {
        action: 'add-stock',
        row: {
            id: waste.id,
            entityId: waste.id,
            name: waste.name,
            supplierName: typeof supplier.tradeName === 'string' ? supplier.tradeName : '',
            currentStock: waste.currentStock,
            supplierId: typeof waste.supplierId === 'string' ? waste.supplierId : '',
            presentation: typeof presentation.name === 'string' ? presentation.name : '',
            unitMeasure: typeof unit.symbol === 'string' ? unit.symbol : '',
            base: numeric(waste.base),
            height: numeric(waste.height),
            coneWeightKg: numeric(waste.coneWeightKg),
            totalWeightKg: numeric(waste.totalWeightKg),
            weightKg: numeric(waste.weightKg),
        },
        quantity: Number(capture.initialQuantity) > 0 ? String(capture.initialQuantity) : '',
        observations: String(capture.observations ?? ''),
    };
};
