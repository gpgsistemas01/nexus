import { beforeEach, describe, expect, it, vi } from 'vitest';

const materialFindMany = vi.fn();
const supplierMaterialFindMany = vi.fn();
const supplierMaterialFindUnique = vi.fn();
const supplierMaterialCount = vi.fn();

vi.mock('../../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    material: { findMany: materialFindMany },
    supplierMaterial: {
      findMany: supplierMaterialFindMany,
      findUnique: supplierMaterialFindUnique,
      count: supplierMaterialCount
    }
  })
}));

const {
  ensureSupplierMaterials,
  findMaterialsWithUsage,
  findAllSupplierMaterials,
  findSupplierMaterialById,
  findSupplierMaterialByIds,
  findSupplierMaterialsSnapshot
} = await import('../../../../../src/services/warehouse/materials/supplierMaterialService.js');

describe('listado del CRUD de materiales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supplierMaterialFindMany.mockResolvedValue([{
      id: 'offer-1',
      currentStock: 4,
      convertedQuantity: 4,
      minStock: 1,
      material: { id: 'material-1', name: 'Lona' },
      supplier: { id: 'supplier-1', tradeName: 'Proveedor' }
    }]);
    supplierMaterialCount.mockResolvedValue(1);
    materialFindMany.mockResolvedValue([{ id: 'material-1' }]);
  });

  it.each([false, true])('omite la consulta de baja si no hay candidatos, con permiso %s', async canRemoveOffers => {
    const result = await findAllSupplierMaterials({ canRemoveOffers });

    expect(supplierMaterialFindMany).toHaveBeenCalledTimes(1);
    expect(result.data[0].canDelete).not.toBe(true);
  });

  it('comprueba la baja en bloque y sólo para el proveedor de cada oferta sin saldo', async () => {
    const row = { id: 'offer-1', currentStock: 0, minStock: 1, material: { id: 'material-1' }, supplier: { id: 'supplier-1' } };
    supplierMaterialFindMany.mockResolvedValueOnce([row]).mockResolvedValueOnce([{ id: row.id }]);

    const result = await findAllSupplierMaterials({ canRemoveOffers: true });

    expect(supplierMaterialFindMany).toHaveBeenNthCalledWith(2, {
      where: {
        currentStock: 0,
        OR: [{
          id: row.id,
          material: expect.objectContaining({
            goodsIssueDetails: { none: { supplierId: 'supplier-1' } },
            goodsReceiptDetails: { none: { goodsReceipt: { supplierId: 'supplier-1' } } }
          })
        }]
      },
      select: { id: true }
    });
    expect(result.data[0]).toEqual({ ...row, canDelete: true });
  });

  it('prioriza stock bajo por oferta y ordena el mínimo en la relación', async () => {
    const material = { id: 'material-1', name: 'Lona' };
    const withinMinimum = { id: 'offer-1', currentStock: 4, minStock: 3, material };
    const belowMinimum = { id: 'offer-2', currentStock: 8, minStock: 10, material };
    supplierMaterialFindMany.mockResolvedValueOnce([withinMinimum, belowMinimum]);

    const result = await findAllSupplierMaterials({ orderBy: 'minStock' });

    expect(result.data).toEqual([belowMinimum, withinMinimum]);
    expect(supplierMaterialFindMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { minStock: 'asc' } }));
  });

  it('filtra los consumibles mediante su clasificación explícita', async () => {
    await findAllSupplierMaterials({ type: 'CONSUMABLE' });

    expect(supplierMaterialFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        AND: [
          { material: { type: 'CONSUMABLE' } }
        ]
      }
    }));
    expect(supplierMaterialCount).toHaveBeenCalledWith({
      where: {
        material: { type: 'CONSUMABLE' }
      }
    });
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
      minStock: 1,
      material: {
        id: 'material-1',
        name: 'Lona',
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

  it('mantiene el contrato anidado en los datos históricos operativos', async () => {
    const supplierMaterial = {
      id: 'offer-1',
      material: { id: 'material-1', name: 'Lona' },
      supplier: { id: 'supplier-1', tradeName: 'Proveedor' }
    };
    supplierMaterialFindMany.mockResolvedValue([supplierMaterial]);

    await expect(findSupplierMaterialsSnapshot({
      pairs: [{ materialId: 'material-1', supplierId: 'supplier-1' }]
    })).resolves.toEqual([supplierMaterial]);
  });

  it('reutiliza las relaciones históricas en una sola consulta antes de eliminar', async () => {
    materialFindMany.mockResolvedValue([{ id: 'material-1' }]);

    await expect(findMaterialsWithUsage(['material-1'])).resolves.toEqual([{ id: 'material-1' }]);
    expect(materialFindMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['material-1'] },
        OR: expect.arrayContaining([
          { goodsIssueDetails: { some: {} } },
          { stockAdjustmentDetails: { some: {} } }
        ])
      },
      select: { id: true }
    });
    expect(materialFindMany.mock.calls[0][0].where.OR).not.toContainEqual(
      { purchaseRequisitionsDetails: { some: {} } }
    );
  });

});

it('crea vínculos en bloque y en orden estable aunque las compras envíen órdenes inversos o repetidos', async () => {
  const createMany = vi.fn().mockResolvedValue({ count: 2 });
  for (const materialIds of [['b', 'a', 'b'], ['a', 'b']]) {
    await ensureSupplierMaterials({ tx: { supplierMaterial: { createMany } }, supplierId: 'supplier', materialIds });
  }
  const payloads = createMany.mock.calls.map(([payload]) => payload);
  expect(payloads[0]).toEqual({ data: [{ supplierId: 'supplier', materialId: 'a' }, { supplierId: 'supplier', materialId: 'b' }], skipDuplicates: true });
  expect(payloads[1]).toEqual(payloads[0]);
});
