import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  buildMonthlyGoodsReceiptSummary,
  findConsumableGoodsReceiptReportRows,
  findGoodsIssueReportRows,
  findMaterialGoodsReceiptReportRows,
  findWasteReportRows,
  buildWasteReportSummary,
  createFormulaCell,
  sendExcelReport,
  getReportMonthDateRange
} = vi.hoisted(() => ({
  buildMonthlyGoodsReceiptSummary: vi.fn(),
  findConsumableGoodsReceiptReportRows: vi.fn(),
  findGoodsIssueReportRows: vi.fn(),
  findMaterialGoodsReceiptReportRows: vi.fn(),
  findWasteReportRows: vi.fn(),
  buildWasteReportSummary: vi.fn(),
  createFormulaCell: vi.fn((formula, value) => ({ formula: formula, result: value })),
  sendExcelReport: vi.fn(async options => {
    if (options.data?.[Symbol.asyncIterator]) options.data = await Array.fromAsync(options.data);
  }),
  getReportMonthDateRange: vi.fn()
}));

vi.mock('../../../../../src/services/warehouse/reportService.js', () => ({
  createMonthlyGoodsReceiptSummary: () => { const rows = []; return { add: row => rows.push(row), finish: () => buildMonthlyGoodsReceiptSummary(rows) }; },
  createWasteReportSummary: () => { const rows = []; return { add: row => rows.push(row), finish: () => buildWasteReportSummary(rows) }; },
  findGoodsIssueReportRows,
  findSupplierReportRows: vi.fn(),
  findWarehouseReportRows: vi.fn(),
  findWasteIssueReportRows: vi.fn(),
  findWasteReportRows
}));

vi.mock('../../../../../src/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js', () => ({
  findMaterialGoodsReceiptReportRows
}));

vi.mock('../../../../../src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js', () => ({
  findConsumableGoodsReceiptReportRows
}));

vi.mock('../../../../../src/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js', () => ({
  findMaterialGoodsIssueReportRows: findGoodsIssueReportRows
}));

vi.mock('../../../../../src/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js', () => ({
  findConsumableGoodsIssueReportRows: vi.fn()
}));

vi.mock('../../../../../src/utils/requestQueryUtils.js', () => ({
  getDataTableOrder: () => ({ orderBy: 'name', orderDir: 'asc' }),
  getDataTableSearch: () => '',
  isMonthlyReportQuery: query => query?.monthlyReport === true || query?.monthlyReport === 'true'
}));

vi.mock('../../../../../src/utils/formattersUtils.js', () => ({
  getReportMonthDateRange
}));

vi.mock('../../../../../src/utils/reportExcelUtils.js', () => ({ createFormulaCell, sendExcelReport }));

import {
  exportWasteReportExcel
} from '../../../../../src/controllers/api/warehouse/reportController.js';

import { exportMaterialGoodsIssueReportExcel } from '../../../../../src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueReportController.js';

describe('exportación del reporte de mermas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exporta todos los grupos y el total general en una sola hoja', async () => {
    const res = {};
    const summaryRows = [
      { supplier: 'Proveedor A', name: 'Lona', width: 1.5, length: null, wasteQuantity: 5, squareMeters: 28.5, totalWeightKg: 2.5, weightStatus: 'complete' },
      { supplier: 'Proveedor A', name: 'Retazo', width: 2, length: 3, wasteQuantity: 2, squareMeters: 12, totalWeightKg: null, weightStatus: 'notApplicable' }
    ];

    findWasteReportRows.mockResolvedValue([{ id: 'waste-1' }, { id: 'waste-2' }]);
    buildWasteReportSummary.mockReturnValue({
      rows: summaryRows,
      totals: { wasteQuantity: 7, squareMeters: 40.5, totalWeightKg: 2.5, weightStatus: 'complete' }
    });

    await exportWasteReportExcel({ query: { inventoryScope: 'active' } }, res);

    expect(findWasteReportRows).toHaveBeenCalledWith(expect.objectContaining({ inventoryScope: 'active' }));
    expect(buildWasteReportSummary).toHaveBeenCalledWith([{ id: 'waste-1' }, { id: 'waste-2' }]);
    expect(sendExcelReport).toHaveBeenCalledTimes(1);
    expect(sendExcelReport).toHaveBeenCalledWith({
      res,
      sheetName: 'Mermas',
      filename: 'reporte_mermas',
      data: [
        ['Proveedor', 'Material', 'Ancho', 'Largo', 'Total de mermas', 'Total m²', 'Peso neto total de rollos (kg)'],
        ['Proveedor A', 'Lona', 1.5, null, 5, 28.5, 2.5],
        ['Proveedor A', 'Retazo', 2, 3, 2, 12, null],
        [
          'Total',
          '',
          '',
          '',
          { formula: 'SUM(E2:E3)', result: 7 },
          { formula: 'SUM(F2:F3)', result: 40.5 },
          { formula: 'SUM(G2:G3)', result: 2.5 }
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

    await exportMaterialGoodsIssueReportExcel({ query: {}, user: { accesses: [] } }, {});

    const { data } = sendExcelReport.mock.calls[0][0];
    expect(data[1][17]).toEqual({ formula: 'O2-Q2', result: 2 });
  });

  it('exporta importes de compra y sus resúmenes como fórmulas', async () => {
    findMaterialGoodsReceiptReportRows.mockResolvedValue([{
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

    await exportMaterialGoodsReceiptReportExcel({ query: {} }, {});

    const { data } = sendExcelReport.mock.calls[0][0];
    expect(data[1].slice(12)).toEqual([
      { formula: 'IFERROR(O2/K2,0)', result: 25 },
      50,
      { formula: 'I2*N2', result: 100 },
      { formula: 'O2*1.16', result: 116 }
    ]);
    expect(data[5].slice(2)).toEqual([
      { formula: 'B6*0.16', result: 16 },
      { formula: 'B6+C6', result: 116 },
      { formula: 'IFERROR(B6/B7*100,0)', result: 100 }
    ]);
    expect(data[10][2]).toEqual({ formula: 'IFERROR(D11/B11,0)', result: 25 });
  });

  it('delimita y rotula el reporte de compras de consumibles', async () => {
    findConsumableGoodsReceiptReportRows.mockResolvedValue([]);
    buildMonthlyGoodsReceiptSummary.mockReturnValue({
      supplierRows: [],
      materialRows: [],
      supplierTotals: {},
      materialTotals: {}
    });

    await exportConsumableGoodsReceiptReportExcel({ query: {} }, {});

    expect(findConsumableGoodsReceiptReportRows).toHaveBeenCalledWith(expect.objectContaining({}));
    expect(sendExcelReport).toHaveBeenCalledWith(expect.objectContaining({
      sheetName: 'Compras consumibles',
      filename: 'reporte_compras_consumibles',
      data: expect.arrayContaining([
        expect.arrayContaining(['Consumible']),
        ['Resumen del reporte por consumible']
      ])
    }));
  });
});

describe('consulta mensual de reportes operativos', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consulta la salida del mes específico sin conservar los filtros del CRUD', async () => {
    getReportMonthDateRange.mockReturnValue({ startDate: '2025-02-01', endDate: '2025-02-28' });
    findGoodsIssueReportRows.mockResolvedValue([]);

    await exportMaterialGoodsIssueReportExcel({
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

import { exportMaterialGoodsReceiptReportExcel } from '../../../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptReportController.js';
import { exportConsumableGoodsReceiptReportExcel } from '../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptReportController.js';
