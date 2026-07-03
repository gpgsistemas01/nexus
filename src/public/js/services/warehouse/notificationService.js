import { apiRequest } from "../axiosInstanceApi.js";

export const NOTIFICATIONS_API_ROUTE = '/api/warehouse/notifications';

export const getLatestNotificationsRequest = async () =>
    apiRequest({
        method: 'get',
        url: NOTIFICATIONS_API_ROUTE
    });

export const markAllNotificationsAsReadRequest = async () =>
    apiRequest({
        method: 'patch',
        url: `${ NOTIFICATIONS_API_ROUTE }/read-all`
    });
