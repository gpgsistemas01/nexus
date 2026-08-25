import { beforeEach, describe, expect, it, vi } from 'vitest';

const wasteFindMany = vi.fn();

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({ waste: { findMany: wasteFindMany } })
}));

import { buildWasteReportSummary, findWasteReportRows } from '../../../../src/services/warehouse/reportService.js';

describe('consulta del reporte de mermas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consolida cantidades y metros cuadrados por material, proveedor y ancho', () => {
    const report = buildWasteReportSummary([
      { materialId: 'material-1', supplierId: 'supplier-1', name: 'Lona', supplier: 'Proveedor A', base: 1.5, height: 2, currentStock: 2, convertedQuantity: 6 },
      { materialId: 'material-1', supplierId: 'supplier-1', name: 'Lona', supplier: 'Proveedor A', base: 1.5, height: 5, currentStock: 3, convertedQuantity: 22.5 },
      { materialId: 'material-1', supplierId: 'supplier-1', name: 'Lona', supplier: 'Proveedor A', base: 2, height: 2, currentStock: 1, convertedQuantity: 4 },
      { materialId: 'material-1', supplierId: 'supplier-2', name: 'Lona', supplier: 'Proveedor B', base: 1.5, height: 2, currentStock: 1, convertedQuantity: 3 }
    ]);

    expect(report.rows).toEqual([
      { supplier: 'Proveedor A', name: 'Lona', width: 1.5, wasteQuantity: 2, currentStock: 5, squareMeters: 28.5 },
      { supplier: 'Proveedor A', name: 'Lona', width: 2, wasteQuantity: 1, currentStock: 1, squareMeters: 4 },
      { supplier: 'Proveedor B', name: 'Lona', width: 1.5, wasteQuantity: 1, currentStock: 1, squareMeters: 3 }
    ]);
    expect(report.totals).toEqual({ wasteQuantity: 4, currentStock: 7, squareMeters: 35.5 });
  });

  it('devuelve totales en cero cuando la consulta no contiene mermas', () => {
    expect(buildWasteReportSummary([])).toEqual({
      rows: [],
      totals: { wasteQuantity: 0, currentStock: 0, squareMeters: 0 }
    });
  });

  it('consulta la identidad directa de la merma sin depender de SupplierMaterial', async () => {
    wasteFindMany.mockResolvedValue([{
      id: 'waste-1',
      supplierId: 'supplier-1',
      name: 'Lona',
      base: 1.52,
      height: 4,
      currentStock: 2,
      convertedQuantity: 12.16,
      maxUnitCost: 20,
      supplier: { tradeName: 'Proveedor A' },
      presentation: { name: 'ROLLO' },
      unitMeasure: { name: 'Metro cuadrado' }
    }]);

    await expect(findWasteReportRows({
      search: 'lona',
      supplierId: 'supplier-1'
    })).resolves.toEqual([expect.objectContaining({
      id: 'waste-1',
      supplierId: 'supplier-1',
      name: 'Lona',
      supplier: 'Proveedor A'
    })]);
    expect(wasteFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        AND: [
          { OR: [{ isActive: true }, { currentStock: { not: 0 } }] },
          {
            OR: [
              { name: { contains: 'lona', mode: 'insensitive' } },
              { supplier: { tradeName: { contains: 'lona', mode: 'insensitive' } } }
            ]
          },
          { supplierId: 'supplier-1' }
        ]
      },
      orderBy: { name: 'asc' }
    }));
  });
});
