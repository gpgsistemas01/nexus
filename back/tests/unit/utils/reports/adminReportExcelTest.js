import { describe, expect, it } from 'vitest';
import { buildMovementReportData, buildPersonReportData, buildUserReportData } from '../../../../src/utils/reports/adminReportExcel.js';

describe('plantillas Excel de Administración', () => {
  it.each(['materials', 'consumables', 'wastes'])('conserva cantidades y fórmulas en movimientos de %s', async context => {
    async function* rows() {
      yield { date: '05/11/2026', createdAt: '05/11/2026', type: 'Salida', referenceNumber: 'SMA-1', materialName: 'Lona',
        materialBase: 1, materialHeight: 2, supplierName: 'Proveedor', previousStock: 10, quantity: -10, newStock: 0 };
    }
    const data = await Array.fromAsync(buildMovementReportData(rows(), { context }));
    expect(data[0][4]).toBe(context === 'consumables' ? 'Consumible' : 'Material');
    expect(data[1].slice(8)).toEqual([10, -10, { formula: 'I2+J2', result: 0 }]);
  });

  it('genera una fila por acceso y conserva personas sin asignaciones', async () => {
    const rows = [{ fullName: 'Ana', accesses: [
      { department: { name: 'Almacén' }, role: { name: 'Auxiliar' } },
      { department: { name: 'Sistemas' }, role: { name: 'Coordinador' } }
    ] }, { fullName: 'Luis', accesses: [] }];
    expect(await Array.fromAsync(buildPersonReportData(rows))).toEqual([
      ['Nombre', 'Área', 'Rol'], ['Ana', 'Almacén', 'Auxiliar'], ['Ana', 'Sistemas', 'Coordinador'], ['Luis', '-', '-']
    ]);
  });

  it('mantiene el encabezado vacío y los campos opcionales de usuarios', async () => {
    expect(await Array.fromAsync(buildUserReportData([]))).toEqual([['Usuario', 'Persona', 'Rol', 'Área']]);
    expect(await Array.fromAsync(buildUserReportData([{ name: 'operador' }]))).toEqual([
      ['Usuario', 'Persona', 'Rol', 'Área'], ['operador', '-', '-', '-']
    ]);
  });
});
