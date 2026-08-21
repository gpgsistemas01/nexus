import { exportGoodsIssueReportRequest, exportGoodsReceiptReportRequest, exportSupplierReportRequest, exportWarehouseReportRequest, exportWasteIssueReportRequest, exportWasteReportRequest } from "../../services/warehouse/reportService.js";
import { createReportApplication } from "../createReportApplication.js";

export const exportGoodsIssueReport = createReportApplication(exportGoodsIssueReportRequest);
export const exportGoodsReceiptReport = createReportApplication(exportGoodsReceiptReportRequest);
export const exportSupplierReport = createReportApplication(exportSupplierReportRequest);
export const exportWarehouseReport = createReportApplication(exportWarehouseReportRequest);
export const exportWasteIssueReport = createReportApplication(exportWasteIssueReportRequest);
export const exportWasteReport = createReportApplication(exportWasteReportRequest);
