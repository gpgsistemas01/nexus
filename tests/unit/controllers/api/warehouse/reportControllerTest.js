import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  buildMonthlyGoodsReceiptSummary,
  findGoodsIssueReportRows,
  findGoodsReceiptReportRows,
  findWasteReportRows,
  buildWasteReportSummary,
  createFormulaCell,
  sendExcelReport,
  getReportMonthDateRange
} = vi.hoisted(() => ({
  buildMonthlyGoodsReceiptSummary: vi.fn(),
  findGoodsIssueReportRows: vi.fn(),
  findGoodsReceiptReportRows: vi.fn(),
  findWasteReportRows: vi.fn(),
  buildWasteReportSummary: vi.fn(),
  createFormulaCell: vi.fn((formula, value) => ({ f: formula, t: 'n', v: value })),
  sendExcelReport: vi.fn(),
  getReportMonthDateRange: vi.fn()
}));

vi.mock('../../../../../src/services/warehouse/reportService.js', () => ({
  buildMonthlyGoodsReceiptSummary,
  buildWasteReportSummary,
  findGoodsIssueReportRows,
  findGoodsReceiptReportRows,
  findSupplierReportRows: vi.fn(),
  findWarehouseReportRows: vi.fn(),
  findWasteIssueReportRows: vi.fn(),
  findWasteReportRows
}));

vi.mock('../../../../../src/utils/requestQueryUtils.js', () => ({
  getDataTableOrder: () => ({ orderBy: 'name', orderDir: 'asc' }),
  getDataTableSearch: () => ''
}));

vi.mock('../../../../../src/utils/formattersUtils.js', () => ({
  getReportMonthDateRange
}));

vi.mock('../../../../../src/utils/reportExcelUtils.js', () => ({ createFormulaCell, sendExcelReport }));

import {
  exportGoodsIssueReportExcel,
  exportGoodsReceiptReportExcel,
  exportWasteReportExcel
} from '../../../../../src/controllers/api/warehouse/reportController.js';

describe('exportación del reporte de mermas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exporta todos los grupos y el total general en una sola hoja', async () => {
    const res = {};
    const summaryRows = [
      { supplier: 'Proveedor A', name: 'Lona', width: 1.5, length: null, wasteQuantity: 5, squareMeters: 28.5 },
      { supplier: 'Proveedor A', name: 'Retazo', width: 2, length: 3, wasteQuantity: 2, squareMeters: 12 }
    ];

    findWasteReportRows.mockResolvedValue([{ id: 'waste-1' }, { id: 'waste-2' }]);
    buildWasteReportSummary.mockReturnValue({
      rows: summaryRows,
      totals: { wasteQuantity: 7, squareMeters: 40.5 }
    });

    await exportWasteReportExcel({ query: {} }, res);

    expect(buildWasteReportSummary).toHaveBeenCalledWith([{ id: 'waste-1' }, { id: 'waste-2' }]);
    expect(sendExcelReport).toHaveBeenCalledTimes(1);
    expect(sendExcelReport).toHaveBeenCalledWith({
      res,
      sheetName: 'Mermas',
      filename: 'reporte_mermas',
      data: [
        ['Proveedor', 'Material', 'Ancho', 'Largo', 'Total de mermas', 'Total m²'],
        ['Proveedor A', 'Lona', 1.5, null, 5, 28.5],
        ['Proveedor A', 'Retazo', 2, 3, 2, 12],
        [
          'Total',
          '',
          '',
          '',
          { f: 'SUM(E2:E3)', t: 'n', v: 7 },
          { f: 'SUM(F2:F3)', t: 'n', v: 40.5 }
        ]
      ]
    });
  });
});

describe('fórmulas de datos dependientes en reportes operativos', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exporta la diferencia de conversión de una salida como fórmula', async () => {
    findGoodsIssueReportRows.mockResolvedValue([{
      convertedQuantity: 12,
      projectConvertedQuantity: 10,
      convertedQuantityDifference: 2
    }]);

    await exportGoodsIssueReportExcel({ query: {}, user: { accesses: [] } }, {});

    const { data } = sendExcelReport.mock.calls[0][0];
    expect(data[1][17]).toEqual({ f: 'O2-Q2', t: 'n', v: 2 });
  });

  it('exporta importes de compra y sus resúmenes como fórmulas', async () => {
    findGoodsReceiptReportRows.mockResolvedValue([{
      quantity: 2,
      convertedQuantity: 4,
      conversionUnitCost: 25,
      costPerUnitType: 50,
      netPurchaseAmount: 100,
      grossPurchaseAmount: 116
    }]);
    buildMonthlyGoodsReceiptSummary.mockReturnValue({
      supplierRows: [{
        supplierName: 'Proveedor',
        netPurchaseAmount: 100,
        vatAmount: 16,
        grossPurchaseAmount: 116,
        monthlyPercentage: 100
      }],
      materialRows: [{
        materialName: 'Material',
        squareMeters: 4,
        costPerSquareMeter: 25,
        netPurchaseAmount: 100,
        quantity: 2
      }],
      supplierTotals: { netPurchaseAmount: 100, vatAmount: 16, grossPurchaseAmount: 116, monthlyPercentage: 100 },
      materialTotals: { squareMeters: 4, costPerSquareMeter: 25, netPurchaseAmount: 100, quantity: 2 }
    });

    await exportGoodsReceiptReportExcel({ query: {} }, {});

    const { data } = sendExcelReport.mock.calls[0][0];
    expect(data[1].slice(12)).toEqual([
      { f: 'IFERROR(O2/K2,0)', t: 'n', v: 25 },
      50,
      { f: 'I2*N2', t: 'n', v: 100 },
      { f: 'O2*1.16', t: 'n', v: 116 }
    ]);
    expect(data[5].slice(2)).toEqual([
      { f: 'B6*0.16', t: 'n', v: 16 },
      { f: 'B6+C6', t: 'n', v: 116 },
      { f: 'IFERROR(B6/B7*100,0)', t: 'n', v: 100 }
    ]);
    expect(data[10][2]).toEqual({ f: 'IFERROR(D11/B11,0)', t: 'n', v: 25 });
  });
});

describe('consulta mensual de reportes operativos', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consulta la salida del mes específico sin conservar los filtros del CRUD', async () => {
    getReportMonthDateRange.mockReturnValue({ startDate: '2025-02-01', endDate: '2025-02-28' });
    findGoodsIssueReportRows.mockResolvedValue([]);

    await exportGoodsIssueReportExcel({
      query: {
        monthlyReport: 'true',
        reportMonth: '2025-02',
        clientId: 'client-1',
        startDate: '2024-01-01'
      },
      user: { accesses: [] }
    }, {});

    expect(getReportMonthDateRange).toHaveBeenCalledWith('2025-02');
    expect(findGoodsIssueReportRows).toHaveBeenCalledWith(expect.objectContaining({
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      clientId: '',
      search: ''
    }));
  });
});
