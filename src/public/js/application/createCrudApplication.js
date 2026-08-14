import { createSuccessResponseFromRequest } from '../utils/responseUtils.js';

export const createApplicationMutation = ({ request, dataKey = null }) => async ({
    formData,
    id,
    detailId
} = {}) => {
    const response = await request({
        data: formData,
        ...(id === undefined ? {} : { id }),
        ...(detailId === undefined ? {} : { detailId })
    });

    return createSuccessResponseFromRequest({ response, dataKey });
};

export const createCrudApplication = ({ requests, dataKey = null, dataKeys = {} }) => Object.freeze({
    getAll: (params = {}) => requests.getAll({ params }),
    register: createApplicationMutation({
        request: requests.register,
        dataKey: dataKeys.register ?? dataKey
    }),
    edit: createApplicationMutation({
        request: requests.edit,
        dataKey: dataKeys.edit ?? dataKey
    })
});
