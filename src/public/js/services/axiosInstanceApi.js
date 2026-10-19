import { normalizeHttpError } from "../api/utils.js";

const api = axios.create({
    baseURL: window.location.origin,
    timeout: 5000,
    withCredentials: true,
});
let refreshRequest = null;

api.interceptors.response.use(
    res => res,
    async err => {

        const original = err.config;

        if (err.response?.status === 401 && original && original.requiresAuth !== false && !original._retry) {

            original._retry = true;

            try {

                if (!refreshRequest) refreshRequest = axios
                    .post('/api/auth/refresh', {}, { withCredentials: true })
                    .finally(() => {
                        refreshRequest = null;
                    });

                await refreshRequest;

                return api(original);

            } catch (refreshErr) {

                return Promise.reject(await normalizeHttpError(refreshErr));
            }
        }

        return Promise.reject(await normalizeHttpError(err));
    }
);

export const apiRequest = async ({ method, url, params, data, responseType, requiresAuth = true }) =>
    await api({ method, url, params, data, responseType, requiresAuth });
