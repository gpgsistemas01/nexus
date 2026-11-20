import { isRollPresentation } from '@nexus/waste-measurements';
import { isPiecePresentation } from '@nexus/piece-quantity';
import { isRecord } from '../../shared/utils/isRecord.js';
import { numberText, convertedQuantityText } from '../../shared/utils/formatNumbers.js';
import { inventoryLabels } from './inventoryDisplay.js';
import type { EditorTarget } from './inventory.js';
import type { InventoryFormSection } from './inventoryFormTypes.js';
import type { LookupItem } from '../../shared/lookup.js';
import type { previewWaste } from './formModel.js';

const SECTION_ORDER = [
    'origin',
    'identity',
    'measurements',
    'reference',
    'weights',
    'history',
    'presentation',
    'inventory',
    'stock',
    'notes',
] as const;

export const wasteFormSections = (
    { action, row }: EditorTarget,
    preview: ReturnType<typeof previewWaste>,
    options: {
        template?: LookupItem;
        presentationName?: string;
        hasSupplier: boolean;
        isPerPiece?: boolean;
        supplier?: LookupItem;
    },
): InventoryFormSection[] => {
    const labels = inventoryLabels('wastes');
    const isCreating = action === 'create';
    const isStock = action === 'stock' || action === 'add-stock';
    const isRoll = isCreating ? preview.isRoll : isRollPresentation(row?.presentation);
    const template = options.template?.data;
    const presentation = isRecord(template?.presentation)
        ? String(template.presentation.name ?? '')
        : '';
    const unit = isRecord(template?.unitMeasure)
        ? String(template.unitMeasure.symbol || template.unitMeasure.name || '')
        : '';
    const quantityStep = isPiecePresentation(
        isCreating ? (options.presentationName ?? presentation) : row?.presentation,
    )
        ? 1
        : undefined;
    const sections: Partial<Record<InventoryFormSection['id'], Omit<InventoryFormSection, 'id'>>> =
        {};
    if (isCreating)
        sections.origin = {
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
        };

    sections.identity = {
        title: 'Datos de la merma',
        description: !isCreating
            ? 'Consulta el proveedor, la presentación y la unidad del registro.'
            : undefined,
        fields: [
            {
                name: 'name',
                label: 'Nombre de la merma',
                isReadOnly: isStock,
                isWide: true,
            },
            ...(!isCreating
                ? [
                      {
                          name: 'supplierId' as const,
                          label: 'Proveedor',
                          isReadOnly: true,
                          displayValue: options.supplier?.title ?? row?.supplierName,
                          isWide: true,
                      },
                  ]
                : []),
        ],
    };
    sections.presentation = {
        title: 'Presentación y unidad',
        fields: [
            {
                name: 'presentationId',
                label: labels.presentation,
                isReadOnly: true,
                displayValue: isCreating
                    ? presentation || 'Selecciona un material'
                    : row?.presentation,
            },
            {
                name: 'unitMeasureId',
                label: labels.unitMeasure,
                isReadOnly: true,
                displayValue: isCreating ? unit || 'Selecciona un material' : row?.unitMeasure,
            },
        ],
    };
    if (isRoll && (isCreating || row?.referenceRollTotalWeightKg != null))
        sections.reference = {
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
                              value: numberText(
                                  template.base == null ? null : Number(template.base),
                              ),
                          },
                          {
                              label: 'Altura del material de origen (m)',
                              value: numberText(
                                  template.height == null ? null : Number(template.height),
                              ),
                          },
                      ]
                    : undefined,
        };

    if (isRoll)
        sections.weights = {
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
                    value: numberText(isCreating ? preview.weightKg : row?.weightKg),
                },
            ],
        };

    if (
        !isCreating &&
        row?.referenceRollTotalWeightKg == null &&
        (row?.sampleLengthM != null || row?.sampleNetWeightKg != null)
    )
        sections.history = {
            title: 'Referencia histórica',
            description: 'Datos conservados del registro anterior.',
            fields: [],
            summary: [
                { label: 'Largo de referencia (m)', value: numberText(row.sampleLengthM) },
                {
                    label: 'Peso neto de referencia (kg)',
                    value: numberText(row.sampleNetWeightKg),
                },
            ],
        };

    if (!(isCreating && options.isPerPiece))
        sections.measurements = {
            title: options.isPerPiece ? 'Medida por pieza' : 'Medidas de la merma',
            description:
                isRoll && isCreating
                    ? 'Se calculan a partir de los pesos y del material de origen.'
                    : undefined,
            fields: (['base', 'height'] as const).map((name) => ({
                name,
                label: labels[name],
                hint: options.isPerPiece ? 'Medida unitaria fija.' : 'Medida en metros.',
                type: 'number',
                isReadOnly: !isCreating || isRoll || options.isPerPiece,
                ...(isCreating && isRoll ? { displayValue: String(preview[name] ?? '') } : {}),
            })),
        };

    sections.inventory = {
        title: 'Inventario de la merma',
        summary:
            !isCreating && !isStock
                ? [
                      { label: labels.currentStock, value: numberText(row?.currentStock) },
                      {
                          label: 'Cantidad convertida',
                          value: convertedQuantityText(
                              row?.convertedQuantity,
                              row?.unitMeasure ?? '',
                          ),
                      },
                  ]
                : undefined,
        fields: [
            ...(!isStock || row?.minStock !== undefined
                ? [
                      {
                          name: 'minStock' as const,
                          label: labels.minStock,
                          type: 'number' as const,
                          step: quantityStep,
                          isReadOnly: isStock,
                      },
                  ]
                : []),
            ...(!isStock || row?.maxUnitCost !== undefined
                ? [
                      {
                          name: 'maxUnitCost' as const,
                          label: labels.maxUnitCost,
                          type: 'number' as const,
                          isReadOnly: isStock,
                      },
                  ]
                : []),
            ...(!isStock || row?.isActive !== undefined
                ? [
                      {
                          name: 'isActive' as const,
                          label: labels.isActive,
                          type: 'checkbox' as const,
                          isReadOnly: isStock,
                      },
                  ]
                : []),
        ],
    };

    if (isCreating || isStock) {
        sections.stock = {
            title: 'Existencias',
            summary: isCreating
                ? undefined
                : [
                      { label: labels.currentStock, value: numberText(row?.currentStock) },
                      {
                          label: 'Cantidad convertida actual',
                          value: convertedQuantityText(
                              row?.convertedQuantity,
                              row?.unitMeasure ?? '',
                          ),
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
                            : isCreating
                              ? 'initialQuantity'
                              : 'newStock',
                    label:
                        action === 'add-stock'
                            ? 'Cantidad a agregar'
                            : isCreating
                              ? 'Cantidad inicial'
                              : 'Nuevo stock',
                    type: 'number',
                    step: quantityStep,
                },
            ],
        };
        sections.notes = {
            title: 'Notas del movimiento',
            fields: [
                { name: 'observations', label: 'Observaciones', type: 'textarea', isWide: true },
            ],
        };
    }

    return SECTION_ORDER.flatMap((id) => {
        const section = sections[id];
        return section ? [{ id, ...section }] : [];
    });
};
