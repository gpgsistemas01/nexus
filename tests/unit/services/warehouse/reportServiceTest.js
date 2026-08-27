import { beforeEach, describe, expect, it, vi } from 'vitest';

const wasteFindMany = vi.fn();

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({ waste: { findMany: wasteFindMany } })
}));

import { buildWasteReportSummary, findWasteReportRows } from '../../../../src/services/warehouse/reportService.js';

describe('consulta del reporte de mermas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consulta el total de stock y recalcula los metros cuadrados de rollos agrupados por nombre, proveedor y ancho', () => {
    const report = buildWasteReportSummary([
      { supplierId: 'supplier-1', name: 'Lona', supplier: 'Proveedor A', presentation: 'ROLLO', base: 1.5, height: 2, currentStock: 2, convertedQuantity: 999 },
      { supplierId: 'supplier-1', name: ' lona ', supplier: 'Proveedor A', presentation: 'Rollo', base: 1.5, height: 5, currentStock: 3, convertedQuantity: 999 },
      { supplierId: 'supplier-1', name: 'Lona', supplier: 'Proveedor A', presentation: 'ROLLO', base: 2, height: 2, currentStock: 1 },
      { supplierId: 'supplier-2', name: 'Lona', supplier: 'Proveedor B', presentation: 'ROLLO', base: 1.5, height: 2, currentStock: 1 }
    ]);

    expect(report.rows).toEqual([
      { supplier: 'Proveedor A', name: 'Lona', width: 1.5, length: null, wasteQuantity: 5, squareMeters: 28.5 },
      { supplier: 'Proveedor A', name: 'Lona', width: 2, length: null, wasteQuantity: 1, squareMeters: 4 },
      { supplier: 'Proveedor B', name: 'Lona', width: 1.5, length: null, wasteQuantity: 1, squareMeters: 3 }
    ]);
    expect(report.totals).toEqual({ wasteQuantity: 7, squareMeters: 35.5 });
  });

  it('separa por largo las presentaciones que no son rollo y conserva el grupo sin medidas', () => {
    const report = buildWasteReportSummary([
      { supplierId: 'supplier-1', name: 'Retazo', supplier: 'Proveedor A', presentation: 'PIEZA', base: 2, height: 3, currentStock: 2 },
      { supplierId: 'supplier-1', name: 'Retazo', supplier: 'Proveedor A', presentation: 'PIEZA', base: 2, height: 4, currentStock: 1 },
      { supplierId: 'supplier-1', name: 'Retazo sin medida', supplier: 'Proveedor A', presentation: 'PIEZA', base: null, height: null, currentStock: 4 }
    ]);

    expect(report.rows).toEqual([
      { supplier: 'Proveedor A', name: 'Retazo', width: 2, length: 3, wasteQuantity: 2, squareMeters: 12 },
      { supplier: 'Proveedor A', name: 'Retazo', width: 2, length: 4, wasteQuantity: 1, squareMeters: 8 },
      { supplier: 'Proveedor A', name: 'Retazo sin medida', width: null, length: null, wasteQuantity: 4, squareMeters: 0 }
    ]);
    expect(report.totals).toEqual({ wasteQuantity: 7, squareMeters: 20 });
  });

  it('devuelve totales en cero cuando la consulta no contiene mermas', () => {
    expect(buildWasteReportSummary([])).toEqual({
      rows: [],
      totals: { wasteQuantity: 0, squareMeters: 0 }
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
