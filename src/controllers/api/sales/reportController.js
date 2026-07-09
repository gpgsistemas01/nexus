import { findAllClients } from "../../../services/sales/clientService.js";
import { sendExcelReport } from "../../../utils/reportExcelUtils.js";
import { getDataTableOrder, getDataTableSearch } from "../../../utils/requestQueryUtils.js";

const CLIENT_SHEET_NAME = 'Clientes';
const CLIENT_FILENAME = 'reporte_clientes';

export const exportClientReport = async (req, res) => {

    const columns = ['name', null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const { data: rows } = await findAllClients({
        advisorId: req.query.advisorId || null,
        skip: 0,
        take: 0,
        search: getDataTableSearch(req.query),
        orderBy,
        orderDir
    });

    const data = [
        ['Nombre'],
        ...rows.map(row => [row.name])
    ];

    return sendExcelReport({
        res,
        data,
        sheetName: CLIENT_SHEET_NAME,
        filename: CLIENT_FILENAME
    });
};
