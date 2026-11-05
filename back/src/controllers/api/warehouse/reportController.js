import {
    buildInventoryReportData,
    buildIssueReportData,
    buildGoodsReceiptReportData,
    buildWasteReportData
} from '../../../utils/reports/warehouseReportExcel.js';
import {
    findSupplierReportRows,
    findWarehouseReportRows,
    findWasteIssueReportRows,
    findWasteReportRows
} from '../../../services/warehouse/reportService.js';
import { getDataTableOrder, getDataTableSearch, isMonthlyReportQuery } from "../../../utils/requestQueryUtils.js";
import { getReportMonthDateRange } from '../../../utils/formattersUtils.js';
import { sendExcelReport } from "../../../utils/reportExcelUtils.js";
import { MATERIAL_TYPES } from '../../../shared/constants/inventory.js';

const SHEET_NAME = 'Inventario';
const FILENAME = 'reporte_inventario_materiales';
const GOODS_ISSUE_SHEET_NAME = 'Salidas';
const WASTE_ISSUE_SHEET_NAME = 'Salidas de merma';
const WASTE_ISSUE_FILENAME = 'reporte_salidas_merma';
const GOODS_RECEIPT_SHEET_NAME = 'Compras';
const GOODS_RECEIPT_FILENAME = 'reporte_compras';
const SUPPLIER_SHEET_NAME = 'Proveedores';
const SUPPLIER_FILENAME = 'reporte_proveedores';
const WASTE_SHEET_NAME = 'Mermas';
const WASTE_FILENAME = 'reporte_mermas';
const ISSUE_REPORT_COLUMNS = ['referenceNumber', 'requestDate', 'departmentName', 'projectNumber', 'clientName', null, null];
const buildIssueReportQuery = (req) => {
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns: ISSUE_REPORT_COLUMNS,
        defaultDirection: 'desc'
    });
    const monthlyReport = isMonthlyReportQuery(req.query);
    const monthDateRange = monthlyReport ? getReportMonthDateRange(req.query.reportMonth) : {};

    return {
        search: monthlyReport ? '' : getDataTableSearch(req.query),
        startDate: monthlyReport ? monthDateRange.startDate : req.query.startDate || '',
        endDate: monthlyReport ? monthDateRange.endDate : req.query.endDate || '',
        fulfillmentStatusId: monthlyReport ? '' : req.query.fulfillmentStatusId || '',
        observationsSearch: monthlyReport ? '' : req.query.observationsSearch || '',
        clientId: monthlyReport ? '' : req.query.clientId || '',
        departmentId: monthlyReport ? '' : req.query.departmentId || '',
        personId: monthlyReport ? '' : req.query.personId || '',
        orderBy,
        orderDir
    };
};

export const exportWarehouseReportExcel = async (req, res) => {

    const columns = ['name', 'base', 'height', null, 'minStock', null, null, null, null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const rows = findWarehouseReportRows({
        search: getDataTableSearch(req.query),
        inventoryScope: req.query.inventoryScope,
        type: Object.values(MATERIAL_TYPES).includes(req.query.type) ? req.query.type : null,
        orderBy,
        orderDir
    });

    return sendExcelReport({
        res,
        data: buildInventoryReportData(rows),
        sheetName: SHEET_NAME,
        filename: FILENAME
    });
};

export const buildGoodsIssueReportHandler = ({ findGoodsIssueReportRows, filename }) => async (req, res) => {
    const rows = await findGoodsIssueReportRows({
        ...buildIssueReportQuery(req),
        accesses: req.user?.accesses || [],
    });

    return sendExcelReport({
        res,
        data: buildIssueReportData(rows),
        sheetName: GOODS_ISSUE_SHEET_NAME,
        filename
    });
};

export const exportWasteIssueReportExcel = async (req, res) => {
    const rows = await findWasteIssueReportRows({ ...buildIssueReportQuery(req), accesses: req.user?.accesses || [] });

    return sendExcelReport({
        res,
        data: buildIssueReportData(rows, {
            baseHeader: 'Base de merma',
            heightHeader: 'Altura de merma'
        }),
        sheetName: WASTE_ISSUE_SHEET_NAME,
        filename: WASTE_ISSUE_FILENAME
    });
};

export const exportGoodsReceiptReportExcel = async ({ req, res, materialType, findGoodsReceiptReportRows }) => {

    const columns = ['referenceNumber', 'receptionDate', 'supplierName', 'invoice', null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns,
        defaultDirection: 'desc'
    });

    const monthlyReport = isMonthlyReportQuery(req.query);
    const monthDateRange = monthlyReport ? getReportMonthDateRange(req.query.reportMonth) : {};
    const isConsumableReport = materialType === MATERIAL_TYPES.CONSUMABLE;

    const rows = await findGoodsReceiptReportRows({
        search: monthlyReport ? '' : getDataTableSearch(req.query),
        startDate: monthlyReport ? monthDateRange.startDate : req.query.startDate || '',
        endDate: monthlyReport ? monthDateRange.endDate : req.query.endDate || '',
        supplierId: monthlyReport ? '' : req.query.supplierId || '',
        personId: monthlyReport ? '' : req.query.personId || '',
        orderBy,
        orderDir
    });

    return sendExcelReport({
        res,
        data: buildGoodsReceiptReportData(rows, { isConsumableReport, monthlyReport }),
        sheetName: `${ GOODS_RECEIPT_SHEET_NAME } ${ isConsumableReport ? 'consumibles' : 'materiales' }`,
        filename: `${ GOODS_RECEIPT_FILENAME }_${ isConsumableReport ? 'consumibles' : 'materiales' }`
    });
};

export const exportWasteReportExcel = async (req, res) => {

    const columns = ['name', 'base', 'height', null, null, null, null, null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const rows = await findWasteReportRows({
        search: getDataTableSearch(req.query),
        supplierId: req.query.supplierId || null,
        inventoryScope: req.query.inventoryScope,
        orderBy,
        orderDir
    });

    return sendExcelReport({
        res,
        data: await buildWasteReportData(rows),
        sheetName: WASTE_SHEET_NAME,
        filename: WASTE_FILENAME
    });
};

export const exportSupplierReportExcel = async (req, res) => {

    const columns = ['tradeName', 'legalName', null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const rows = await findSupplierReportRows({
        search: getDataTableSearch(req.query),
        orderBy,
        orderDir
    });

    const data = async function* () {
        yield ['Nombre comercial', 'Razón social', 'Estatus'];
        for await (const row of rows) yield [row.tradeName, row.legalName, row.isActive ? 'Activo' : 'Inactivo'];
    };

    return sendExcelReport({
        res,
        data: data(),
        sheetName: SUPPLIER_SHEET_NAME,
        filename: SUPPLIER_FILENAME
    });
};
