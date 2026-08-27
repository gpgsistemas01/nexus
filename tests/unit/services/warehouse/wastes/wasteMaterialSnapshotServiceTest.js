import { expect, it, vi } from 'vitest';

const materialFindMany = vi.fn();
const materialFindUnique = vi.fn();

vi.mock('../../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    material: { findMany: materialFindMany, findUnique: materialFindUnique }
  })
}));

const { resolveWasteMaterialSnapshot } = await import('../../../../../src/services/warehouse/wastes/wasteMaterialService.js');

it('obtiene el costo unitario máximo entre todos los proveedores del material', async () => {
  materialFindMany.mockResolvedValue([
    { base: 50, height: 1.52, supplierMaterials: [{ maxUnitCost: 20 }] },
    { base: 1.52, height: 100, supplierMaterials: [{ maxUnitCost: 27.5 }] },
    { base: 3.2, height: 50, supplierMaterials: [{ maxUnitCost: 99 }] }
  ]);
  materialFindUnique.mockResolvedValue({
    id: 'material-1',
    name: 'Lona',
    base: 50,
    height: 1.52,
    presentation: { id: 'presentation-1', name: 'ROLLO' },
    unitMeasure: { id: 'unit-1', name: 'Metro cuadrado' }
  });
  await expect(resolveWasteMaterialSnapshot({ materialId: 'material-1' }))
    .resolves.toEqual(expect.objectContaining({ id: 'material-1', maxUnitCost: 27.5 }));
  expect(materialFindMany).toHaveBeenCalledWith({
    where: { name: { equals: 'Lona', mode: 'insensitive' } },
    select: {
      base: true,
      height: true,
      supplierMaterials: { select: { maxUnitCost: true } }
    }
  });
});
