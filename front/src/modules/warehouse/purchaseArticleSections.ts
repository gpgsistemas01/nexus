import { inventoryLabels } from './inventoryDisplay.js';
import type { InventoryResource } from './inventory.js';
import type { InventoryFormSection } from './inventoryFormTypes.js';
import type { LookupItem } from '../../shared/lookup.js';

export const purchaseArticleSections = (
    resource: Exclude<InventoryResource, 'wastes'>,
    options: {
        supplier?: LookupItem;
        isPerPiece?: boolean;
        usesMeasurements: boolean;
    },
): InventoryFormSection[] => {
    const labels = inventoryLabels(resource);
    const isConsumable = resource === 'consumables';
    const sections: InventoryFormSection[] = [
        {
            id: 'identity',
            title: isConsumable ? 'Datos del consumible' : 'Datos del material',
            fields: [
                { name: 'name', label: 'Nombre', isReadOnly: false, isWide: true },
                {
                    name: 'supplierId',
                    label: 'Proveedor',
                    type: options.supplier ? undefined : 'lookup',
                    isReadOnly: !!options.supplier,
                    displayValue: options.supplier?.title,
                    isWide: true,
                },
            ],
        },
    ];

    if (!options.isPerPiece && (isConsumable || options.usesMeasurements)) {
        sections.push({
            id: 'measurements',
            title: isConsumable ? 'Medidas del consumible' : 'Medidas del material',
            fields: (['base', 'height'] as const).map((name) => ({
                name,
                label: labels[name],
                hint: 'Medida en metros.',
                type: 'number',
                isReadOnly: options.isPerPiece,
            })),
        });
    }

    sections.push({
        id: 'presentation',
        title: 'Presentación y unidad',
        fields: [
            {
                name: 'presentationId',
                label: labels.presentation,
                hint:
                    isConsumable && options.isPerPiece
                        ? 'Esta presentación fija ambas medidas en 1.'
                        : undefined,
                type: 'lookup',
                isReadOnly: false,
            },
            { name: 'unitMeasureId', label: labels.unitMeasure, type: 'lookup', isReadOnly: false },
        ],
    });
    return sections;
};
