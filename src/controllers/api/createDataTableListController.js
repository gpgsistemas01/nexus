import {
    getDataTableOrder,
    getDataTablePaging,
    getDataTableSearch
} from '../../utils/requestQueryUtils.js';

/**
 * Creates the standard API controller used by DataTable-backed catalogues.
 *
 * Keeping request parsing here prevents each catalogue controller from having
 * to reproduce the same paging, searching, ordering and response workflow.
 */
export const createDataTableListController = ({
    findAll,
    columns,
    defaultDirection = 'asc'
}) => async (req, res) => {
    const { skip, take } = getDataTablePaging(req.query);
    const search = getDataTableSearch(req.query);
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns,
        defaultDirection
    });

    const result = await findAll({
        skip,
        take,
        search,
        orderBy,
        orderDir
    });

    return res.status(200).json(result);
};
