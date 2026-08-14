import { findMovementReportRows } from "../../../services/inventory/reportService.js";
import { findAllPersons } from "../../../services/admin/person/personService.js";
import { findAllUsers } from "../../../services/admin/userService.js";
import { getDataTableOrder, getDataTableSearch } from "../../../utils/requestQueryUtils.js";
import { getMexicoMonthDateRange } from "../../../utils/formattersUtils.js";
import { sendExcelReport } from "../../../utils/reportExcelUtils.js";

const SHEET_NAME = 'Movimientos';
const USER_SHEET_NAME = 'Usuarios';
const PERSON_SHEET_NAME = 'Personas';
const FILENAME = 'informe_movimientos';
const WASTE_MOVEMENT_SHEET_NAME = 'Movimientos de merma';
const WASTE_MOVEMENT_FILENAME = 'informe_movimientos_merma';
const USER_FILENAME = 'informe_usuarios';
const PERSON_FILENAME = 'informe_personas';
const isMonthlyReportRequest = (query = {}) => query.monthlyReport === 'true' || query.monthlyReport === true;

const MOVEMENT_REPORT_COLUMNS = [
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
];

const mapMovementReportRow = row => [
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
    row.newStock
];

const getMovementReportParams = (query) => {
    const columns = ['date', 'type', 'referenceNumber', null, null, null, null, null, null, null];
    const { orderBy, orderDir } = getDataTableOrder({ query, columns, defaultDirection: 'desc' });
    const monthlyReport = isMonthlyReportRequest(query);
    const monthDateRange = monthlyReport ? getMexicoMonthDateRange() : {};

    return {
        startDate: monthlyReport ? monthDateRange.startDate : query.startDate || '',
        endDate: monthlyReport ? monthDateRange.endDate : query.endDate || '',
        search: monthlyReport ? '' : getDataTableSearch(query),
        movementType: monthlyReport ? '' : query.movementType || '',
        materialId: monthlyReport ? '' : query.materialId || '',
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
        data: [MOVEMENT_REPORT_COLUMNS, ...rows.map(mapMovementReportRow)],
        sheetName,
        filename,
        filenameOptions: { separator: '-', order: 'year-month' }
    });
};

export const exportMovementReport = async (req, res) => {
    const monthlyReport = isMonthlyReportRequest(req.query);

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

export const exportUserReport = async (req, res) => {

    const columns = ['name', null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const { data: rows } = await findAllUsers({
        skip: 0,
        take: 0,
        search: getDataTableSearch(req.query),
        orderBy,
        orderDir
    });

    const data = [
        [
            'Usuario',
            'Persona',
            'Rol',
            'Área'
        ],
        ...rows.map(row => [
            row.name,
            row.person?.fullName || '-',
            row.roleName || '-',
            row.departmentName || '-'
        ])
    ];

    return sendExcelReport({
        res,
        data,
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

    const { data: rows } = await findAllPersons({
        departments,
        includeAccesses: true,
        skip: 0,
        take: 0,
        search: getDataTableSearch(req.query),
        orderBy,
        orderDir
    });

    const data = [
        [
            'Nombre',
            'Área',
            'Rol'
        ],
        ...rows.flatMap(row => row.accesses?.length
            ? row.accesses.map(access => [
                row.fullName,
                access.department.name,
                access.role.name
            ])
            : [[row.fullName, '-', '-']]
        )
    ];

    return sendExcelReport({
        res,
        data,
        sheetName: PERSON_SHEET_NAME,
        filename: PERSON_FILENAME,
        filenameOptions: { separator: '-', order: 'year-month' }
    });
};
