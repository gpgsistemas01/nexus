import {
    materialCreateValidation,
    goodsReceiptMaterialCreateValidation,
    materialEditValidation,
    materialStockValidation,
    wasteValidation,
    wasteEditValidation,
    wasteStockAdjustmentValidation,
    wasteStockAdditionValidation,
} from '@nexus/form-validation';
import {
    calculateWasteNetWeight,
    calculateWasteRollLength,
    isRollPresentation,
    prepareWasteRollReference,
} from '@nexus/waste-measurements';
import type {
    EditorTarget,
    InventoryPayload,
    InventoryResource,
    InventoryValues,
} from './inventory.js';
import type { LookupItem } from '../../shared/lookup.js';

export const initialInventoryValues = (target: EditorTarget): InventoryValues => {
    const row = target.row;
    return {
        name: row?.name ?? '',
        supplierId: row?.supplierId ?? '',
        presentationId: row?.presentationId ?? '',
        unitMeasureId: row?.unitMeasureId ?? '',
        materialId: '',
        base: String(row?.base ?? ''),
        height: String(row?.height ?? ''),
        minStock: String(row?.minStock ?? ''),
        maxUnitCost: String(row ? (row.maxUnitCost ?? '') : '0'),
        isActive: row?.isActive ?? true,
        newStock: String(row?.currentStock ?? '0'),
        initialQuantity: '0',
        quantity: '',
        reasonId: '',
        observations: '',
        coneWeightKg: '',
        totalWeightKg: '',
        referenceRollTotalWeightKg: '',
    };
};

export const unitUsesMeasurements = (unit?: Record<string, unknown>) =>
    /\b(?:metros?|litros?)\b/i.test(String(unit?.name ?? '')) ||
    /^(?:m[²³23]?|mt|mts|l|lt|lts)$/i.test(String(unit?.symbol ?? ''));

export const previewWaste = (values: InventoryValues, template?: LookupItem) => {
    const isRoll = isRollPresentation(
        template?.data.presentation && typeof template.data.presentation === 'object'
            ? (template.data.presentation as { name?: string }).name
            : '',
    );
    const reference = template ? prepareWasteRollReference({ material: template.data }) : null;
    const weightKg = isRoll
        ? calculateWasteNetWeight({
              coneWeightKg: values.coneWeightKg,
              totalWeightKg: values.totalWeightKg,
          })
        : null;
    const referenceNetWeightKg = isRoll
        ? calculateWasteNetWeight({
              coneWeightKg: values.coneWeightKg,
              totalWeightKg: values.referenceRollTotalWeightKg,
          })
        : null;
    const length =
        reference && weightKg != null && referenceNetWeightKg != null
            ? calculateWasteRollLength({
                  weightKg,
                  referenceNetWeightKg,
                  referenceLengthM: reference.lengthM,
              })
            : null;
    return {
        isRoll,
        weightKg,
        base: isRoll ? (reference?.widthField === 'base' ? reference.widthM : length) : values.base,
        height: isRoll
            ? reference?.widthField === 'height'
                ? reference.widthM
                : length
            : values.height,
    };
};

export const inventoryRules = (
    resource: InventoryResource,
    action: EditorTarget['action'],
    creationContext?: 'goodsReceipt',
) => {
    if (resource !== 'wastes' && action === 'create' && creationContext === 'goodsReceipt')
        return goodsReceiptMaterialCreateValidation;

    if (action === 'delete') return {};

    if (action === 'add-stock') return wasteStockAdditionValidation;

    if (resource === 'wastes')
        return action === 'stock'
            ? wasteStockAdjustmentValidation
            : action === 'edit'
              ? wasteEditValidation
              : wasteValidation;

    return action === 'stock'
        ? materialStockValidation
        : action === 'edit'
          ? materialEditValidation
          : materialCreateValidation;
};

export const buildInventoryPayload = (
    resource: InventoryResource,
    target: EditorTarget,
    values: InventoryValues,
    preview: ReturnType<typeof previewWaste>,
    creationContext?: 'goodsReceipt',
): InventoryPayload => {
    const { action, row } = target;
    if (resource !== 'wastes' && action === 'create' && creationContext === 'goodsReceipt')
        return {
            creationContext,
            name: String(values.name).trim(),
            supplierId: String(values.supplierId),
            presentationId: String(values.presentationId),
            unitMeasureId: String(values.unitMeasureId),
            ...(resource === 'materials'
                ? {
                      base: values.base === '' ? null : Number(values.base),
                      height: values.height === '' ? null : Number(values.height),
                  }
                : {}),
            ...(values.minStock === '' ? {} : { minStock: Number(values.minStock) }),
            isActive: values.isActive,
        };

    const observations = String(values.observations).trim();
    if (action === 'delete') return {};

    if (action === 'add-stock') return { quantity: Number(values.quantity), observations };

    if (action === 'stock')
        return {
            expectedVersion: row!.version,
            newStock: Number(values.newStock),
            reasonId: String(values.reasonId),
            observations,
            ...(resource !== 'wastes' ? { supplierId: row!.supplierId } : {}),
        };

    const data: InventoryPayload = {
        name: String(values.name).trim(),
        isActive: Boolean(values.isActive),
        maxUnitCost: Number(values.maxUnitCost),
        ...(values.minStock !== '' ? { minStock: Number(values.minStock) } : {}),
    };
    if (action === 'edit')
        return {
            ...data,
            expectedVersion: row!.version,
            ...(resource !== 'wastes'
                ? { supplierId: row!.supplierId, expectedMaterialVersion: row!.materialVersion! }
                : {}),
        };

    if (resource === 'wastes')
        return {
            ...data,
            supplierId: String(values.supplierId),
            materialId: String(values.materialId),
            base: Number(preview.base),
            height: Number(preview.height),
            initialQuantity: Number(values.initialQuantity),
            observations,
            ...(preview.isRoll
                ? {
                      coneWeightKg: Number(values.coneWeightKg),
                      totalWeightKg: Number(values.totalWeightKg),
                      referenceRollTotalWeightKg: Number(values.referenceRollTotalWeightKg),
                  }
                : {}),
        };

    return {
        ...data,
        supplierId: String(values.supplierId),
        presentationId: String(values.presentationId),
        unitMeasureId: String(values.unitMeasureId),
        ...(resource === 'materials'
            ? {
                  base: values.base === '' ? null : Number(values.base),
                  height: values.height === '' ? null : Number(values.height),
              }
            : {}),
        newStock: Number(values.newStock),
        observations,
    };
};
