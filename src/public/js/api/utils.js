import { getErrorMessage } from "../constants/apiMessages.js";

export const normalizeHttpError = async (err) => {

    if (!err.response) return {
        status: 0,
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
                data: null,
                message: 'El servidor devolvió una respuesta no válida.',
                raw: err
            };
        }
    }

    return {
        status,
        data,
        message: data?.message || getErrorMessage(data) || data?.detail || data?.error || err.message,
        raw: err
    };
};
