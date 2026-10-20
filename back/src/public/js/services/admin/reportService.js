import { apiRequest } from "../axiosInstanceApi.js";

export const REPORTS_API_ROUTE = '/api/admin/reports';

export const exportMovementReportRequest = ({ context, params }) => apiRequest({
    method: 'get',
    url: `${ REPORTS_API_ROUTE }/movements/${ context }/excel`,
    responseType: 'blob',
    params
});

export const exportUserReportRequest = (params) => apiRequest({
    method: 'get',
    url: `${ REPORTS_API_ROUTE }/users/excel`,
    responseType: 'blob',
    params
});

export const exportPersonReportRequest = (params) => apiRequest({
    method: 'get',
    url: `${ REPORTS_API_ROUTE }/persons/excel`,
    responseType: 'blob',
    params
});
