import xlsx from 'xlsx';
import { findMovementReportRows } from "../../../services/inventory/reportService.js";
import { getDataTableOrder, getDataTableSearch } from "../../../utils/requestQueryUtils.js";
import { getMexicoMonthDateRange, getMexicoMonthYearParts } from "../../../utils/formattersUtils.js";

const SHEET_NAME = 'Movimientos';
const FILENAME = 'informe_movimientos';
const isMonthlyReportRequest = (query = {}) => query.monthlyReport === 'true' || query.monthlyReport === true;

const getReportFilename = () => {

    const { month, year } = getMexicoMonthYearParts();

    return `${FILENAME}_${year}-${month}`;
};

export const exportMovementReport = async (req, res) => {

    const columns = ['date', 'type', 'referenceNumber', null, null, null, null, null, null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns,
        defaultDirection: 'desc'
    });

    const monthlyReport = isMonthlyReportRequest(req.query);
    const monthDateRange = monthlyReport ? getMexicoMonthDateRange() : {};

    const rows = await findMovementReportRows({
        startDate: monthlyReport ? monthDateRange.startDate : req.query.startDate || '',
        endDate: monthlyReport ? monthDateRange.endDate : req.query.endDate || '',
        search: monthlyReport ? '' : getDataTableSearch(req.query),
        movementType: monthlyReport ? '' : req.query.movementType || '',
        productId: monthlyReport ? '' : req.query.productId || '',
        supplierId: monthlyReport ? '' : req.query.supplierId || '',
        goodsIssueId: monthlyReport ? '' : req.query.goodsIssueId || '',
        goodsReceiptId: monthlyReport ? '' : req.query.goodsReceiptId || '',
        stockAdjustmentId: monthlyReport ? '' : req.query.stockAdjustmentId || '',
        orderBy,
        orderDir
    });

    const data = [
        [
            'Fecha',
            'Fecha Creación',
            'Tipo',
            'Folio',
            'Material',
            'Base',
            'Altura',
            'Proveedor',
            'Stock Anterior',
            'Movimiento',
            'Stock Nuevo'
        ],

        ...rows.map(row => [
            row.date,
            row.createdAt,
            row.type === 'ENTRY' ? 'Entrada' : row.type === 'ISSUE' ? 'Salida' : row.type === 'ADJUSTMENT' ? 'Ajuste' : row.type,
            row.referenceNumber,
            row.productName,
            row.productBase,
            row.productHeight,
            row.supplierName,
            row.previousStock,
            row.quantity,
            row.newStock
        ])
    ];

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(data);

    xlsx.utils.book_append_sheet(workbook, worksheet, SHEET_NAME);

    const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${ getReportFilename() }.xlsx"`);
    return res.send(excelBuffer);
}