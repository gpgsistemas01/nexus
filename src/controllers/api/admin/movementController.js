import { findAllMaterialMovements, findAllWasteMovements } from "../../../services/inventory/movementQueryService.js";
import { getDataTableOrder, getDataTablePaging, getDataTableSearch } from "../../../utils/requestQueryUtils.js";

const MOVEMENT_COLUMNS = ['date', 'type', 'referenceNumber', null, null, null, null, null, null, null];

const getMovementListParams = (req) => {
    const { skip, take } = getDataTablePaging(req.query);
    const hasRequestedOrder = Boolean(req.query.order || req.query['order[0][column]']);
    const requestedOrder = getDataTableOrder({
        query: req.query,
        columns: MOVEMENT_COLUMNS,
        defaultDirection: 'desc'
    });

    return {
        skip,
        take,
        search: getDataTableSearch(req.query),
        startDate: req.query.startDate || '',
        endDate: req.query.endDate || '',
        movementType: req.query.movementType || '',
        materialId: req.query.materialId || '',
        supplierId: req.query.supplierId || '',
        ...(hasRequestedOrder
            ? requestedOrder
            : { orderBy: 'date', orderDir: 'desc' })
    };
};

const createMovementListHandler = findMovements => async (req, res) => {
    const result = await findMovements(getMovementListParams(req));

    return res.status(200).json(result);
};

export const getAllMaterialMovements = createMovementListHandler(findAllMaterialMovements);
export const getAllWasteMovements = createMovementListHandler(findAllWasteMovements);
