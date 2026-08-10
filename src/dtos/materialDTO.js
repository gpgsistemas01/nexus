import { normalizeMaterialDimensions, toNumber } from '../utils/formattersUtils.js';

const buildMaterialDataDto = (body = {}) => ({
    name: body.name.trim(),
    supplierId: body.supplierId,
    presentationId: body.presentationId,
    unitMeasureId: body.unitMeasureId,
    ...normalizeMaterialDimensions(body)
});

const buildMaterialSecondaryDataDto = (body = {}) => ({
    ...Object.prototype.hasOwnProperty.call(body, 'minStock') && body.minStock !== null ? { minStock: Number(body.minStock) } : {},
    maxUnitCost: toNumber(body.maxUnitCost),
    ...(Object.prototype.hasOwnProperty.call(body, 'isActive') ? { isActive: Boolean(body.isActive) } : {})
});

const buildMaterialStockDto = (body = {}, { includeSupplier = true, includeReason = true } = {}) => ({
    ...(includeSupplier ? { supplierId: body.supplierId } : {}),
    ...Object.prototype.hasOwnProperty.call(body, 'newStock') ? { newStock: Number(body.newStock) } : {},
    ...Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations ? body.observations.trim() : null } : {},
    ...includeReason && Object.prototype.hasOwnProperty.call(body, 'reasonId') ? { reasonId: body.reasonId } : {}
});

export const createMaterialDtoForRegister = (body = {}) => ({
    ...buildMaterialDataDto(body),
    ...buildMaterialSecondaryDataDto(body),
    ...buildMaterialStockDto(body, { includeSupplier: false, includeReason: false })
});

export const createMaterialDtoForEdit = (body = {}) => ({
    name: body.name.trim(),
    supplierId: body.supplierId,
    ...buildMaterialSecondaryDataDto(body)
});

export const createMaterialDtoForStockUpdate = (body = {}) => buildMaterialStockDto(body);
