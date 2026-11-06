import { findClientReportRows } from "../../../services/sales/reportService.js";
import { sendExcelReport } from "../../../utils/reportExcelUtils.js";
import { buildClientReportData } from '../../../utils/reports/salesReportExcel.js';
import { getDataTableOrder, getDataTableSearch } from "../../../utils/requestQueryUtils.js";

const CLIENT_SHEET_NAME = 'Clientes';
const CLIENT_FILENAME = 'reporte_clientes';

export const exportClientReport = async (req, res) => {

    const columns = ['name', null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const rows = findClientReportRows({
        advisorId: req.query.advisorId || null,
        search: getDataTableSearch(req.query),
        orderBy,
        orderDir
    });

    return sendExcelReport({
        res,
        data: buildClientReportData(rows),
        sheetName: CLIENT_SHEET_NAME,
        filename: CLIENT_FILENAME
    });
};
