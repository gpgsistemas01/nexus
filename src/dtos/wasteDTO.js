import { createVersionDto } from './versionDTO.js';
import { WASTE_ROLL_WEIGHT_FIELDS } from '../public/js/constants/inventory.js';

const buildWasteRegistrationDataDto = (body = {}) => ({
    materialId: body.materialId,
    supplierId: body.supplierId,
    base: body.base ?? null,
    height: body.height ?? null,
    ...Object.fromEntries(WASTE_ROLL_WEIGHT_FIELDS.filter(field => body[field] !== undefined)
        .map(field => [field, body[field]]))
});

const buildWasteIdentityDto = (body = {}) => ({
    ...(Object.prototype.hasOwnProperty.call(body, 'name') ? { name: body.name.trim() } : {})
});

const buildWasteSecondaryDataDto = (body = {}) => ({
    ...body.minStock !== undefined && body.minStock !== null ? { minStock: body.minStock } : {},
    ...(Object.prototype.hasOwnProperty.call(body, 'isActive') ? { isActive: body.isActive } : {}),
    ...(Object.prototype.hasOwnProperty.call(body, 'maxUnitCost') ? { maxUnitCost: body.maxUnitCost } : {})
});

const buildWasteObservationsDto = (body = {}) => (
    Object.prototype.hasOwnProperty.call(body, 'observations')
        ? { observations: body.observations ? body.observations.trim() : null }
        : {}
);

export const createWasteDtoForRegister = (body = {}) => ({
    ...buildWasteRegistrationDataDto(body),
    ...buildWasteIdentityDto(body),
    ...buildWasteSecondaryDataDto(body),
    initialQuantity: body.initialQuantity,
    ...buildWasteObservationsDto(body)
});

export const createWasteDtoForEdit = (body = {}) => ({
    ...createVersionDto(body),
    ...buildWasteIdentityDto(body),
    ...buildWasteSecondaryDataDto(body)
});

export const createWasteDtoForStockAdjustment = (body = {}) => ({
    ...createVersionDto(body),
    newStock: body.newStock,
    ...buildWasteObservationsDto(body),
    ...(Object.prototype.hasOwnProperty.call(body, 'reasonId') ? { reasonId: body.reasonId } : {})
});

export const createWasteDtoForStockAddition = (body = {}) => ({
    quantity: body.quantity,
    ...buildWasteObservationsDto(body)
});
