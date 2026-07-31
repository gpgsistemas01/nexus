import { exportMovementReportRequest, exportPersonReportRequest, exportUserReportRequest } from "../../services/admin/reportService.js";

export const exportMovementReport = async (params = {}) => {

    const response = await exportMovementReportRequest(params);

    return response.data;
}

export const exportUserReport = async (params = {}) => {

    const response = await exportUserReportRequest(params);

    return response.data;
};

export const exportPersonReport = async (params = {}) => {

    const response = await exportPersonReportRequest(params);

    return response.data;
};
