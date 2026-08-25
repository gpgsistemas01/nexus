import { beforeEach, describe, expect, it, vi } from 'vitest';

const materialFindMany = vi.fn();

vi.mock('../../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    material: { findMany: materialFindMany }
  })
}));

const { findWasteMaterialTemplates } = await import('../../../../../src/services/warehouse/wastes/wasteMaterialService.js');

describe('plantillas de material para el CRUD de mermas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve materiales únicos y sólo sugiere la menor medida como ancho para rollos', async () => {
    materialFindMany.mockResolvedValue([
      { id: 'material-1', name: 'Lona', base: 50, height: 1.52, presentation: { name: 'ROLLO' }, supplierMaterials: [{ maxUnitCost: 20 }] },
      { id: 'material-duplicate', name: 'Lona', base: 1.52, height: 100, presentation: { name: 'ROLLO' }, supplierMaterials: [{ maxUnitCost: 27.5 }] },
      { id: 'material-wide', name: 'Lona', base: 3.2, height: 100, presentation: { name: 'ROLLO' }, supplierMaterials: [{ maxUnitCost: 30 }] },
      { id: 'material-2', name: 'Vinil', base: 1.2, height: 100, presentation: { name: 'HOJA' }, supplierMaterials: [] }
    ]);

    const result = await findWasteMaterialTemplates({ search: 'lo', take: 20 });

    expect(materialFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { name: { contains: 'lo', mode: 'insensitive' } },
      take: 100
    }));
    expect(result.data).toEqual([
      expect.objectContaining({ id: 'material-1', suggestedWidth: 1.52, maxUnitCost: 27.5 }),
      expect.objectContaining({ id: 'material-wide', suggestedWidth: 3.2, maxUnitCost: 30 }),
      expect.objectContaining({ id: 'material-2', suggestedWidth: null, maxUnitCost: null })
    ]);
  });
});
