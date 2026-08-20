import { createSuccessResponseFromRequest } from '../utils/responseUtils.js';
import { FORM_MODES } from '../constants/formModes.js';

export const createApplicationMutation = ({ request, dataKey = null }) => async ({
    formData,
    id,
    detailId,
    ...requestOptions
} = {}) => {
    const response = await request({
        ...(formData === undefined ? {} : { data: formData }),
        ...(id === undefined ? {} : { id }),
        ...(detailId === undefined ? {} : { detailId }),
        ...requestOptions
    });

    return createSuccessResponseFromRequest({ response, dataKey });
};

export const createCrudApplication = ({
    requests,
    dataKey = null,
    dataKeys = {},
    additionalMutations = []
}) => {
    const createMutation = (operation) => createApplicationMutation({
        request: requests[operation],
        dataKey: Object.prototype.hasOwnProperty.call(dataKeys, operation)
            ? dataKeys[operation]
            : dataKey
    });

    return Object.freeze({
        getAll: (params = {}) => requests.getAll({ params }),
        register: createMutation('register'),
        [FORM_MODES.EDIT]: createMutation(FORM_MODES.EDIT),
        ...Object.fromEntries(additionalMutations.map(operation => [
            operation,
            createMutation(operation)
        ]))
    });
};
