import { beforeEach, describe, expect, it, vi } from 'vitest';

const materialFindMany = vi.fn();
const materialFindFirst = vi.fn();
const supplierMaterialFindMany = vi.fn();
const supplierMaterialFindUnique = vi.fn();
const supplierMaterialCount = vi.fn();
const supplierMaterialUpdateMany = vi.fn();

vi.mock('../../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    material: { findMany: materialFindMany, findFirst: materialFindFirst },
    supplierMaterial: {
      findMany: supplierMaterialFindMany,
      findUnique: supplierMaterialFindUnique,
      count: supplierMaterialCount,
      updateMany: supplierMaterialUpdateMany
    }
  })
}));

const {
  existsMaterialUsage,
  findAllSupplierMaterials,
  findSupplierMaterialById,
  findSupplierMaterialByIds,
  updateSupplierMaterialStock
} = await import('../../../../../src/services/warehouse/materials/supplierMaterialService.js');

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
        AND: expect.arrayContaining([
          { goodsReceiptDetails: { none: {} } },
          { correctedGoodsReceiptDetailChanges: { none: {} } }
        ])
      }),
      select: { id: true }
    });
    expect(materialFindMany.mock.calls[0][0].where).not.toHaveProperty('supplierMaterials');
    expect(materialFindMany.mock.calls[0][0].where).not.toHaveProperty('NOT');
    expect(materialFindMany.mock.calls[0][0].where.AND).not.toContainEqual(
      { purchaseRequisitionsDetails: { none: {} } }
    );
    expect(result.data[0]).toEqual(expect.objectContaining({
      id: 'offer-1',
      material: expect.objectContaining({ id: 'material-1', name: 'Lona' }),
      canDelete: true
    }));
  });

  it('conserva el mismo contrato anidado al consultar un material recién creado', async () => {
    const supplierMaterial = {
      id: 'offer-1',
      material: { id: 'material-1', name: 'Lona' },
      supplier: { id: 'supplier-1', tradeName: 'Proveedor' }
    };
    supplierMaterialFindUnique.mockResolvedValue(supplierMaterial);

    const result = await findSupplierMaterialByIds({
      materialId: 'material-1',
      supplierId: 'supplier-1'
    });

    expect(result).toEqual(supplierMaterial);
    expect(result.material).toEqual({ id: 'material-1', name: 'Lona' });
  });

  it('entrega el mismo material anidado desde el listado y después de crearlo', async () => {
    const supplierMaterial = {
      id: 'offer-1',
      currentStock: 0,
      convertedQuantity: 0,
      material: {
        id: 'material-1',
        name: 'Lona',
        minStock: 1,
        presentation: { id: 'presentation-1', name: 'ROLLO' },
        unitMeasure: { id: 'unit-1', symbol: 'm²' }
      },
      supplier: { id: 'supplier-1', tradeName: 'Proveedor' }
    };
    supplierMaterialFindMany.mockResolvedValue([supplierMaterial]);
    supplierMaterialFindUnique.mockResolvedValue(supplierMaterial);

    const [listedMaterials, createdMaterial] = await Promise.all([
      findAllSupplierMaterials({}),
      findSupplierMaterialByIds({
        materialId: 'material-1',
        supplierId: 'supplier-1'
      })
    ]);

    expect(listedMaterials.data[0]).toEqual(expect.objectContaining({
      id: createdMaterial.id,
      material: createdMaterial.material,
      supplier: createdMaterial.supplier
    }));
  });

  it('mantiene el contrato anidado para los consumidores operativos', async () => {
    supplierMaterialFindUnique.mockResolvedValue({
      id: 'offer-1',
      currentStock: 4,
      material: { id: 'material-1', name: 'Lona' },
      supplier: { id: 'supplier-1', tradeName: 'Proveedor' }
    });

    const result = await findSupplierMaterialByIds({
      materialId: 'material-1',
      supplierId: 'supplier-1'
    });

    expect(result).toEqual(expect.objectContaining({
      id: 'offer-1',
      material: expect.objectContaining({ id: 'material-1', name: 'Lona' }),
      currentStock: 4
    }));
  });

  it('mantiene el contrato anidado al consultar por el id de proveedor-material', async () => {
    const supplierMaterial = {
      id: 'offer-1',
      material: { id: 'material-1', name: 'Lona' },
      supplier: { id: 'supplier-1', tradeName: 'Proveedor' }
    };
    supplierMaterialFindUnique.mockResolvedValue(supplierMaterial);

    await expect(findSupplierMaterialById({ id: 'offer-1' })).resolves.toEqual(supplierMaterial);
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
    expect(materialFindFirst.mock.calls[0][0].where.OR).not.toContainEqual(
      { purchaseRequisitionsDetails: { some: {} } }
    );
  });

  it('sincroniza en cero el stock y la cantidad convertida al surtir la última pieza', async () => {
    supplierMaterialUpdateMany.mockResolvedValue({ count: 1 });

    await updateSupplierMaterialStock({
      grouped: new Map([['material-1:supplier-1', 1]]),
      movementType: 'ISSUE',
      supplierMaterials: [{
        materialId: 'material-1',
        supplierId: 'supplier-1',
        currentStock: 0,
        convertedQuantity: 0,
        material: { name: 'Lona', base: null, height: null },
        supplier: { tradeName: 'Proveedor' }
      }]
    });

    expect(supplierMaterialUpdateMany).toHaveBeenCalledWith({
      where: {
        supplierId: 'supplier-1',
        materialId: 'material-1',
        currentStock: { gte: 1 }
      },
      data: {
        currentStock: { decrement: 1 },
        convertedQuantity: 0
      }
    });
  });
});
