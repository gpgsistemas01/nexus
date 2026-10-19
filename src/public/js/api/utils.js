import { getErrorMessage } from "../constants/apiMessages.js";

export const normalizeHttpError = async (err) => {
    const requiresAuth = err.config?.requiresAuth !== false;

    if (!err.response) return {
        status: 0,
        requiresAuth,
        data: null,
        message: 'No fue posible conectar con el servidor.',
        raw: err
    };

    const { status } = err.response;
    let { data } = err.response;

    // Axios conserva responseType=blob también cuando una descarga responde JSON.
    if (data instanceof Blob && data.type.includes('json')) {
        try {
            data = JSON.parse(await data.text());
        } catch {
            return {
                status,
                requiresAuth,
                data: null,
                message: 'El servidor devolvió una respuesta no válida.',
                raw: err
            };
        }
    }

    return {
        status,
        requiresAuth,
        data,
        message: data?.message || getErrorMessage(data) || data?.detail || data?.error || err.message,
        raw: err
    };
};

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const isObject = (value) => typeof value === 'object' && value !== null;
const isErrorCodeObject = (error) => isObject(error) && hasOwn(error, 'code');
const isPathErrorObject = (error) => isObject(error) && hasOwn(error, 'path') && hasOwn(error, 'msg');

const mergeServerErrorList = (errors) => errors.reduce((result, error) => {

    if (isPathErrorObject(error)) {

        result[error.path] = mapServerErrors(error.msg);

        return result;
    }

    const mappedError = mapServerErrors(error);

    if (isObject(mappedError)) Object.assign(result, mappedError);

    return result;
}, {});

export const mapServerErrors = (errors) => {

    if (Array.isArray(errors)) return mergeServerErrorList(errors);

    if (typeof errors === 'string') return getErrorMessage({ code: errors });

    if (isObject(errors)) {

        if (isErrorCodeObject(errors)) return getErrorMessage(errors) ?? errors;

        const result = {};

        for (const key in errors) {
            result[key] = mapServerErrors(errors[key]);
        }

        return result;
    }

    return null;
};
