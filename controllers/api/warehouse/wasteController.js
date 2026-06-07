import { successCodeMessages } from '../../../messages/codeMessages.js';
import { findAllProducts } from '../../../services/warehouse/products/productService.js';
import { createWasteAdjustment } from '../../../services/warehouse/wasteService.js';
import { createWasteDto } from '../../../dtos/wasteDTO.js';
import { sanitizeEmptyStrings } from '../../../utils/formattersUtils.js';
import { getDataTableOrder, getDataTablePaging, getDataTableSearch } from '../../../utils/requestQueryUtils.js';

export const getAllWastes = async (req, res) => {

    const { skip, take } = getDataTablePaging(req.query);
    const search = getDataTableSearch(req.query);
    const supplierId = req.query.supplierId || null;

    const columns = ['name', 'base', 'height', null, 'minStock', null, null, null, null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const result = await findAllProducts({
        skip,
        take,
        search,
        supplierId,
        orderBy,
        orderDir
    });

    return res.status(200).json(result);
};

export const registerWaste = async (req, res) => {

    const wasteDto = sanitizeEmptyStrings(createWasteDto(req.body));

    const product = await createWasteAdjustment({
        wasteDto,
        userId: req.user.id
    });

    return res.status(200).json({
        product,
        code: successCodeMessages.CREATED_WASTE
    });
};
