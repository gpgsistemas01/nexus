import { EventEmitter } from 'node:events';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { readExcelReport } from '../../helpers/readExcelReport.js';
import { DatabaseTableMissing } from '../../../src/errors/databaseError.js';
import { createFormulaCell, sendExcelReport } from '../../../src/utils/reportExcelUtils.js';

const paths = vi.hoisted(() => ({ root: null }));
vi.mock('node:os', () => ({ tmpdir: () => paths.root }));

const exportData = async data => {
  let operation;
  const app = createControllerTestApp({ registerRoutes: app => app.get('/report', (_req, res) => {
    operation = sendExcelReport({ res, data, sheetName: 'Reporte', filename: 'inventario' });
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
  });
  afterAll(async () => rm(paths.root, { recursive: true, force: true }));

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
