import { buildMonthlyGoodsReceiptSummary, buildWasteReportSummary, findGoodsIssueReportRows, findGoodsReceiptReportRows, findSupplierReportRows, findWarehouseReportRows, findWasteIssueReportRows, findWasteReportRows } from "../../../services/warehouse/reportService.js";
import { getDataTableOrder, getDataTableSearch } from "../../../utils/requestQueryUtils.js";
import { getReportMonthDateRange } from "../../../utils/formattersUtils.js";
import { createFormulaCell, sendExcelReport } from "../../../utils/reportExcelUtils.js";

const SHEET_NAME = 'Inventario';
const FILENAME = 'reporte_inventario_materiales';
const GOODS_ISSUE_SHEET_NAME = 'Salidas';
const GOODS_ISSUE_FILENAME = 'reporte_salidas';
const WASTE_ISSUE_SHEET_NAME = 'Salidas de merma';
const WASTE_ISSUE_FILENAME = 'reporte_salidas_merma';
const GOODS_RECEIPT_SHEET_NAME = 'Compras';
const GOODS_RECEIPT_FILENAME = 'reporte_compras';
const SUPPLIER_SHEET_NAME = 'Proveedores';
const SUPPLIER_FILENAME = 'reporte_proveedores';
const WASTE_SHEET_NAME = 'Mermas';
const WASTE_FILENAME = 'reporte_mermas';
const isMonthlyReportRequest = (query = {}) => query.monthlyReport === 'true' || query.monthlyReport === true;
const createColumnTotalFormula = (column, firstRow, rowCount, value) => createFormulaCell(
    rowCount ? `SUM(${ column }${ firstRow }:${ column }${ firstRow + rowCount - 1 })` : '0',
    value
);
const ISSUE_REPORT_COLUMNS = ['referenceNumber', 'requestDate', 'departmentName', 'projectNumber', 'clientName', null, null];
const ISSUE_REPORT_HEADERS = [
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
];

const buildIssueReportQuery = (req) => {
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns: ISSUE_REPORT_COLUMNS,
        defaultDirection: 'desc'
    });
    const monthlyReport = isMonthlyReportRequest(req.query);
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

const buildIssueReportData = (rows, { baseHeader = 'Base', heightHeader = 'Altura' } = {}) => [
    ISSUE_REPORT_HEADERS.map(header => ({ Base: baseHeader, Altura: heightHeader })[header] || header),
    ...rows.map((row, index) => [
        row.referenceNumber,
        row.requestDate,
        row.departmentName,
        row.requesterName,
        row.clientName,
        row.projectNumber,
        row.fulfillmentStatusName,
        row.materialName,
        row.supplierName,
        row.materialBase,
        row.materialHeight,
        row.requestedQuantity,
        row.suppliedQuantity,
        row.presentationName,
        row.convertedQuantity,
        row.convertedUnitMeasureName,
        row.projectConvertedQuantity,
        createFormulaCell(`O${ index + 2 }-Q${ index + 2 }`, row.convertedQuantityDifference),
        row.detailFulfillmentStatusName
    ])
];

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

    return sendExcelReport({
        res,
        data,
        sheetName: SHEET_NAME,
        filename: FILENAME
    });
};

export const exportGoodsIssueReportExcel = async (req, res) => {
    const rows = await findGoodsIssueReportRows({
        ...buildIssueReportQuery(req),
        accesses: req.user?.accesses || [],
    });

    return sendExcelReport({
        res,
        data: buildIssueReportData(rows),
        sheetName: GOODS_ISSUE_SHEET_NAME,
        filename: GOODS_ISSUE_FILENAME
    });
};

export const exportWasteIssueReportExcel = async (req, res) => {
    const rows = await findWasteIssueReportRows(buildIssueReportQuery(req));

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

export const exportGoodsReceiptReportExcel = async (req, res) => {

    const columns = ['referenceNumber', 'receptionDate', 'supplierName', 'invoice', null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns,
        defaultDirection: 'desc'
    });

    const monthlyReport = isMonthlyReportRequest(req.query);
    const monthDateRange = monthlyReport ? getReportMonthDateRange(req.query.reportMonth) : {};

    const rows = await findGoodsReceiptReportRows({
        search: monthlyReport ? '' : getDataTableSearch(req.query),
        startDate: monthlyReport ? monthDateRange.startDate : req.query.startDate || '',
        endDate: monthlyReport ? monthDateRange.endDate : req.query.endDate || '',
        supplierId: monthlyReport ? '' : req.query.supplierId || '',
        personId: monthlyReport ? '' : req.query.personId || '',
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

        ...rows.map((row, index) => {
            const excelRow = index + 2;

            return [
                row.referenceNumber,
                row.receptionDate,
                row.receivedByName,
                row.supplierName,
                row.invoice,
                row.materialName,
                row.materialBase,
                row.materialHeight,
                row.quantity,
                row.presentationName,
                row.convertedQuantity,
                row.unitMeasureName,
                createFormulaCell(`IFERROR(O${ excelRow }/K${ excelRow },0)`, row.conversionUnitCost),
                row.costPerUnitType,
                createFormulaCell(`I${ excelRow }*N${ excelRow }`, row.netPurchaseAmount),
                createFormulaCell(`O${ excelRow }*1.16`, row.grossPurchaseAmount)
            ];
        })
    ];

    const { supplierRows, materialRows, supplierTotals, materialTotals } = buildMonthlyGoodsReceiptSummary(rows);
    const summaryScope = monthlyReport ? 'mensual' : 'del reporte';
    const supplierFirstRow = data.length + 4;
    const supplierTotalRow = supplierFirstRow + supplierRows.length;
    const materialFirstRow = supplierTotalRow + 4;

    data.push(
        [],
        [`Resumen ${ summaryScope } por proveedor`],
        ['Proveedor', 'Subtotal s/ IVA', 'IVA', 'Total c/ IVA', `% del subtotal ${ summaryScope }`],
        ...supplierRows.map((row, index) => {
            const excelRow = supplierFirstRow + index;

            return [
                row.supplierName,
                row.netPurchaseAmount,
                createFormulaCell(`B${ excelRow }*0.16`, row.vatAmount),
                createFormulaCell(`B${ excelRow }+C${ excelRow }`, row.grossPurchaseAmount),
                createFormulaCell(`IFERROR(B${ excelRow }/B${ supplierTotalRow }*100,0)`, row.monthlyPercentage)
            ];
        }),
        [
            'Total',
            supplierTotals.netPurchaseAmount,
            createColumnTotalFormula('C', supplierFirstRow, supplierRows.length, supplierTotals.vatAmount),
            createColumnTotalFormula('D', supplierFirstRow, supplierRows.length, supplierTotals.grossPurchaseAmount),
            createColumnTotalFormula('E', supplierFirstRow, supplierRows.length, supplierTotals.monthlyPercentage)
        ],
        [],
        [`Resumen ${ summaryScope } por material`],
        ['Material', 'Total m² comprados', 'Costo por m²', 'Costo total s/ IVA', 'Cantidad total de material'],
        ...materialRows.map((row, index) => {
            const excelRow = materialFirstRow + index;

            return [
                row.materialName,
                row.squareMeters,
                createFormulaCell(`IFERROR(D${ excelRow }/B${ excelRow },0)`, row.costPerSquareMeter),
                row.netPurchaseAmount,
                row.quantity
            ];
        }),
        [
            'Total',
            materialTotals.squareMeters,
            createColumnTotalFormula('C', materialFirstRow, materialRows.length, materialTotals.costPerSquareMeter),
            materialTotals.netPurchaseAmount,
            materialTotals.quantity
        ]
    );

    return sendExcelReport({
        res,
        data,
        sheetName: GOODS_RECEIPT_SHEET_NAME,
        filename: GOODS_RECEIPT_FILENAME
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
        orderBy,
        orderDir
    });
    const { rows: summaryRows, totals } = buildWasteReportSummary(rows);

    const data = [
        [
            'Proveedor',
            'Material',
            'Ancho',
            'Largo',
            'Total de mermas',
            'Total m²'
        ],

        ...summaryRows.map(row => [
            row.supplier,
            row.name,
            row.width,
            row.length,
            row.wasteQuantity,
            row.squareMeters
        ]),
        [
            'Total',
            '',
            '',
            '',
            createColumnTotalFormula('E', 2, summaryRows.length, totals.wasteQuantity),
            createColumnTotalFormula('F', 2, summaryRows.length, totals.squareMeters)
        ]
    ];

    return sendExcelReport({
        res,
        data,
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

    return sendExcelReport({
        res,
        data,
        sheetName: SUPPLIER_SHEET_NAME,
        filename: SUPPLIER_FILENAME
    });
};
