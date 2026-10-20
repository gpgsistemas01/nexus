import { createFormulaCell } from '../reportExcelUtils.js';
import { VAT_RATE, VAT_MULTIPLIER } from '../../shared/inventory/goodsReceiptCalculations.js';
import { createWasteReportSummary } from '../../services/warehouse/wastes/wasteReportSummary.js';
import { createMonthlyGoodsReceiptSummary } from '../../services/warehouse/goodsReceipts/goodsReceiptReportSummary.js';

const createColumnTotalFormula = (column, firstRow, rowCount, value) => createFormulaCell(
    rowCount ? `SUM(${ column }${ firstRow }:${ column }${ firstRow + rowCount - 1 })` : '0',
    value
);
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

export const buildIssueReportData = async function* (rows, { baseHeader = 'Base', heightHeader = 'Altura' } = {}) {
    let index = 0;
    yield ISSUE_REPORT_HEADERS.map(header => ({ Base: baseHeader, Altura: heightHeader })[header] || header);
    for await (const row of rows) {
        yield [
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
        ];
        index++;
    }
};

export const buildInventoryReportData = async function* (rows) {
    yield [
        'Proveedor',
        'Material',
        'Base',
        'Altura',
        'Stock actual',
        'Stock mínimo',
        'Presentación',
        'Conversión',
        'Unidad',
        'Costo unitario'
    ];

    for await (const row of rows) yield [
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
    ];
};

export const buildGoodsReceiptReportData = async function* (rows, { isConsumableReport, monthlyReport }) {
    const inventoryLabel = isConsumableReport ? 'Consumible' : 'Material';
    const summary = createMonthlyGoodsReceiptSummary();
    let index = 0;
    yield [
        'Folio',
        'Fecha de recepción',
        'Recibió',
        'Proveedor',
        'N° Factura',
        inventoryLabel,
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
    ];
    for await (const row of rows) {
        summary.add(row);
        const excelRow = index++ + 2;
        yield [
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
            createFormulaCell(`O${ excelRow }*${ VAT_MULTIPLIER }`, row.grossPurchaseAmount)
        ];
    }

    const { supplierRows, materialRows, supplierTotals, materialTotals } = summary.finish();
    const summaryScope = monthlyReport ? 'mensual' : 'del reporte';
    const supplierFirstRow = index + 5;
    const supplierTotalRow = supplierFirstRow + supplierRows.length;
    const materialFirstRow = supplierTotalRow + 4;

    yield* [
        [],
        [`Resumen ${ summaryScope } por proveedor`],
        ['Proveedor', 'Subtotal s/ IVA', 'IVA', 'Total c/ IVA', `% del subtotal ${ summaryScope }`],
        ...supplierRows.map((row, index) => {
            const excelRow = supplierFirstRow + index;

            return [
                row.supplierName,
                row.netPurchaseAmount,
                createFormulaCell(`B${ excelRow }*${ VAT_RATE }`, row.vatAmount),
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
        [`Resumen ${ summaryScope } por ${ isConsumableReport ? 'consumible' : 'material' }`],
        [inventoryLabel, 'Cantidad convertida', 'Costo unitario de conversión', 'Costo total s/ IVA', `Cantidad total de ${ isConsumableReport ? 'consumible' : 'material' }`],
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
    ];
};

export const buildWasteReportData = async (rows) => {
    const summary = createWasteReportSummary();
    for await (const row of rows) summary.add(row);
    const { rows: summaryRows, totals } = summary.finish();

    return [
        [
            'Proveedor',
            'Material',
            'Ancho',
            'Largo',
            'Total de mermas',
            'Total m²',
            'Peso neto total de rollos (kg)'
        ],

        ...summaryRows.map(row => [
            row.supplier,
            row.name,
            row.width,
            row.length,
            row.wasteQuantity,
            row.squareMeters,
            row.weightStatus === 'unknown' ? 'Sin peso capturado' : row.totalWeightKg
        ]),
        [
            'Total',
            '',
            '',
            '',
            createColumnTotalFormula('E', 2, summaryRows.length, totals.wasteQuantity),
            createColumnTotalFormula('F', 2, summaryRows.length, totals.squareMeters),
            totals.weightStatus === 'unknown' ? 'Sin peso capturado' : totals.weightStatus === 'complete'
                ? createColumnTotalFormula('G', 2, summaryRows.length, totals.totalWeightKg)
                : null
        ]
    ];
};
