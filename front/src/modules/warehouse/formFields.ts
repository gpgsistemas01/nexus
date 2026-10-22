import { isRollPresentation } from '@nexus/waste-measurements';
import { isRecord } from '../../shared/utils/isRecord.js';
import type { EditorTarget, InventoryField, InventoryResource, LookupItem } from './inventory.js';
import type { previewWaste } from './formModel.js';

export interface InventoryFieldSpec {
    name: InventoryField;
    label: string;
    type?: 'number' | 'lookup' | 'checkbox' | 'textarea';
    isReadOnly?: boolean;
    isDisabled?: boolean;
    displayValue?: string;
    hint?: string;
    isWide?: boolean;
}
export interface InventorySummaryItem {
    label: string;
    value: string;
}
export interface InventoryFormSection {
    id: string;
    title: string;
    description?: string;
    fields: InventoryFieldSpec[];
    summary?: InventorySummaryItem[];
}

export const inventorySections = (
    resource: InventoryResource,
    target: EditorTarget,
    preview: ReturnType<typeof previewWaste>,
    options: { template?: LookupItem; usesMeasurements: boolean; hasSupplier: boolean },
): InventoryFormSection[] => {
    const { action, row } = target;
    const isCreating = action === 'create';
    const isWaste = resource === 'wastes';
    const isStock = action === 'stock' || action === 'add-stock';
    const isRoll = isCreating ? preview.isRoll : isRollPresentation(row?.presentation);
    const template = options.template?.data;
    const presentation = isRecord(template?.presentation)
        ? String(template.presentation.name ?? '')
        : '';
    const unit = isRecord(template?.unitMeasure)
        ? String(template.unitMeasure.symbol || template.unitMeasure.name || '')
        : '';
    const sections: InventoryFormSection[] = [];
    if (action === 'delete') return sections;

    if (isCreating && isWaste)
        sections.push({
            id: 'origin',
            title: 'Material de origen',
            description: 'Selecciona el proveedor y después el material que origina la merma.',
            fields: [
                { name: 'supplierId', label: 'Proveedor', type: 'lookup' },
                {
                    name: 'materialId',
                    label: 'Material de referencia del proveedor',
                    type: 'lookup',
                    isDisabled: !options.hasSupplier,
                    hint: !options.hasSupplier ? 'Selecciona primero un proveedor.' : undefined,
                },
            ],
        });

    sections.push({
        id: 'identity',
        title: isWaste
            ? 'Datos de la merma'
            : resource === 'consumables'
              ? 'Datos del consumible'
              : 'Datos del material',
        description: !isCreating
            ? 'Consulta el proveedor, la presentación y la unidad del registro.'
            : undefined,
        fields: [
            {
                name: 'name',
                label: isWaste ? 'Nombre de la merma' : 'Nombre',
                isReadOnly: isStock,
                isWide: true,
            },
            ...(!isCreating || !isWaste
                ? [
                      {
                          name: 'supplierId' as const,
                          label: 'Proveedor',
                          type: isCreating ? ('lookup' as const) : undefined,
                          isReadOnly: !isCreating,
                          displayValue: isCreating ? undefined : row?.supplierName,
                          isWide: true,
                      },
                  ]
                : []),
            {
                name: 'presentationId',
                label: 'Presentación',
                type: isCreating && !isWaste ? 'lookup' : undefined,
                isReadOnly: !isCreating || isWaste,
                displayValue:
                    isWaste && isCreating
                        ? presentation || 'Selecciona un material'
                        : row?.presentation,
            },
            {
                name: 'unitMeasureId',
                label: 'Unidad de medida',
                type: isCreating && !isWaste ? 'lookup' : undefined,
                isReadOnly: !isCreating || isWaste,
                displayValue:
                    isWaste && isCreating ? unit || 'Selecciona un material' : row?.unitMeasure,
            },
        ],
    });
    if (isWaste && isRoll && (isCreating || row?.referenceRollTotalWeightKg != null))
        sections.push({
            id: 'reference',
            title: 'Rollo completo (muestra)',
            description:
                'El largo proviene del material de origen. Se utiliza el mismo cono de la merma.',
            fields: [
                {
                    name: 'referenceRollTotalWeightKg',
                    label: 'Peso del rollo completo con cono (kg)',
                    type: 'number',
                    isReadOnly: !isCreating,
                    displayValue: isCreating
                        ? undefined
                        : String(row?.referenceRollTotalWeightKg ?? ''),
                },
            ],
            summary:
                isCreating && template
                    ? [
                          {
                              label: 'Base del material de origen (m)',
                              value: String(template.base ?? '—'),
                          },
                          {
                              label: 'Altura del material de origen (m)',
                              value: String(template.height ?? '—'),
                          },
                      ]
                    : undefined,
        });

    if (isWaste && isRoll)
        sections.push({
            id: 'weights',
            title: 'Pesos de la merma',
            description: 'Pesos por unidad de merma.',
            fields: [
                {
                    name: 'coneWeightKg',
                    label: 'Peso del cono de la merma (kg)',
                    type: 'number',
                    isReadOnly: !isCreating,
                    displayValue: isCreating ? undefined : String(row?.coneWeightKg ?? ''),
                },
                {
                    name: 'totalWeightKg',
                    label: 'Peso de la merma con cono (kg)',
                    type: 'number',
                    isReadOnly: !isCreating,
                    displayValue: isCreating ? undefined : String(row?.totalWeightKg ?? ''),
                },
            ],
            summary: [
                {
                    label: 'Peso neto de la merma (kg)',
                    value: String((isCreating ? preview.weightKg : row?.weightKg) ?? '—'),
                },
            ],
        });

    if (
        isWaste &&
        !isCreating &&
        row?.referenceRollTotalWeightKg == null &&
        (row?.sampleLengthM != null || row?.sampleNetWeightKg != null)
    )
        sections.push({
            id: 'history',
            title: 'Referencia histórica',
            description: 'Datos conservados del registro anterior.',
            fields: [],
            summary: [
                { label: 'Largo de referencia (m)', value: String(row.sampleLengthM ?? '—') },
                {
                    label: 'Peso neto de referencia (kg)',
                    value: String(row.sampleNetWeightKg ?? '—'),
                },
            ],
        });

    if (isWaste || options.usesMeasurements)
        sections.push({
            id: 'measurements',
            title: isWaste ? 'Medidas de la merma' : 'Medidas del material',
            description:
                isWaste && isRoll && isCreating
                    ? 'Se calculan a partir de los pesos y del material de origen.'
                    : undefined,
            fields: (['base', 'height'] as const).map((name) => ({
                name,
                label: name === 'base' ? 'Base (m)' : 'Altura (m)',
                type: 'number',
                isReadOnly: !isCreating || (isWaste && isRoll),
                ...(isCreating && isWaste && isRoll
                    ? { displayValue: String(preview[name] ?? '') }
                    : {}),
            })),
        });

    sections.push({
        id: 'inventory',
        title: isWaste
            ? 'Inventario de la merma'
            : resource === 'consumables'
              ? 'Inventario del consumible'
              : 'Inventario del material',
        fields: [
            { name: 'minStock', label: 'Stock mínimo', type: 'number', isReadOnly: isStock },
            ...(!isStock || row?.maxUnitCost !== undefined
                ? [
                      {
                          name: 'maxUnitCost' as const,
                          label: 'Costo máximo unitario',
                          type: 'number' as const,
                          isReadOnly: isStock,
                      },
                  ]
                : []),
            { name: 'isActive', label: 'Activo', type: 'checkbox', isReadOnly: isStock },
        ],
    });
    if (isCreating || isStock)
        sections.push({
            id: 'stock',
            title: 'Existencias y observaciones',
            summary: isCreating
                ? !isWaste
                    ? [{ label: 'Motivo del movimiento', value: 'Stock inicial' }]
                    : undefined
                : [
                      { label: 'Stock actual', value: String(row?.currentStock ?? '—') },
                      {
                          label: 'Cantidad convertida actual',
                          value: String(row?.convertedQuantity ?? '—'),
                      },
                  ],
            fields: [
                ...(action === 'stock'
                    ? [
                          {
                              name: 'reasonId' as const,
                              label: 'Motivo del ajuste',
                              type: 'lookup' as const,
                          },
                      ]
                    : []),
                {
                    name:
                        action === 'add-stock'
                            ? 'quantity'
                            : isCreating && isWaste
                              ? 'initialQuantity'
                              : 'newStock',
                    label:
                        action === 'add-stock'
                            ? 'Cantidad a agregar'
                            : isCreating
                              ? 'Cantidad inicial'
                              : 'Nuevo stock',
                    type: 'number',
                },
                { name: 'observations', label: 'Observaciones', type: 'textarea', isWide: true },
            ],
        });

    return sections;
};
