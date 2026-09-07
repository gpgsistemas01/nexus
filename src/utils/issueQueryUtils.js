import {
    getDataTableOrder,
    getDataTablePaging,
    getDataTableSearch
} from './requestQueryUtils.js';

export const getIssueDataTableQuery = ({ query = {}, columns }) => {
    const { skip, take } = getDataTablePaging(query);
    const { orderBy, orderDir } = getDataTableOrder({
        query,
        columns,
        defaultDirection: 'desc'
    });

    return {
        skip,
        take,
        search: getDataTableSearch(query),
        fulfillmentStatusId: query.fulfillmentStatusId || '',
        observationsSearch: query.observationsSearch || '',
        startDate: query.startDate || '',
        endDate: query.endDate || '',
        clientId: query.clientId || '',
        departmentId: query.departmentId || '',
        personId: query.personId || '',
        orderBy,
        orderDir
    };
};
