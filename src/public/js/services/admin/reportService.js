import { apiRequest } from "../axiosInstanceApi.js";

export const REPORTS_API_ROUTE = '/api/admin/reports';

export const exportMovementReportRequest = (params) => apiRequest({
    method: 'get',
    url: `${ REPORTS_API_ROUTE }/movements/excel`,
    responseType: 'blob',
    params
});

export const exportUserReportRequest = (params) => apiRequest({
    method: 'get',
    url: `${ REPORTS_API_ROUTE }/users/excel`,
    responseType: 'blob',
    params
});

export const exportProfileReportRequest = (params) => apiRequest({
    method: 'get',
    url: `${ REPORTS_API_ROUTE }/profiles/excel`,
    responseType: 'blob',
    params
});
