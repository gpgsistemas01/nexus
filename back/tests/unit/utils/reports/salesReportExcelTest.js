import { describe, expect, it } from 'vitest';
import { buildClientReportData } from '../../../../src/utils/reports/salesReportExcel.js';

describe('plantilla Excel de Ventas', () => {
  it('entrega la cabecera antes de consultar datos y consume filas progresivamente', async () => {
    let read = 0;
    async function* rows() { read++; yield { name: 'Cliente' }; }
    const data = buildClientReportData(rows());
    expect((await data.next()).value).toEqual(['Nombre']);
    expect(read).toBe(0);
    expect((await data.next()).value).toEqual(['Cliente']);
    expect(read).toBe(1);
  });

  it('genera un reporte vacío válido', async () => {
    expect(await Array.fromAsync(buildClientReportData([]))).toEqual([['Nombre']]);
  });
});
