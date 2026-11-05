import { apiClient } from './apiClient.js';

export const requestExcel = async (url: string, signal?: AbortSignal) => {
    const file = await apiClient.request<Blob>(url, { signal, responseType: 'blob' });

    if (
        !(file instanceof Blob) ||
        !file.type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    ) {
        throw new Error('El servidor no devolvió un archivo Excel válido.');
    }

    return file;
};
