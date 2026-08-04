import { toNumber } from '../utils/formattersUtils.js';
const buildWasteBaseDto = (body = {}) => ({
    supplierMaterialId: body.supplierMaterialId,
    base: toNumber(body.base),
    height: toNumber(body.height)
});

const buildWasteStockDto = (body = {}, { includeReason = true } = {}) => ({
    currentStock: Number(body.currentStock),
    ...Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations ? body.observations.trim() : null } : {},
    ...includeReason && Object.prototype.hasOwnProperty.call(body, 'reasonId') ? { reasonId: body.reasonId } : {}
});

export const createWasteDto = (body = {}) => ({
    ...buildWasteBaseDto(body),
    ...buildWasteStockDto(body, { includeReason: false })
});

export const createWasteDataDto = (body = {}) => buildWasteBaseDto(body);

export const createWasteStockDto = (body = {}) => buildWasteStockDto(body);
