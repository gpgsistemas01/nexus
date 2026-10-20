import { createVersionDto } from './versionDTO.js';

const MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT = 'goodsReceipt';

const buildMaterialDataDto = (body = {}) => ({
    name: body.name.trim(),
    supplierId: body.supplierId,
    presentationId: body.presentationId,
    unitMeasureId: body.unitMeasureId,
    base: body.base ?? null,
    height: body.height ?? null
});

const buildMaterialSecondaryDataDto = (body = {}) => ({
    ...body.minStock !== undefined && body.minStock !== null ? { minStock: body.minStock } : {},
    maxUnitCost: body.maxUnitCost,
    ...(Object.prototype.hasOwnProperty.call(body, 'isActive') ? { isActive: body.isActive } : {})
});

const buildMaterialStockDto = (body = {}, { includeSupplier = true, includeReason = true } = {}) => ({
    ...(includeSupplier ? { supplierId: body.supplierId } : {}),
    ...Object.prototype.hasOwnProperty.call(body, 'newStock') ? { newStock: body.newStock } : {},
    ...Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations ? body.observations.trim() : null } : {},
    ...includeReason && Object.prototype.hasOwnProperty.call(body, 'reasonId') ? { reasonId: body.reasonId } : {}
});

export const createMaterialDtoForRegister = (body = {}) => {
    const materialData = buildMaterialDataDto(body);

    if (body.creationContext === MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT) {
        return {
            ...materialData,
            ...(body.minStock !== undefined && body.minStock !== null
                ? { minStock: body.minStock }
                : {}),
            ...(Object.prototype.hasOwnProperty.call(body, 'isActive') ? { isActive: body.isActive } : {})
        };
    }

    return {
        ...materialData,
        ...buildMaterialSecondaryDataDto(body),
        ...buildMaterialStockDto(body, { includeSupplier: false, includeReason: false })
    };
};

export const createMaterialDtoForEdit = (body = {}) => ({
    ...createVersionDto(body),
    ...(body.expectedMaterialVersion !== undefined && { expectedMaterialVersion: body.expectedMaterialVersion }),
    name: body.name.trim(),
    supplierId: body.supplierId,
    ...buildMaterialSecondaryDataDto(body)
});

export const createMaterialDtoForStockUpdate = (body = {}) => ({ ...buildMaterialStockDto(body), ...createVersionDto(body) });
