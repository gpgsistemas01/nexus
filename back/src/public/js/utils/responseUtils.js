import { getSuccessMessage } from "../constants/apiMessages.js";

export const createSuccessResponse = ({ data, dataKey = null, message = null }) => {

    const response = {
        message: message ?? getSuccessMessage(data?.code)
    };

    if (dataKey) response.data = data?.[dataKey];

    return response;
};

export const createSuccessResponseFromRequest = ({ response, dataKey = null, message = null }) =>
    createSuccessResponse({
        data: response.data,
        dataKey,
        message
    });
