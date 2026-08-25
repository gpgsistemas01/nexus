import { beforeEach, describe, expect, it, vi } from 'vitest';

const materialFindMany = vi.fn();
const materialFindFirst = vi.fn();
const supplierMaterialFindMany = vi.fn();
const supplierMaterialCount = vi.fn();

vi.mock('../../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    material: { findMany: materialFindMany, findFirst: materialFindFirst },
    supplierMaterial: {
      findMany: supplierMaterialFindMany,
      count: supplierMaterialCount
    }
  })
}));

const { existsMaterialUsage, findAllSupplierMaterials } = await import('../../../../../src/services/warehouse/materials/supplierMaterialService.js');

describe('listado del CRUD de materiales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supplierMaterialFindMany.mockResolvedValue([{
      id: 'offer-1',
      currentStock: 4,
      convertedQuantity: 4,
      material: { id: 'material-1', name: 'Lona', minStock: 1 },
      supplier: { id: 'supplier-1', tradeName: 'Proveedor' }
    }]);
    supplierMaterialCount.mockResolvedValue(1);
    materialFindMany.mockResolvedValue([{ id: 'material-1' }]);
  });

  it('calcula si se puede eliminar sin consultar la relación retirada entre oferta y merma', async () => {
    const result = await findAllSupplierMaterials({});

    expect(materialFindMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: { in: ['material-1'] },
        NOT: {
          OR: expect.arrayContaining([
            { goodsReceiptDetails: { some: {} } },
            { correctedGoodsReceiptDetailChanges: { some: {} } }
          ])
        }
      }),
      select: { id: true }
    });
    expect(materialFindMany.mock.calls[0][0].where).not.toHaveProperty('supplierMaterials');
    expect(result.data[0].canDelete).toBe(true);
  });

  it('reutiliza las relaciones históricas en una sola consulta antes de eliminar', async () => {
    materialFindFirst.mockResolvedValue({ id: 'material-1' });

    await expect(existsMaterialUsage({ materialId: 'material-1' })).resolves.toBe(true);
    expect(materialFindFirst).toHaveBeenCalledWith({
      where: {
        id: 'material-1',
        OR: expect.arrayContaining([
          { goodsIssueDetails: { some: {} } },
          { stockAdjustmentDetails: { some: {} } }
        ])
      },
      select: { id: true }
    });
  });
});
