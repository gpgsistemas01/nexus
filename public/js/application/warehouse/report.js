import { exportGoodsIssueReportRequest, exportGoodsReceiptReportRequest, exportWarehouseReportRequest } from "../../services/warehouse/reportService.js";

export const exportWarehouseReport = async () => {

    const response = await exportWarehouseReportRequest();

    return response.data;
};


export const exportGoodsIssueReport = async (params = {}) => {

    const response = await exportGoodsIssueReportRequest(params);

    return response.data;
};

export const exportGoodsReceiptReport = async (params = {}) => {

    const response = await exportGoodsReceiptReportRequest(params);

    return response.data;
};
