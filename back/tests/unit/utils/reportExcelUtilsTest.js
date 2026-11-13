import { EventEmitter } from 'node:events';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { ReportMonthInvalid } from '../../../src/errors/reportError.js';
import { errorMap } from '../../../src/messages/codeMessages.js';
import { getErrorMessage } from '../../../src/shared/messages/apiMessages.js';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { readExcelReport } from '../../helpers/readExcelReport.js';
import { DatabaseTableMissing } from '../../../src/errors/databaseError.js';
import { createFormulaCell, sendExcelReport, buildMonthlyReportSheets } from '../../../src/utils/reportExcelUtils.js';

const paths = vi.hoisted(() => ({ root: null }));
vi.mock('node:os', () => ({ tmpdir: () => paths.root }));

const exportData = async (data, sheets) => {
  let operation;
  const app = createControllerTestApp({ registerRoutes: app => app.get('/report', (_req, res) => {
    operation = sendExcelReport({ res, data, sheets, sheetName: 'Reporte', filename: 'inventario' });
    return operation;
  }) });
  const response = await request(app).get('/report').buffer(true).parse((res, callback) => {
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => callback(null, Buffer.concat(chunks)));
  });
  return { response, operation };
};

describe('generación progresiva de reportes Excel', () => {
  beforeAll(async () => {
    const os = await vi.importActual('node:os');
    paths.root = await mkdtemp(join(os.tmpdir(), 'nexus-report-tests-'));
    for (const name of ['TMPDIR', 'TEMP', 'TMP']) vi.stubEnv(name, paths.root);
  });
  afterAll(async () => {
    vi.unstubAllEnvs();
    await rm(paths.root, { recursive: true, force: true });
  });

  it('conserva fórmulas, resultados en cero, texto, decimales y encabezados HTTP', async () => {
    const data = [
      ['Inicial', 'Movimiento', 'Resultado'],
      [2, 3, createFormulaCell('A2+B2', 5)],
      ['México', null, 0, false, 1.234567],
      [0, 0, createFormulaCell('A4+B4', 0)]
    ];
    const { response, operation } = await exportData(data);
    await operation;
    const { sheet, rows } = await readExcelReport(response.body, 'Reporte');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(response.headers['content-disposition']).toMatch(
      /^attachment; filename=("?)inventario_\d{2}_\d{4}\.xlsx\1$/
    );
    expect(sheet.getCell('C2').value).toEqual({ formula: 'A2+B2', result: 5 });
    expect(sheet.getCell('C4').formula).toBe('A4+B4');
    expect(rows[3][2]).toBe(0);
    expect(rows[2]).toEqual(['México', null, 0, false, 1.234567]);
    expect(data[1][2]).toEqual({ formula: 'A2+B2', result: 5 });
    expect(sheet.views[0]).toMatchObject({ state: 'frozen', ySplit: 1 });
    expect(sheet.getCell('A1').font).toMatchObject({ bold: true });
    expect(sheet.getColumn(1).width).toBeGreaterThanOrEqual(14);
    expect(await readdir(paths.root)).toEqual([]);
  });

  it('consume filas asíncronas y conserva un reporte vacío con sus encabezados', async () => {
    async function* sourceRows() { yield ['Proveedor', 'Material']; }
    const { response, operation } = await exportData(sourceRows());
    await operation;
    const { rows } = await readExcelReport(response.body, 'Reporte');
    expect(rows).toEqual([['Proveedor', 'Material']]);
    expect(await readdir(paths.root)).toEqual([]);
  });

  it('aísla dos descargas simultáneas con el mismo nombre de archivo', async () => {
    const exports = await Promise.all(['Primero', 'Segundo'].map(name => exportData([['Material'], [name]])));
    await Promise.all(exports.map(item => item.operation));
    expect(await Promise.all(exports.map(async ({ response }) => (await readExcelReport(response.body, 'Reporte')).sheet.getCell('A2').value)))
      .toEqual(['Primero', 'Segundo']);
    expect(await readdir(paths.root)).toEqual([]);
  });

  it('devuelve el error JSON habitual si falla una consulta después de empezar a escribir filas', async () => {
    async function* rows() {
      yield ['Material'];
      yield ['Lona'];
      throw new DatabaseTableMissing();
    }
    const { response, operation } = await exportData(rows());
    await expect(operation).rejects.toBeInstanceOf(DatabaseTableMissing);

    expect(response.status).toBe(503);
    expect(response.headers['content-type']).toContain('application/json');
    expect(JSON.parse(response.body.toString())).toMatchObject({ code: 'DATABASE_TABLE_MISSING' });
    expect(await readdir(paths.root)).toEqual([]);
  });

  it('detiene el origen y limpia el temporal cuando el cliente cancela antes de la descarga', async () => {
    const res = new EventEmitter();
    res.download = vi.fn();
    const closed = Promise.withResolvers();
    let readRows = 0;
    async function* rows() {
      try {
        while (true) {
          if (++readRows === 10) res.emit('close');
          yield ['Material', readRows];
        }
      } finally { closed.resolve(); }
    }

    await expect(sendExcelReport({ res, data: rows(), sheetName: 'Reporte', filename: 'inventario' }))
      .rejects.toMatchObject({ name: 'AbortError' });
    await closed.promise;
    expect(readRows).toBe(10);
    expect(res.download).not.toHaveBeenCalled();
    expect(await readdir(paths.root)).toEqual([]);
  });
});


describe('hojas mensuales', () => {
  beforeAll(async () => { paths.root = await mkdtemp(join(process.env.TMPDIR || '/tmp', 'nexus-monthly-test-')); });
  afterAll(async () => { await rm(paths.root, { recursive: true, force: true }); });
  it('separa años y meses aunque las filas lleguen desordenadas, y reinicia fórmulas', async () => {
    const buildData = async function* (rows) {
      yield ['Folio', 'Valor', 'Total'];
      let index = 2;
      for await (const row of rows) { yield [row.id, row.value, createFormulaCell(`B${index}`, row.value)]; index++; }
    };
    const rows = [
      { reportMonth: '2026-02', id: 'febrero', value: 4 },
      { reportMonth: '2025-01', id: 'enero-anterior', value: 2 },
      { reportMonth: '2026-01', id: 'enero', value: 3 },
      { reportMonth: '2026-02', id: 'febrero-2', value: 5 }
    ];
    const { response, operation } = await exportData(undefined, signal => buildMonthlyReportSheets(rows, { buildData, sheetName: 'Reporte', signal }));
    await operation;
    const { workbook } = await readExcelReport(response.body);
    expect(workbook.worksheets.map(sheet => sheet.name)).toEqual(['2025-01', '2026-01', '2026-02']);
    expect(workbook.getWorksheet('2026-02').getCell('C2').formula).toBe('B2');
    expect(workbook.getWorksheet('2026-02').getCell('C3').formula).toBe('B3');
    expect(workbook.getWorksheet('2025-01').getCell('A2').value).toBe('enero-anterior');
    expect(await readdir(paths.root)).toEqual([]);
  });
});

describe('totales mensuales de compras', () => {
  beforeAll(async () => { paths.root = await mkdtemp(join(process.env.TMPDIR || '/tmp', 'nexus-monthly-purchase-')); });
  afterAll(async () => { await rm(paths.root, { recursive: true, force: true }); });
  it('mantiene totales y fórmulas de compras independientes por hoja', async () => {
    const { buildGoodsReceiptReportData } = await import('../../../src/utils/reports/warehouseReportExcel.js');
    const rows = [2, 3].map((quantity, index) => ({ reportMonth: `2026-0${index + 1}`, referenceNumber: `COMP-${index}`, supplierName: 'Proveedor', materialId: 'material', materialName: 'Artículo', quantity, convertedQuantity: quantity, conversionUnitCost: 10, costPerUnitType: 10, netPurchaseAmount: quantity * 10, grossPurchaseAmount: quantity * 11.6 }));
    const { response, operation } = await exportData(undefined, signal => buildMonthlyReportSheets(rows, { signal, sheetName: 'Compras', buildData: data => buildGoodsReceiptReportData(data, { monthlyReport: true }) }));
    await operation;
    for (const [index, month] of ['2026-01', '2026-02'].entries()) {
      const { sheet } = await readExcelReport(response.body, month);
      expect(sheet.getCell('I2').value).toBe(index + 2);
      expect(sheet.getCell('B6').value).toBe((index + 2) * 10);
      expect(sheet.getCell('O2').formula).toBe('I2*N2');
    }
    expect(await readdir(paths.root)).toEqual([]);
  });
  it('rechaza un mes inválido con error personalizado y retira los temporales', async () => {
    const rows = [{ reportMonth: '../../interno' }];
    const operation = Array.fromAsync(buildMonthlyReportSheets(rows, { sheetName: 'Reporte', buildData: rows => rows }));
    await expect(operation).rejects.toBeInstanceOf(ReportMonthInvalid);
    await expect(operation).rejects.toMatchObject({ code: errorMap.report.INVALID_MONTH, statusCode: 500, isOperational: true });
    await expect(operation).rejects.toThrow(getErrorMessage({ code: errorMap.report.INVALID_MONTH }));
    expect(await readdir(paths.root)).toEqual([]);
  });
  it('retira los temporales si falla la consulta antes de terminar la agrupación', async () => {
    const rows = async function* () { yield { reportMonth: '2026-01' }; throw new Error('Consulta fallida'); };
    await expect(Array.fromAsync(buildMonthlyReportSheets(rows(), { sheetName: 'Reporte', buildData: rows => rows }))).rejects.toThrow('Consulta fallida');
    expect(await readdir(paths.root)).toEqual([]);
  });
  it('reinicia las fórmulas de Salidas en cada mes y conserva todas las filas', async () => {
    const { buildIssueReportData } = await import('../../../src/utils/reports/warehouseReportExcel.js');
    const rows = ['2026-01', '2026-02', '2026-01'].map((reportMonth, index) => ({ reportMonth, referenceNumber: `SAL-${index}`, convertedQuantity: 10, projectConvertedQuantity: 8, convertedQuantityDifference: 2 }));
    const { response, operation } = await exportData(undefined, signal => buildMonthlyReportSheets(rows, { signal, sheetName: 'Salidas', buildData: buildIssueReportData }));
    await operation;
    const { workbook } = await readExcelReport(response.body);
    expect(workbook.getWorksheet('2026-01').rowCount).toBe(3);
    expect(workbook.getWorksheet('2026-02').rowCount).toBe(2);
    for (const sheet of workbook.worksheets) expect(sheet.getCell('R2').formula).toBe('O2-Q2');
    expect(workbook.getWorksheet('2026-01').getCell('R3').formula).toBe('O3-Q3');
    expect(await readdir(paths.root)).toEqual([]);
  });
  it('mantiene una hoja con encabezados para una consulta sin salidas', async () => {
    const { buildIssueReportData } = await import('../../../src/utils/reports/warehouseReportExcel.js');
    const { response, operation } = await exportData(undefined, signal => buildMonthlyReportSheets([], { signal, sheetName: 'Salidas', buildData: buildIssueReportData }));
    await operation;
    const { workbook, rows } = await readExcelReport(response.body, 'Salidas');
    expect(workbook.worksheets).toHaveLength(1);
    expect(rows).toHaveLength(1);
    expect(rows[0][0]).toBe('Folio');
    expect(await readdir(paths.root)).toEqual([]);
  });
  it('clasifica el límite de mes con la fecha local de México', async () => {
    const { getReportMonthKey } = await import('../../../src/utils/formattersUtils.js');
    expect(getReportMonthKey('2026-01-01T05:59:59Z')).toBe('2025-12');
    expect(getReportMonthKey('2026-01-01T06:00:00Z')).toBe('2026-01');
  });
});
