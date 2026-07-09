import xlsx from 'xlsx';
import { findAllClients } from "../../../services/sales/clientService.js";
import { getMexicoMonthYearParts } from "../../../utils/formattersUtils.js";
import { getDataTableOrder, getDataTableSearch } from "../../../utils/requestQueryUtils.js";

const CLIENT_SHEET_NAME = 'Clientes';
const CLIENT_FILENAME = 'reporte_clientes';

const getReportFilename = (filename = CLIENT_FILENAME) => {

    const { month, year } = getMexicoMonthYearParts();

    return `${ filename }_${ month }_${ year }`;
};

const createWorkbookBuffer = ({ sheetName, data }) => {

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(data);

    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

    return xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
};

const sendExcelBuffer = ({ res, buffer, filename }) => {

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${ filename }.xlsx"`);
    return res.send(buffer);
};

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

    const excelBuffer = createWorkbookBuffer({ sheetName: CLIENT_SHEET_NAME, data });

    return sendExcelBuffer({
        res,
        buffer: excelBuffer,
        filename: getReportFilename(CLIENT_FILENAME)
    });
};
