import { createVersionDto } from './versionDTO.js';
import { toNumber } from '../utils/formattersUtils.js';
import { WASTE_ROLL_WEIGHT_FIELDS } from '../public/js/constants/inventory.js';

const buildWasteRegistrationDataDto = (body = {}) => ({
    materialId: body.materialId,
    supplierId: body.supplierId,
    base: toNumber(body.base),
    height: toNumber(body.height),
    ...Object.fromEntries(WASTE_ROLL_WEIGHT_FIELDS.filter(field => Object.prototype.hasOwnProperty.call(body, field))
        .map(field => [field, toNumber(body[field])]))
});

const buildWasteIdentityDto = (body = {}) => ({
    ...(Object.prototype.hasOwnProperty.call(body, 'name') ? { name: body.name.trim() } : {})
});

const buildWasteSecondaryDataDto = (body = {}) => ({
    ...Object.prototype.hasOwnProperty.call(body, 'minStock') && body.minStock !== null ? { minStock: Number(body.minStock) } : {},
    ...(Object.prototype.hasOwnProperty.call(body, 'isActive') ? { isActive: Boolean(body.isActive) } : {}),
    ...(Object.prototype.hasOwnProperty.call(body, 'maxUnitCost') ? { maxUnitCost: toNumber(body.maxUnitCost) } : {})
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
    initialQuantity: Number(body.initialQuantity),
    ...buildWasteObservationsDto(body)
});

export const createWasteDtoForEdit = (body = {}) => ({
    ...createVersionDto(body),
    ...buildWasteIdentityDto(body),
    ...buildWasteSecondaryDataDto(body)
});

export const createWasteDtoForStockAdjustment = (body = {}) => ({
    ...createVersionDto(body),
    newStock: Number(body.newStock),
    ...buildWasteObservationsDto(body),
    ...(Object.prototype.hasOwnProperty.call(body, 'reasonId') ? { reasonId: body.reasonId } : {})
});

export const createWasteDtoForStockAddition = (body = {}) => ({
    quantity: Number(body.quantity),
    ...buildWasteObservationsDto(body)
});
