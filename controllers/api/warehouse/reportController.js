import xlsx from 'xlsx';
import { findWarehouseReportRows } from "../../../services/warehouse/reportService.js";

const SHEET_NAME = 'Inventario';
const FILENAME = 'reporte_inventario_productos';

export const exportWarehouseReportExcel = async (req, res) => {

    const rows = await findWarehouseReportRows();

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(rows);

    xlsx.utils.book_append_sheet(workbook, worksheet, SHEET_NAME);

    const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${ FILENAME }.xlsx"`);
    return res.send(excelBuffer);
};
