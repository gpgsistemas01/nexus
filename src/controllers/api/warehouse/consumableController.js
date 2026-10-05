import { PERMISSIONS } from '../../../constants/permissions.js';
import { createConsumable, deleteConsumable, findAllConsumables, updateConsumable, updateConsumableStock } from '../../../services/warehouse/consumables/consumableService.js';
import { createMaterialDtoForEdit, createMaterialDtoForRegister, createMaterialDtoForStockUpdate } from '../../../dtos/materialDTO.js';
import { sanitizeEmptyStrings } from '../../../utils/formattersUtils.js';
import { successCodeMessages } from '../../../messages/codeMessages.js';
import { emitInventoryUpdated } from '../../../utils/socketUtils.js';
import { getDataTableOrder, getDataTablePaging, getDataTableSearch } from '../../../utils/requestQueryUtils.js';

export const getAllConsumables = async (req, res) => {
    const { skip, take } = getDataTablePaging(req.query);
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns: ['name', null, null, null, null, null, null]
    });
    const result = await findAllConsumables({
        skip,
        take,
        search: getDataTableSearch(req.query),
        supplierId: req.query.supplierId || null,
        orderBy,
        orderDir,
        canReadCosts: req.user.permissions.includes(PERMISSIONS.INVENTORY_COSTS_READ)
    });

    return res.status(200).json(result);
};

export const registerConsumable = async (req, res) => {
    const consumableDto = sanitizeEmptyStrings(createMaterialDtoForRegister(req.body));
    const material = await createConsumable({ consumableDto, userId: req.user.id });

    return res.status(200).json({ material, code: successCodeMessages.CREATED_MATERIAL });
};

export const editConsumable = async (req, res) => {
    const consumableDto = sanitizeEmptyStrings(createMaterialDtoForEdit(req.body));
    const material = await updateConsumable(consumableDto, req.params.id);

    return res.status(200).json({ material, code: successCodeMessages.UPDATED_MATERIAL });
};

export const editConsumableStock = async (req, res) => {
    const consumableDto = sanitizeEmptyStrings(createMaterialDtoForStockUpdate(req.body));
    const material = await updateConsumableStock({
        consumableDto,
        userId: req.user.id,
        id: req.params.id
    });

    emitInventoryUpdated({ context: 'material', source: 'stock-adjustment-created' });
    return res.status(200).json({ material, code: successCodeMessages.UPDATED_MATERIAL });
};

export const removeConsumable = async (req, res) => {
    const material = await deleteConsumable(req.params.id);

    return res.status(200).json({ material, code: successCodeMessages.DELETED_MATERIAL });
};
