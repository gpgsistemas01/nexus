import { findMovementReportRows } from "../../../services/inventory/reportService.js";
import { findPersonReportRows, findUserReportRows } from "../../../services/admin/reportService.js";
import { getDataTableOrder, getDataTableSearch, isMonthlyReportQuery } from "../../../utils/requestQueryUtils.js";
import { getReportMonthDateRange } from '../../../utils/formattersUtils.js';
import { createFormulaCell, sendExcelReport } from "../../../utils/reportExcelUtils.js";

const SHEET_NAME = 'Movimientos';
const USER_SHEET_NAME = 'Usuarios';
const PERSON_SHEET_NAME = 'Personas';
const FILENAME = 'informe_movimientos';
const WASTE_MOVEMENT_SHEET_NAME = 'Movimientos de merma';
const WASTE_MOVEMENT_FILENAME = 'informe_movimientos_merma';
const CONSUMABLE_MOVEMENT_SHEET_NAME = 'Movimientos de consumibles';
const CONSUMABLE_MOVEMENT_FILENAME = 'informe_movimientos_consumibles';
const USER_FILENAME = 'informe_usuarios';
const PERSON_FILENAME = 'informe_personas';

const MOVEMENT_REPORT_COLUMNS = [
    'Fecha',
    'Fecha Creación',
    'Tipo',
    'Folio',
    'Material',
    'Base',
    'Altura',
    'Proveedor',
    'Stock anterior',
    'Movimiento',
    'Nuevo stock'
];

const mapMovementReportRow = (row, index) => [
    row.date,
    row.createdAt,
    row.type,
    row.referenceNumber,
    row.materialName,
    row.materialBase,
    row.materialHeight,
    row.supplierName,
    row.previousStock,
    row.quantity,
    createFormulaCell(`I${ index + 2 }+J${ index + 2 }`, row.newStock)
];

const getMovementReportParams = (query) => {
    const columns = ['date', 'type', 'referenceNumber', null, null, null, null, null, null, null];
    const { orderBy, orderDir } = getDataTableOrder({ query, columns, defaultDirection: 'desc' });
    const monthlyReport = isMonthlyReportQuery(query);
    const monthDateRange = monthlyReport ? getReportMonthDateRange(query.reportMonth) : {};

    return {
        startDate: monthlyReport ? monthDateRange.startDate : query.startDate || '',
        endDate: monthlyReport ? monthDateRange.endDate : query.endDate || '',
        search: monthlyReport ? '' : getDataTableSearch(query),
        movementType: monthlyReport ? '' : query.movementType || '',
        materialId: monthlyReport ? '' : query.materialId || '',
        wasteId: monthlyReport ? '' : query.wasteId || '',
        supplierId: monthlyReport ? '' : query.supplierId || '',
        orderBy,
        orderDir
    };
};

const sendMovementReport = async ({ req, res, context, sheetName, filename, additionalParams = {} }) => {
    const rows = await findMovementReportRows({
        context,
        ...getMovementReportParams(req.query),
        ...additionalParams
    });

    return sendExcelReport({
        res,
        data: (async function* () {
            yield MOVEMENT_REPORT_COLUMNS.map(column => column === 'Material' && context === 'consumables' ? 'Consumible' : column);
            let index = 0;
            for await (const row of rows) yield mapMovementReportRow(row, index++);
        })(),
        sheetName,
        filename,
        filenameOptions: { separator: '-', order: 'year-month' }
    });
};

export const exportMovementReport = async (req, res) => {
    const monthlyReport = isMonthlyReportQuery(req.query);

    return sendMovementReport({
        req,
        res,
        context: 'materials',
        sheetName: SHEET_NAME,
        filename: FILENAME,
        additionalParams: {
            goodsIssueId: monthlyReport ? '' : req.query.goodsIssueId || '',
            goodsReceiptId: monthlyReport ? '' : req.query.goodsReceiptId || '',
            stockAdjustmentId: monthlyReport ? '' : req.query.stockAdjustmentId || ''
        }
    });
};

export const exportWasteMovementReport = async (req, res) => sendMovementReport({
    req,
    res,
    context: 'wastes',
    sheetName: WASTE_MOVEMENT_SHEET_NAME,
    filename: WASTE_MOVEMENT_FILENAME
});

export const exportConsumableMovementReport = async (req, res) => sendMovementReport({
    req,
    res,
    context: 'consumables',
    sheetName: CONSUMABLE_MOVEMENT_SHEET_NAME,
    filename: CONSUMABLE_MOVEMENT_FILENAME
});

export const exportUserReport = async (req, res) => {

    const columns = ['name', null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const rows = findUserReportRows({
        search: getDataTableSearch(req.query),
        orderBy,
        orderDir
    });

    const data = async function* () {
        yield [
            'Usuario',
            'Persona',
            'Rol',
            'Área'
        ];
        for await (const row of rows) yield [
            row.name,
            row.person?.fullName || '-',
            row.roleName || '-',
            row.departmentName || '-'
        ];
    };

    return sendExcelReport({
        res,
        data: data(),
        sheetName: USER_SHEET_NAME,
        filename: USER_FILENAME,
        filenameOptions: { separator: '-', order: 'year-month' }
    });
};

export const exportPersonReport = async (req, res) => {

    const rawDepartment = req.query.department ?? req.query['department[]'];
    const departments = Array.isArray(rawDepartment)
        ? rawDepartment
        : rawDepartment
            ? [rawDepartment]
            : [];
    const columns = ['fullName', null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const rows = findPersonReportRows({
        departments,
        search: getDataTableSearch(req.query),
        orderBy,
        orderDir
    });

    const data = async function* () {
        yield [
            'Nombre',
            'Área',
            'Rol'
        ];
        for await (const row of rows) {
            if (!row.accesses?.length) {
                yield [row.fullName, '-', '-'];
                continue;
            }
            for (const access of row.accesses) {
                yield [row.fullName, access.department.name, access.role.name];
            }
        }
    };

    return sendExcelReport({
        res,
        data: data(),
        sheetName: PERSON_SHEET_NAME,
        filename: PERSON_FILENAME,
        filenameOptions: { separator: '-', order: 'year-month' }
    });
};
