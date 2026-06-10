import xlsx from 'xlsx';
import { findMovementReportRows } from "../../../services/inventory/reportService.js";
import { getDataTableOrder, getDataTableSearch } from "../../../utils/requestQueryUtils.js";

const SHEET_NAME = 'Movimientos';
const FILENAME = 'informe_movimientos';

const getReportFilename = () => {

    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const year = now.getUTCFullYear();

    return `${FILENAME}_${year}-${month}`;
};

export const exportMovementReport = async (req, res) => {

    const columns = ['date', 'type', 'referenceNumber', null, null, null, null, null, null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns,
        defaultDirection: 'desc'
    });

    const rows = await findMovementReportRows({
        startDate: req.query.startDate || '',
        endDate: req.query.endDate || '',
        search: getDataTableSearch(req.query),
        movementType: req.query.movementType || '',
        productId: req.query.productId || '',
        supplierId: req.query.supplierId || '',
        goodsIssueId: req.query.goodsIssueId || '',
        goodsReceiptId: req.query.goodsReceiptId || '',
        stockAdjustmentId: req.query.stockAdjustmentId || '',
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