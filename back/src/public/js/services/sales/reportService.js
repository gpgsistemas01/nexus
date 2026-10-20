import { apiRequest } from "../axiosInstanceApi.js";

export const REPORTS_API_ROUTE = '/api/sales/reports';

export const exportClientReportRequest = (params = {}) => apiRequest({
    method: 'get',
    url: `${ REPORTS_API_ROUTE }/clients/excel`,
    responseType: 'blob',
    params
});
