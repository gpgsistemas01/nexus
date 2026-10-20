import { beforeEach, describe, expect, it, vi } from 'vitest';

const wasteFindMany = vi.fn();

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({ waste: { findMany: wasteFindMany } })
}));

import { buildWasteReportSummary } from '../../../../src/services/warehouse/wastes/wasteReportSummary.js';
import { findWasteReportRows } from '../../../../src/services/warehouse/reportService.js';

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
      { supplier: 'Proveedor A', name: 'Lona', width: 1.5, length: null, wasteQuantity: 5, squareMeters: 28.5, totalWeightKg: null, weightStatus: 'unknown' },
      { supplier: 'Proveedor A', name: 'Lona', width: 2, length: null, wasteQuantity: 1, squareMeters: 4, totalWeightKg: null, weightStatus: 'unknown' },
      { supplier: 'Proveedor B', name: 'Lona', width: 1.5, length: null, wasteQuantity: 1, squareMeters: 3, totalWeightKg: null, weightStatus: 'unknown' }
    ]);
    expect(report.totals).toEqual({ wasteQuantity: 7, squareMeters: 35.5, totalWeightKg: null, weightStatus: 'unknown' });
  });

  it('separa por largo las presentaciones que no son rollo y conserva el grupo sin medidas', () => {
    const report = buildWasteReportSummary([
      { supplierId: 'supplier-1', name: 'Retazo', supplier: 'Proveedor A', presentation: 'PIEZA', base: 2, height: 3, currentStock: 2 },
      { supplierId: 'supplier-1', name: 'Retazo', supplier: 'Proveedor A', presentation: 'PIEZA', base: 2, height: 4, currentStock: 1 },
      { supplierId: 'supplier-1', name: 'Retazo sin medida', supplier: 'Proveedor A', presentation: 'PIEZA', base: null, height: null, currentStock: 4 }
    ]);

    expect(report.rows).toEqual([
      { supplier: 'Proveedor A', name: 'Retazo', width: 2, length: 3, wasteQuantity: 2, squareMeters: 12, totalWeightKg: null, weightStatus: 'notApplicable' },
      { supplier: 'Proveedor A', name: 'Retazo', width: 2, length: 4, wasteQuantity: 1, squareMeters: 8, totalWeightKg: null, weightStatus: 'notApplicable' },
      { supplier: 'Proveedor A', name: 'Retazo sin medida', width: null, length: null, wasteQuantity: 4, squareMeters: 0, totalWeightKg: null, weightStatus: 'notApplicable' }
    ]);
    expect(report.totals).toEqual({ wasteQuantity: 7, squareMeters: 20, totalWeightKg: null, weightStatus: 'notApplicable' });
  });

  it('devuelve totales en cero cuando la consulta no contiene mermas', () => {
    expect(buildWasteReportSummary([])).toEqual({
      rows: [],
      totals: { wasteQuantity: 0, squareMeters: 0, totalWeightKg: null, weightStatus: 'notApplicable' }
    });
  });

  it('suma kg por identidad antes de consolidar largos y excluye otras presentaciones', () => {
    const rows = [
      { name: 'Lona', presentation: 'ROLLO', base: 1.5, height: 2, currentStock: 3, weightKg: 0.12 },
      { name: 'Lona', presentation: 'ROLLO', base: 1.5, height: 4, currentStock: 2, weightKg: 0.5 },
      { name: 'Pieza', presentation: 'PIEZA', currentStock: 100, weightKg: 50 }
    ];
    const report = buildWasteReportSummary(rows);
    expect(report.rows[0]).toMatchObject({ totalWeightKg: 1.36, weightStatus: 'complete' });
    expect(report.rows[1]).toMatchObject({ totalWeightKg: null, weightStatus: 'notApplicable' });
    expect(report.totals).toMatchObject({ totalWeightKg: 1.36, weightStatus: 'complete' });
    const incomplete = buildWasteReportSummary([...rows, { ...rows[0], weightKg: null }]);
    expect(incomplete.rows[0]).toMatchObject({ totalWeightKg: null, weightStatus: 'unknown' });
    expect(incomplete.totals).toMatchObject({ totalWeightKg: null, weightStatus: 'unknown' });
    const emptyStock = buildWasteReportSummary([{ ...rows[0], currentStock: 0, weightKg: null }]);
    expect(emptyStock.totals).toMatchObject({ totalWeightKg: 0, weightStatus: 'complete' });
  });

  it('el límite de 100 kg corresponde a la unidad y no al peso total del grupo', () => {
    const report = buildWasteReportSummary([{ name: 'Lona', presentation: 'ROLLO', base: 1.5, height: 2, currentStock: 3, weightKg: 100 }]);
    expect(report.rows[0].totalWeightKg).toBe(300);
    expect(report.totals.totalWeightKg).toBe(300);
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
      weightKg: '1.23',
      supplier: { tradeName: 'Proveedor A' },
      presentation: { name: 'ROLLO' },
      unitMeasure: { name: 'Metro cuadrado' }
    }]);

    await expect(Array.fromAsync(findWasteReportRows({
      search: 'lona',
      supplierId: 'supplier-1'
    }))).resolves.toEqual([expect.objectContaining({
      id: 'waste-1',
      supplierId: 'supplier-1',
      name: 'Lona',
      supplier: 'Proveedor A',
      weightKg: 1.23
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
      orderBy: [{ name: 'asc' }, { id: 'asc' }]
    }));
  });

  it.each([
    ['active', { isActive: true }],
    ['inStock', { currentStock: { not: 0 } }],
    ['activeOrStock', { OR: [{ isActive: true }, { currentStock: { not: 0 } }] }]
  ])('aplica el alcance %s al inventario exportado', async (inventoryScope, expectedFilter) => {
    wasteFindMany.mockResolvedValue([]);

    await Array.fromAsync(findWasteReportRows({ inventoryScope }));

    expect(wasteFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { AND: [expectedFilter] }
    }));
  });
});
