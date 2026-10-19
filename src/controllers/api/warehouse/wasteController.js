import { successCodeMessages } from '../../../messages/codeMessages.js';
import { addWasteStock, createWaste, findAllWastes, updateWaste, updateWasteStock } from '../../../services/warehouse/wastes/wasteService.js';
import { createWasteDtoForEdit, createWasteDtoForRegister, createWasteDtoForStockAddition, createWasteDtoForStockAdjustment } from '../../../dtos/wasteDTO.js';
import { sanitizeEmptyStrings } from '../../../utils/formattersUtils.js';
import { getDataTableOrder, getDataTablePaging, getDataTableSearch } from '../../../utils/requestQueryUtils.js';
import { emitInventoryUpdated } from '../../../utils/socketUtils.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { findWasteMaterialTemplates } from '../../../services/warehouse/wastes/wasteMaterialService.js';

export const getWasteMaterialTemplates = async (req, res) => {
    const { skip, take } = getDataTablePaging(req.query);
    const result = await findWasteMaterialTemplates({
        search: getDataTableSearch(req.query),
        skip,
        take,
        supplierId: req.query.supplierId || null
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

    const waste = await createWaste({
        wasteDto: sanitizedWasteDto,
        userId: req.user.id,
        operationId: req.body.operationId
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

    const stockAdjustmentDto = createWasteDtoForStockAdjustment(req.body);
    const sanitizedStockAdjustmentDto = sanitizeEmptyStrings(stockAdjustmentDto);

    const waste = await updateWasteStock({
        id: req.params.id,
        stockAdjustmentDto: sanitizedStockAdjustmentDto,
        userId: req.user.id
    });

    emitInventoryUpdated({ context: 'waste', source: 'waste-stock-adjustment-created' });

    return res.status(200).json({
        waste,
        code: successCodeMessages.UPDATED_WASTE
    });
};

export const registerWasteStockAddition = async (req, res) => {
    const stockEntryDto = createWasteDtoForStockAddition(req.body);
    const waste = await addWasteStock({ id: req.params.id, stockEntryDto, userId: req.user.id, operationId: req.body.operationId });

    emitInventoryUpdated({ context: 'waste', source: 'waste-stock-added' });

    return res.status(200).json({ waste, code: successCodeMessages.UPDATED_WASTE });
};
