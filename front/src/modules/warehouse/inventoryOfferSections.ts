import { inventoryLabels } from './inventoryDisplay.js';
import { getPieceQuantityError, isPiecePresentation } from '@nexus/piece-quantity';
import { materialOfferCreateValidation } from '@nexus/form-validation';
import { calculateConvertedQuantity } from '@nexus/stock-quantity';
import { getLookupArticle } from '../../shared/utils/articleOptions.js';
import { isRecord } from '../../shared/utils/isRecord.js';
import { numberText, convertedQuantityText } from '../../shared/utils/formatNumbers.js';
import type { EditorTarget, InventoryField, InventoryResource } from './inventory.js';
import type { InventoryFieldSpec, InventoryFormSection } from './inventoryFormTypes.js';
import type { LookupItem } from '../../shared/lookup.js';

const readOnlyField = (
    name: InventoryField,
    label: string,
    displayValue: string,
    isWide = false,
): InventoryFieldSpec => ({ name, label, displayValue, isReadOnly: true, isWide });

export const inventoryOfferSections = (
    resource: Exclude<InventoryResource, 'wastes'>,
    { action, row }: EditorTarget,
    options: { article?: LookupItem; initialStock?: string; presentationName?: string },
): InventoryFormSection[] => {
    const labels = inventoryLabels(resource);
    const isCreating = action === 'create';
    const isStock = action === 'stock' || action === 'add-stock';
    const quantityStep = isPiecePresentation(
        isCreating ? options.presentationName : row?.presentation,
    )
        ? 1
        : undefined;
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

    const identity: InventoryFormSection = {
        id: 'identity',
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
    const reference: InventoryFormSection = {
        id: 'reference',
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
        ],
    };
    const inventory: InventoryFormSection = {
        id: 'inventory',
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
            {
                name: 'minStock',
                label: labels.minStock,
                type: 'number',
                step: quantityStep,
                isReadOnly: isStock,
            },
            ...(!isStock || row?.maxUnitCost !== undefined
                ? [
                      {
                          name: 'maxUnitCost',
                          label: labels.maxUnitCost,
                          type: 'number',
                          isReadOnly: isStock,
                      } satisfies InventoryFieldSpec,
                  ]
                : []),
            { name: 'isActive', label: labels.isActive, type: 'checkbox', isReadOnly: isStock },
            ...(action === 'stock'
                ? [
                      {
                          name: 'reasonId',
                          label: 'Motivo del ajuste',
                          type: 'lookup',
                      } satisfies InventoryFieldSpec,
                  ]
                : []),
            ...(isCreating || isStock
                ? [
                      {
                          name: 'observations',
                          label: 'Observaciones',
                          type: 'textarea',
                          isWide: true,
                      } satisfies InventoryFieldSpec,
                  ]
                : []),
        ],
    };

    return [identity, reference, inventory];
};
