import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findWasteReportRows, buildWasteReportSummary, sendExcelReport } = vi.hoisted(() => ({
  findWasteReportRows: vi.fn(),
  buildWasteReportSummary: vi.fn(),
  sendExcelReport: vi.fn()
}));

vi.mock('../../../../../src/services/warehouse/reportService.js', () => ({
  buildMonthlyGoodsReceiptSummary: vi.fn(),
  buildWasteReportSummary,
  findGoodsIssueReportRows: vi.fn(),
  findGoodsReceiptReportRows: vi.fn(),
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
  getMexicoMonthDateRange: vi.fn()
}));

vi.mock('../../../../../src/utils/reportExcelUtils.js', () => ({ sendExcelReport }));

import { exportWasteReportExcel } from '../../../../../src/controllers/api/warehouse/reportController.js';

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
        ['Total', '', '', '', 7, 40.5]
      ]
    });
  });
});
