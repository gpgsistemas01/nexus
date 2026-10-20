import { beforeEach, describe, expect, it, vi } from 'vitest';

const findAllMaterials = vi.fn();

vi.mock('../../../../../src/services/warehouse/materials/materialService.js', () => ({
  createMaterial: vi.fn(),
  deleteMaterial: vi.fn(),
  findAllMaterials,
  updateMaterial: vi.fn(),
  updateMaterialStock: vi.fn()
}));

const { getAllMaterials } = await import('../../../../../src/controllers/api/warehouse/materialController.js');

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn()
  };
  res.status.mockReturnValue(res);
  return res;
};

describe('materialController', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ['asesor sin permiso de costos', [], false],
    ['personal autorizado', ['inventory:costs-read'], true]
  ])('solicita los costos al consultar materiales para %s', async (_, permissions, canReadCosts) => {
    const result = {
      data: [{ id: 'material-1', name: 'Lona', maxUnitCost: 25 }],
      recordsTotal: 1,
      recordsFiltered: 1
    };
    const req = { query: {}, user: { permissions } };
    const res = createResponse();
    findAllMaterials.mockResolvedValue(result);

    await getAllMaterials(req, res);

    expect(findAllMaterials).toHaveBeenCalledWith(expect.objectContaining({ canReadCosts }));
    expect(res.json).toHaveBeenCalledWith(result);
  });
});
