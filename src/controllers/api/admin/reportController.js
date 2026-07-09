import xlsx from 'xlsx';
import { findMovementReportRows } from "../../../services/inventory/reportService.js";
import { findAllProfiles } from "../../../services/admin/profileService.js";
import { findAllUsers } from "../../../services/admin/userService.js";
import { getDataTableOrder, getDataTableSearch } from "../../../utils/requestQueryUtils.js";
import { getMexicoMonthDateRange, getMexicoMonthYearParts } from "../../../utils/formattersUtils.js";

const SHEET_NAME = 'Movimientos';
const USER_SHEET_NAME = 'Usuarios';
const PROFILE_SHEET_NAME = 'Perfiles';
const FILENAME = 'informe_movimientos';
const USER_FILENAME = 'informe_usuarios';
const PROFILE_FILENAME = 'informe_perfiles';
const isMonthlyReportRequest = (query = {}) => query.monthlyReport === 'true' || query.monthlyReport === true;

const getReportFilename = (filename = FILENAME) => {

    const { month, year } = getMexicoMonthYearParts();

    return `${filename}_${year}-${month}`;
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
            'Perfil',
            'Rol',
            'Área'
        ],
        ...rows.map(row => [
            row.name,
            row.profile?.fullName || '-',
            row.roleName || '-',
            row.departmentName || '-'
        ])
    ];

    const excelBuffer = createWorkbookBuffer({ sheetName: USER_SHEET_NAME, data });

    return sendExcelBuffer({
        res,
        buffer: excelBuffer,
        filename: getReportFilename(USER_FILENAME)
    });
};

export const exportProfileReport = async (req, res) => {

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

    const { data: rows } = await findAllProfiles({
        departments,
        includeDepartments: true,
        skip: 0,
        take: 0,
        search: getDataTableSearch(req.query),
        orderBy,
        orderDir
    });

    const data = [
        [
            'Nombre',
            'Áreas'
        ],
        ...rows.map(row => [
            row.fullName,
            row.departments?.map(department => department.name).join(', ') || '-'
        ])
    ];

    const excelBuffer = createWorkbookBuffer({ sheetName: PROFILE_SHEET_NAME, data });

    return sendExcelBuffer({
        res,
        buffer: excelBuffer,
        filename: getReportFilename(PROFILE_FILENAME)
    });
};
