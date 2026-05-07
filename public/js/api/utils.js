import { getErrorMessage } from "../constants/apiMessages.js";

export const normalizeHttpError = (err) => {

    if (!err.response) throw err;

    const { status, data } = err.response;

    return {
        status,
        data,
        message: getErrorMessage(data),
        raw: err
    };
};