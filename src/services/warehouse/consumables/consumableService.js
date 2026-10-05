import { MATERIAL_TYPES } from '../../../constants/inventory.js';
import { findAllSupplierMaterials } from '../materials/supplierMaterialService.js';
import { createMaterial, deleteMaterial, updateMaterial, updateMaterialStock } from '../materials/materialService.js';

export const findAllConsumables = async ({
    skip = 0,
    take = 10,
    search = '',
    supplierId = null,
    orderBy = 'name',
    orderDir = 'asc',
    canReadCosts = false
}) => findAllSupplierMaterials({
    skip,
    take,
    search,
    supplierId,
    type: MATERIAL_TYPES.CONSUMABLE,
    orderBy,
    orderDir,
    canReadCosts
});

export const createConsumable = ({ consumableDto, userId = null }) => createMaterial({
    materialDto: { ...consumableDto, base: null, height: null },
    userId,
    type: MATERIAL_TYPES.CONSUMABLE
});

export const updateConsumable = (consumableDto, id) => updateMaterial(consumableDto, id, {
    type: MATERIAL_TYPES.CONSUMABLE
});

export const updateConsumableStock = ({ consumableDto, userId, id }) => updateMaterialStock({
    materialDto: consumableDto,
    userId,
    id,
    type: MATERIAL_TYPES.CONSUMABLE
});

export const deleteConsumable = id => deleteMaterial(id, {
    type: MATERIAL_TYPES.CONSUMABLE
});
