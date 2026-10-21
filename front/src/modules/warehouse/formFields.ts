import type { EditorTarget, InventoryField, InventoryResource } from './inventory.js';
import type { previewWaste } from './formModel.js';

export interface InventoryFieldSpec {
    name: InventoryField;
    label: string;
    type?: 'number' | 'lookup' | 'checkbox' | 'textarea';
    isReadOnly?: boolean;
    displayValue?: string;
    hint?: string;
}

export const inventoryFields = (
    resource: InventoryResource,
    target: EditorTarget,
    preview: ReturnType<typeof previewWaste>,
): InventoryFieldSpec[] => {
    if (target.action === 'delete') return [];
    if (target.action === 'stock' || target.action === 'add-stock')
        return [
            {
                name: target.action === 'stock' ? 'newStock' : 'quantity',
                label: target.action === 'stock' ? 'Nuevo stock' : 'Cantidad a agregar',
                type: 'number',
            },
            ...(target.action === 'stock'
                ? [
                      {
                          name: 'reasonId' as const,
                          label: 'Motivo del ajuste',
                          type: 'lookup' as const,
                      },
                  ]
                : []),
            { name: 'observations', label: 'Observaciones', type: 'textarea' },
        ];
    const isCreating = target.action === 'create';
    const isWaste = resource === 'wastes';
    return [
        ...(isCreating
            ? [{ name: 'supplierId' as const, label: 'Proveedor', type: 'lookup' as const }]
            : []),
        ...(isCreating && isWaste
            ? [
                  {
                      name: 'materialId' as const,
                      label: 'Material de referencia del proveedor',
                      type: 'lookup' as const,
                  },
              ]
            : []),
        { name: 'name', label: isWaste ? 'Nombre de la merma' : 'Nombre' },
        ...(isCreating && !isWaste
            ? [
                  {
                      name: 'presentationId' as const,
                      label: 'Presentación',
                      type: 'lookup' as const,
                  },
                  {
                      name: 'unitMeasureId' as const,
                      label: 'Unidad de medida',
                      type: 'lookup' as const,
                  },
              ]
            : []),
        ...(isCreating && isWaste && preview.isRoll
            ? [
                  {
                      name: 'referenceRollTotalWeightKg' as const,
                      label: 'Peso del rollo completo con cono (kg)',
                      type: 'number' as const,
                  },
                  {
                      name: 'coneWeightKg' as const,
                      label: 'Peso del cono de la merma (kg)',
                      type: 'number' as const,
                  },
                  {
                      name: 'totalWeightKg' as const,
                      label: 'Peso de la merma con cono (kg)',
                      type: 'number' as const,
                  },
              ]
            : []),
        ...(isCreating && resource !== 'consumables'
            ? (['base', 'height'] as const).map((name) => ({
                  name,
                  label: name === 'base' ? 'Base (m)' : 'Altura (m)',
                  type: 'number' as const,
                  isReadOnly: isWaste && preview.isRoll,
                  ...(isWaste && preview.isRoll
                      ? {
                            displayValue: String(preview[name] ?? ''),
                            hint: 'Calculada a partir de los pesos y el material de referencia.',
                        }
                      : {}),
              }))
            : []),
        { name: 'minStock', label: 'Stock mínimo', type: 'number' },
        { name: 'maxUnitCost', label: 'Costo máximo unitario', type: 'number' },
        { name: 'isActive', label: 'Activo', type: 'checkbox' },
        ...(isCreating
            ? [
                  {
                      name: (isWaste ? 'initialQuantity' : 'newStock') as InventoryField,
                      label: 'Cantidad inicial',
                      type: 'number' as const,
                  },
                  {
                      name: 'observations' as const,
                      label: 'Observaciones',
                      type: 'textarea' as const,
                  },
              ]
            : []),
    ];
};
