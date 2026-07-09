import xlsx from 'xlsx';
import { findGoodsIssueReportRows, findGoodsReceiptReportRows, findWarehouseReportRows } from "../../../services/warehouse/reportService.js";
import { findAllSuppliers } from "../../../services/warehouse/supplierService.js";
import { getDataTableOrder, getDataTableSearch } from "../../../utils/requestQueryUtils.js";
import { getMexicoMonthDateRange, getMexicoMonthYearParts } from "../../../utils/formattersUtils.js";

const SHEET_NAME = 'Inventario';
const FILENAME = 'reporte_inventario_productos';
const GOODS_ISSUE_SHEET_NAME = 'Salidas';
const GOODS_ISSUE_FILENAME = 'reporte_salidas';
const GOODS_RECEIPT_SHEET_NAME = 'Compras';
const GOODS_RECEIPT_FILENAME = 'reporte_compras';
const SUPPLIER_SHEET_NAME = 'Proveedores';
const SUPPLIER_FILENAME = 'reporte_proveedores';
const isMonthlyReportRequest = (query = {}) => query.monthlyReport === 'true' || query.monthlyReport === true;

const getReportFilename = (filename = FILENAME) => {

    const { month, year } = getMexicoMonthYearParts();

    return `${ filename }_${ month }_${ year }`;
};

const sendExcelResponse = ({ res, data, sheetName, filename }) => {

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(data);

    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${ getReportFilename(filename) }.xlsx"`);
    return res.send(excelBuffer);
};

export const exportWarehouseReportExcel = async (req, res) => {

    const columns = ['name', 'base', 'height', null, 'minStock', null, null, null, null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const rows = await findWarehouseReportRows({
        search: getDataTableSearch(req.query),
        orderBy,
        orderDir
    });

    const data = [
        [
            'Proveedor',
            'Material',
            'Base',
            'Altura',
            'Existencia',
            'Stock mínimo',
            'Presentación',
            'Conversión',
            'Unidad',
            'Costo unitario'
        ],

        ...rows.map(row => [
            row.supplier,
            row.name,
            row.base,
            row.height,
            row.currentStock,
            row.minStock,
            row.presentation,
            row.convertedQuantity,
            row.unitMeasure,
            row.maxUnitCost
        ])
    ];

    return sendExcelResponse({
        res,
        data,
        sheetName: SHEET_NAME,
        filename: FILENAME
    });
};

export const exportGoodsIssueReportExcel = async (req, res) => {

    const columns = ['referenceNumber', 'requestDate', 'departmentName', 'projectNumber', 'clientName', null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns,
        defaultDirection: 'desc'
    });

    const monthlyReport = isMonthlyReportRequest(req.query);
    const monthDateRange = monthlyReport ? getMexicoMonthDateRange() : {};

    const rows = await findGoodsIssueReportRows({
        search: monthlyReport ? '' : getDataTableSearch(req.query),
        startDate: monthlyReport ? monthDateRange.startDate : req.query.startDate || '',
        endDate: monthlyReport ? monthDateRange.endDate : req.query.endDate || '',
        fulfillmentStatusId: monthlyReport ? '' : req.query.fulfillmentStatusId || '',
        clientId: monthlyReport ? '' : req.query.clientId || '',
        departmentId: monthlyReport ? '' : req.query.departmentId || '',
        profileId: monthlyReport ? '' : req.query.profileId || '',
        accesses: req.user?.accesses || [],
        orderBy,
        orderDir
    });

    const data = [
        [
            'Folio',
            'Fecha de solicitud',
            'Área',
            'Solicitante',
            'Cliente',
            'Proyecto',
            'Estado de surtido',
            'Material',
            'Proveedor',
            'Base',
            'Altura',
            'Cantidad solicitada',
            'Cantidad surtida',
            'Presentación',
            'Cantidad convertida',
            'Unidad de conversión',
            'Cantidad de proyecto',
            'Diferencia',
            'Estado del detalle'
        ],

        ...rows.map(row => [
            row.referenceNumber,
            row.requestDate,
            row.departmentName,
            row.requesterName,
            row.clientName,
            row.projectNumber,
            row.fulfillmentStatusName,
            row.productName,
            row.supplierName,
            row.productBase,
            row.productHeight,
            row.requestedQuantity,
            row.suppliedQuantity,
            row.presentationName,
            row.convertedQuantity,
            row.convertedUnitMeasureName,
            row.projectConvertedQuantity,
            row.convertedQuantityDifference,
            row.detailFulfillmentStatusName
        ])
    ];

    return sendExcelResponse({
        res,
        data,
        sheetName: GOODS_ISSUE_SHEET_NAME,
        filename: GOODS_ISSUE_FILENAME
    });
};

export const exportGoodsReceiptReportExcel = async (req, res) => {

    const columns = ['referenceNumber', 'receptionDate', 'supplierName', 'invoice', null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns,
        defaultDirection: 'desc'
    });

    const monthlyReport = isMonthlyReportRequest(req.query);
    const monthDateRange = monthlyReport ? getMexicoMonthDateRange() : {};

    const rows = await findGoodsReceiptReportRows({
        search: monthlyReport ? '' : getDataTableSearch(req.query),
        startDate: monthlyReport ? monthDateRange.startDate : req.query.startDate || '',
        endDate: monthlyReport ? monthDateRange.endDate : req.query.endDate || '',
        supplierId: monthlyReport ? '' : req.query.supplierId || '',
        profileId: monthlyReport ? '' : req.query.profileId || '',
        orderBy,
        orderDir
    });

    const data = [
        [
            'Folio',
            'Fecha de recepción',
            'Recibió',
            'Proveedor',
            'N° Factura',
            'Material',
            'Base',
            'Altura',
            'Cantidad de compra',
            'Presentación',
            'Cantidad convertida',
            'Unidad de conversión',
            'Costo unitario de conversión',
            'Costo por presentación',
            'Monto s/ IVA',
            'Monto c/ IVA'
        ],

        ...rows.map(row => [
            row.referenceNumber,
            row.receptionDate,
            row.receivedByName,
            row.supplierName,
            row.invoice,
            row.productName,
            row.productBase,
            row.productHeight,
            row.quantity,
            row.presentationName,
            row.convertedQuantity,
            row.unitMeasureName,
            row.conversionUnitCost,
            row.costPerUnitType,
            row.netPurchaseAmount,
            row.grossPurchaseAmount
        ])
    ];

    return sendExcelResponse({
        res,
        data,
        sheetName: GOODS_RECEIPT_SHEET_NAME,
        filename: GOODS_RECEIPT_FILENAME
    });
};


export const exportSupplierReportExcel = async (req, res) => {

    const columns = ['tradeName', 'legalName', null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const { data: rows } = await findAllSuppliers({
        skip: 0,
        take: 0,
        search: getDataTableSearch(req.query),
        orderBy,
        orderDir
    });

    const data = [
        [
            'Nombre comercial',
            'Razón social',
            'Estatus'
        ],
        ...rows.map(row => [
            row.tradeName,
            row.legalName,
            row.isActive ? 'Activo' : 'Inactivo'
        ])
    ];

    return sendExcelResponse({
        res,
        data,
        sheetName: SUPPLIER_SHEET_NAME,
        filename: SUPPLIER_FILENAME
    });
};
