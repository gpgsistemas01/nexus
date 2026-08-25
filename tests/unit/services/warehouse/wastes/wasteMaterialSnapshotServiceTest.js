import { expect, it, vi } from 'vitest';

const supplierMaterialAggregate = vi.fn();
const materialFindMany = vi.fn();
const materialFindUnique = vi.fn();

vi.mock('../../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    material: { findMany: materialFindMany, findUnique: materialFindUnique },
    supplierMaterial: { aggregate: supplierMaterialAggregate }
  })
}));

const { resolveWasteMaterialSnapshot } = await import('../../../../../src/services/warehouse/wastes/wasteMaterialService.js');

it('obtiene el costo unitario máximo entre todos los proveedores del material', async () => {
  materialFindMany.mockResolvedValue([
    { id: 'material-1', base: 50, height: 1.52 },
    { id: 'material-2', base: 1.52, height: 100 },
    { id: 'material-wide', base: 3.2, height: 50 }
  ]);
  materialFindUnique.mockResolvedValue({
    id: 'material-1',
    name: 'Lona',
    base: 50,
    height: 1.52,
    presentation: { id: 'presentation-1', name: 'ROLLO' },
    unitMeasure: { id: 'unit-1', name: 'Metro cuadrado' }
  });
  supplierMaterialAggregate.mockResolvedValue({ _max: { maxUnitCost: 27.5 } });

  await expect(resolveWasteMaterialSnapshot({ materialId: 'material-1' }))
    .resolves.toEqual(expect.objectContaining({ id: 'material-1', maxUnitCost: 27.5 }));
  expect(materialFindMany).toHaveBeenCalledWith({
    where: { name: { equals: 'Lona', mode: 'insensitive' } },
    select: { id: true, base: true, height: true }
  });
  expect(supplierMaterialAggregate).toHaveBeenCalledWith({
    where: { materialId: { in: ['material-1', 'material-2'] } },
    _max: { maxUnitCost: true }
  });
});
