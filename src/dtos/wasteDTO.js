import { toNumber } from '../utils/formattersUtils.js';

const buildWasteBaseDto = (body = {}) => ({
    supplierMaterialId: body.supplierMaterialId,
    base: toNumber(body.base),
    height: toNumber(body.height)
});

const buildWasteSecondaryDataDto = (body = {}) => ({
    ...Object.prototype.hasOwnProperty.call(body, 'minStock') && body.minStock !== null ? { minStock: Number(body.minStock) } : {},
    isActive: body.isActive
});

const buildWasteStockDto = (body = {}, { includeReason = true } = {}) => ({
    currentStock: Number(body.currentStock),
    ...Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations ? body.observations.trim() : null } : {},
    ...includeReason && Object.prototype.hasOwnProperty.call(body, 'reasonId') ? { reasonId: body.reasonId } : {}
});

export const createNewWasteDto = (body = {}) => ({
    ...buildWasteBaseDto(body),
    ...buildWasteSecondaryDataDto(body),
    ...buildWasteStockDto(body, { includeReason: false })
});

export const createEditedWasteDto = (body = {}) => buildWasteSecondaryDataDto(body);

export const createWasteStockDto = (body = {}) => buildWasteStockDto(body);
