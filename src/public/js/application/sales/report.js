import { exportClientReportRequest } from "../../services/sales/reportService.js";

export const exportClientReport = async (params = {}) => {

    const response = await exportClientReportRequest(params);

    return response.data;
};
