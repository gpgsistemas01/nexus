import { formatDecimal } from './formatUtils.js';

export const getBase = (item = {}) => (
    item.base ?? item.material?.base ?? item.supplierMaterial?.material?.base ?? null
);
export const getHeight = (item = {}) => (
    item.height ?? item.material?.height ?? item.supplierMaterial?.material?.height ?? null
);
export const getPresentation = (item = {}) => (
    item.presentation?.name
    ?? item.material?.presentation?.name
    ?? item.supplierMaterial?.material?.presentation?.name
    ?? ''
);

export const getPresentationId = (item = {}) => (
    item.presentationId
    ?? item.presentation?.id
    ?? item.material?.presentation?.id
    ?? item.supplierMaterial?.material?.presentation?.id
    ?? null
);
export const getUnitMeasure = (item = {}) => (
    (typeof item.unitMeasure === 'string' ? item.unitMeasure : item.unitMeasure?.symbol ?? item.unitMeasure?.name)
    ?? item.material?.unitMeasure?.symbol
    ?? item.supplierMaterial?.material?.unitMeasure?.symbol
    ?? ''
);
export const getUnitMeasureId = (item = {}) => (
    item.unitMeasureId
    ?? item.unitMeasure?.id
    ?? item.material?.unitMeasure?.id
    ?? item.supplierMaterial?.material?.unitMeasure?.id
    ?? null
);
export const getMaxUnitCost = (item) => item.maxUnitCost ?? item.supplierMaterial?.maxUnitCost;
export const getCurrentStock = (item) => item.currentStock ?? item.supplierMaterial?.currentStock;
export const getMinStock = (item) => item.minStock ?? item.supplierMaterial?.minStock;
export const getIsActive = (item = {}) => (
    item.isActive ?? item.supplierMaterial?.isActive ?? false
);
export const getMaterialName = (item = {}) => (
    item.material?.name
    ?? item.supplierMaterial?.material?.name
    ?? item.materialName
    ?? item.name
    ?? ''
);
export const getSupplierName = (item = {}) => {
    const supplier = item.supplier ?? item.supplierMaterial?.supplier;

    if (typeof supplier === 'string') return supplier;

    return supplier?.tradeName ?? supplier?.name ?? '';
};

export const buildInventorySelectText = (item = {}) => {

    const supplierName = getSupplierName(item);
    const name = getMaterialName(item);
    const base = getBase(item);
    const height = getHeight(item);
    const dimensions = base == null || height == null
        ? 'Sin medidas'
        : `${ base } × ${ height }`;
    const weights = item.coneWeightKg == null || item.totalWeightKg == null ? '' : ` · Neto ${formatDecimal(item.weightKg)} kg, cono ${formatDecimal(item.coneWeightKg)} kg`;
    const itemIdentity = `${ name } (${ dimensions })${weights}`;

    return supplierName
        ? `${ itemIdentity } · ${ supplierName }`
        : itemIdentity;
};
