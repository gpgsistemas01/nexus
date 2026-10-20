import { exportClientReportRequest } from "../../services/sales/reportService.js";
import { createReportApplication } from "../createReportApplication.js";

export const exportClientReport = createReportApplication(exportClientReportRequest);
