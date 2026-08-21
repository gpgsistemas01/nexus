import { exportMovementReportRequest, exportPersonReportRequest, exportUserReportRequest } from "../../services/admin/reportService.js";
import { createReportApplication } from "../createReportApplication.js";

export const exportMovementReport = createReportApplication(exportMovementReportRequest);
export const exportPersonReport = createReportApplication(exportPersonReportRequest);
export const exportUserReport = createReportApplication(exportUserReportRequest);
