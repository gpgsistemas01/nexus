import { getLookupArticle } from '../../shared/utils/articleOptions.js';
import { inventoryLabels } from './inventoryDisplay.js';
import { isRollPresentation } from '@nexus/waste-measurements';
import { getPieceQuantityError, isPiecePresentation } from '@nexus/piece-quantity';
import { materialOfferCreateValidation } from '@nexus/form-validation';
import { calculateConvertedQuantity } from '@nexus/stock-quantity';
import { isRecord } from '../../shared/utils/isRecord.js';
import { numberText, convertedQuantityText } from '../../shared/utils/formatNumbers.js';
import type { EditorTarget, InventoryField, InventoryResource } from './inventory.js';
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
type SectionId = (typeof SECTION_ORDER)[number];

export interface InventoryFieldSpec {
    name: InventoryField;
    label: string;
    type?: 'number' | 'lookup' | 'checkbox' | 'textarea';
    step?: number;
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
    id: SectionId;
    title: string;
    description?: string;
    fields: InventoryFieldSpec[];
    summary?: InventorySummaryItem[];
}

const readOnlyField = (
    name: InventoryField,
    label: string,
    displayValue: string,
    isWide = false,
): InventoryFieldSpec => ({ name, label, displayValue, isReadOnly: true, isWide });

export const inventorySections = (
    resource: InventoryResource,
    target: EditorTarget,
    preview: ReturnType<typeof previewWaste>,
    options: {
        template?: LookupItem;
        article?: LookupItem;
        initialStock?: string;
        presentationName?: string;
        usesMeasurements: boolean;
        isPerPiece?: boolean;
        hasSupplier: boolean;
        creationContext?: 'goodsReceipt';
        supplier?: LookupItem;
    },
): InventoryFormSection[] => {
    const { action, row } = target;
    const labels = inventoryLabels(resource);
    const isCreating = action === 'create';
    const fromPurchase = isCreating && options.creationContext === 'goodsReceipt';
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
    const quantityStep = isPiecePresentation(
        isCreating ? (options.presentationName ?? presentation) : row?.presentation,
    )
        ? 1
        : undefined;
    const costField: InventoryFieldSpec = {
        name: 'maxUnitCost',
        label: labels.maxUnitCost,
        type: 'number',
    };
    const stateField: InventoryFieldSpec = {
        name: 'isActive',
        label: labels.isActive,
        type: 'checkbox',
    };
    const notesField: InventoryFieldSpec = {
        name: 'observations',
        label: 'Observaciones',
        type: 'textarea',
        isWide: true,
    };
    const sections: Partial<Record<SectionId, Omit<InventoryFormSection, 'id'>>> = {};
    if (action === 'delete') return [];

    if (!isWaste && !fromPurchase && (isCreating || ((action === 'edit' || isStock) && row))) {
        const article = options.article ? getLookupArticle(options.article) : undefined;
        const presentation = isRecord(article?.presentation) ? article.presentation : {};
        const unit = isRecord(article?.unitMeasure) ? article.unitMeasure : {};
        const base = row?.base ?? (article?.base == null ? null : Number(article.base));
        const height = row?.height ?? (article?.height == null ? null : Number(article.height));
        const unitName = row?.unitMeasure ?? String(unit.symbol || unit.name || '—');
        const initialStock = options.initialStock ?? '0';
        const initialConvertedQuantity =
            isCreating &&
            article &&
            !materialOfferCreateValidation.newStock(initialStock) &&
            !getPieceQuantityError(initialStock, options.presentationName)
                ? calculateConvertedQuantity({ quantity: Number(initialStock), base, height })
                : null;

        sections.identity = {
            title: `${labels.name} y proveedor`,
            fields: isCreating
                ? [
                      { name: 'materialId', label: labels.name, type: 'lookup', isWide: true },
                      { name: 'supplierId', label: 'Proveedor', type: 'lookup', isWide: true },
                  ]
                : [
                      readOnlyField('name', labels.name, row?.name ?? '—', true),
                      readOnlyField('supplierId', 'Proveedor', row?.supplierName ?? '—', true),
                  ],
        };
        sections.reference = {
            title: resource === 'consumables' ? 'Datos del consumible' : 'Datos del material',
            fields: [
                readOnlyField(
                    'presentationId',
                    labels.presentation,
                    row?.presentation ?? String(presentation.name ?? '—'),
                ),
                readOnlyField('unitMeasureId', labels.unitMeasure, unitName),
                readOnlyField('base', labels.base, numberText(base)),
                readOnlyField('height', labels.height, numberText(height)),
                readOnlyField(
                    'minStock',
                    labels.minStock,
                    row || article
                        ? numberText(row?.minStock ?? Number(article?.minStock ?? 0))
                        : '—',
                ),
            ],
        };
        sections.inventory = {
            title: 'Existencias',
            summary: isCreating
                ? [
                      {
                          label: 'Cantidad convertida inicial',
                          value: convertedQuantityText(initialConvertedQuantity, unitName),
                      },
                      { label: 'Motivo del movimiento', value: 'Stock inicial' },
                  ]
                : [
                      { label: labels.currentStock, value: numberText(row?.currentStock) },
                      {
                          label: 'Cantidad convertida actual',
                          value: convertedQuantityText(row?.convertedQuantity, unitName),
                      },
                  ],
            fields: [
                ...(isCreating || isStock
                    ? [
                          {
                              name: action === 'add-stock' ? 'quantity' : 'newStock',
                              label:
                                  action === 'add-stock'
                                      ? 'Cantidad a agregar'
                                      : isCreating
                                        ? 'Cantidad inicial'
                                        : 'Nuevo stock',
                              type: 'number',
                              step: quantityStep,
                          } satisfies InventoryFieldSpec,
                      ]
                    : []),
                ...(!isStock || row?.maxUnitCost !== undefined
                    ? [{ ...costField, isReadOnly: isStock }]
                    : []),
                { ...stateField, isReadOnly: isStock },
                ...(action === 'stock'
                    ? [
                          {
                              name: 'reasonId',
                              label: 'Motivo del ajuste',
                              type: 'lookup',
                          } satisfies InventoryFieldSpec,
                      ]
                    : []),
                ...(isCreating || isStock ? [notesField] : []),
            ],
        };

        return SECTION_ORDER.flatMap((id) => {
            const section = sections[id];
            return section ? [{ id, ...section }] : [];
        });
    }

    if (isCreating && isWaste)
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
                label: isWaste ? 'Nombre de la merma' : isCreating ? 'Nombre' : labels.name,
                isReadOnly: isStock || (action === 'edit' && !isWaste),
                isWide: true,
            },
            ...(!isCreating || !isWaste
                ? [
                      {
                          name: 'supplierId' as const,
                          label: 'Proveedor',
                          type: isCreating && !options.supplier ? ('lookup' as const) : undefined,
                          isReadOnly: !isCreating || !!options.supplier,
                          displayValue:
                              options.supplier?.title ??
                              (isCreating ? undefined : row?.supplierName),
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
                hint:
                    isCreating && resource === 'consumables' && options.isPerPiece
                        ? 'Esta presentación fija ambas medidas en 1.'
                        : undefined,
                type: isCreating && !isWaste ? 'lookup' : undefined,
                isReadOnly: !isCreating || isWaste,
                displayValue:
                    isWaste && isCreating
                        ? presentation || 'Selecciona un material'
                        : row?.presentation,
            },
            {
                name: 'unitMeasureId',
                label: labels.unitMeasure,
                type: isCreating && !isWaste ? 'lookup' : undefined,
                isReadOnly: !isCreating || isWaste,
                displayValue:
                    isWaste && isCreating ? unit || 'Selecciona un material' : row?.unitMeasure,
            },
        ],
    };
    if (isWaste && isRoll && (isCreating || row?.referenceRollTotalWeightKg != null))
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

    if (isWaste && isRoll)
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
        isWaste &&
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

    if (
        !(isCreating && options.isPerPiece) &&
        (isWaste ||
            (isCreating && resource === 'consumables') ||
            options.usesMeasurements ||
            row?.base != null ||
            row?.height != null)
    )
        sections.measurements = {
            title: options.isPerPiece
                ? resource === 'consumables'
                    ? 'Medidas de la unidad (1 × 1)'
                    : 'Medida por pieza'
                : resource === 'consumables'
                  ? 'Medidas del consumible'
                  : isWaste
                    ? 'Medidas de la merma'
                    : 'Medidas del material',
            description:
                isWaste && isRoll && isCreating
                    ? 'Se calculan a partir de los pesos y del material de origen.'
                    : undefined,
            fields: (['base', 'height'] as const).map((name) => ({
                name,
                label: labels[name],
                hint: options.isPerPiece ? 'Medida unitaria fija.' : 'Medida en metros.',
                type: 'number',
                isReadOnly: !isCreating || (isWaste && isRoll) || options.isPerPiece,
                ...(isCreating && isWaste && isRoll
                    ? { displayValue: String(preview[name] ?? '') }
                    : {}),
            })),
        };

    sections.inventory = {
        title: isWaste
            ? 'Inventario de la merma'
            : resource === 'consumables'
              ? 'Inventario del consumible'
              : 'Inventario del material',
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
                          isReadOnly: isStock || (action === 'edit' && !isWaste),
                      },
                  ]
                : []),
            ...(!fromPurchase && (!isStock || row?.maxUnitCost !== undefined)
                ? [{ ...costField, isReadOnly: isStock }]
                : []),
            ...(!fromPurchase && (!isStock || row?.isActive !== undefined)
                ? [{ ...stateField, isReadOnly: isStock }]
                : []),
        ],
    };

    if ((isCreating || isStock) && !fromPurchase) {
        sections.stock = {
            title: 'Existencias',
            summary: isCreating
                ? !isWaste
                    ? [{ label: 'Motivo del movimiento', value: 'Stock inicial' }]
                    : undefined
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
                    step: quantityStep,
                },
            ],
        };
        sections.notes = { title: 'Notas del movimiento', fields: [notesField] };
    }

    return SECTION_ORDER.flatMap((id) => {
        const section = sections[id];
        return section ? [{ id, ...section }] : [];
    });
};
