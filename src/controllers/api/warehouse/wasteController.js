import { successCodeMessages } from '../../../messages/codeMessages.js';
import { createWasteWithInitialStockAdjustment, findAllWastes, updateWaste, updateWasteStock } from '../../../services/warehouse/wastes/wasteService.js';
import { createWasteDtoForEdit, createWasteDtoForRegister, createWasteDtoForStockUpdate } from '../../../dtos/wasteDTO.js';
import { sanitizeEmptyStrings } from '../../../utils/formattersUtils.js';
import { getDataTableOrder, getDataTablePaging, getDataTableSearch } from '../../../utils/requestQueryUtils.js';
import { emitInventoryUpdated } from '../../../utils/socketUtils.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { findWasteMaterialTemplates } from '../../../services/warehouse/wastes/wasteMaterialService.js';

export const getWasteMaterialTemplates = async (req, res) => {
    const { take } = getDataTablePaging(req.query);
    const result = await findWasteMaterialTemplates({
        search: getDataTableSearch(req.query),
        take
    });

    return res.status(200).json(result);
};

export const getAllWastes = async (req, res) => {

    const { skip, take } = getDataTablePaging(req.query);
    const search = getDataTableSearch(req.query);
    const supplierId = req.query.supplierId || null;

    const columns = ['name', null, null, null, null, null, null, null, null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const result = await findAllWastes({
        skip,
        take,
        search,
        supplierId,
        orderBy,
        orderDir,
        canReadCosts: req.user.permissions.includes(PERMISSIONS.INVENTORY_COSTS_READ)
    });

    return res.status(200).json(result);
};

export const registerWaste = async (req, res) => {

    const wasteDto = createWasteDtoForRegister(req.body);
    const sanitizedWasteDto = sanitizeEmptyStrings(wasteDto);

    const waste = await createWasteWithInitialStockAdjustment({
        wasteDto: sanitizedWasteDto,
        userId: req.user.id
    });

    emitInventoryUpdated({ context: 'waste', source: 'waste-created' });

    return res.status(200).json({
        waste,
        code: successCodeMessages.CREATED_WASTE
    });
};

export const editWaste = async (req, res) => {

    const wasteDto = createWasteDtoForEdit(req.body);
    const sanitizedWasteDto = sanitizeEmptyStrings(wasteDto);

    const waste = await updateWaste({
        id: req.params.id,
        wasteDto: sanitizedWasteDto
    });

    return res.status(200).json({
        waste,
        code: successCodeMessages.UPDATED_WASTE
    });
};

export const editWasteStock = async (req, res) => {

    const wasteStockDto = createWasteDtoForStockUpdate(req.body);
    const sanitizedWasteStockDto = sanitizeEmptyStrings(wasteStockDto);

    const waste = await updateWasteStock({
        id: req.params.id,
        wasteStockDto: sanitizedWasteStockDto,
        userId: req.user.id
    });

    emitInventoryUpdated({ context: 'waste', source: 'waste-stock-adjustment-created' });

    return res.status(200).json({
        waste,
        code: successCodeMessages.UPDATED_WASTE
    });
};
