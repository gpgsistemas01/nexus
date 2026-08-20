import { beforeEach, describe, expect, it, vi } from 'vitest';

const requestMocks = vi.hoisted(() => ({
  deleteMaterialRequest: vi.fn(),
  editMaterialRequest: vi.fn(),
  editMaterialStockRequest: vi.fn(),
  getAllMaterialsRequest: vi.fn(),
  registerMaterialRequest: vi.fn()
}));

vi.mock('../../../../../../../src/public/js/services/warehouse/materialService.js', () => requestMocks);

const {
  deleteMaterial,
  editMaterial,
  editMaterialStock,
  getAllMaterials,
  registerMaterial
} = await import('../../../../../../../src/public/js/application/warehouse/materials/materials.js');

const formData = {
  name: 'Lámina',
  supplierId: 'supplier-1',
  presentationId: 'presentation-1',
  unitMeasureId: 'unit-1',
  minStock: 2,
  maxUnitCost: 15,
  base: 3,
  height: 4,
  isActive: true
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.values(requestMocks).forEach(mock => mock.mockResolvedValue({ data: { code: 'OK' } }));
});

describe('aplicación del CRUD de materiales', () => {
  it('reutiliza el listado y las ediciones del CRUD común', async () => {
    const listResponse = { data: { data: [{ id: 'material-1' }] } };
    requestMocks.getAllMaterialsRequest.mockResolvedValue(listResponse);

    await expect(getAllMaterials({ page: 3 })).resolves.toBe(listResponse);
    await editMaterial({ formData, id: 'material-1' });

    expect(requestMocks.getAllMaterialsRequest).toHaveBeenCalledWith({ params: { page: 3 } });
    expect(requestMocks.editMaterialRequest).toHaveBeenCalledWith({ data: formData, id: 'material-1' });
  });

  it('aplica la regla del contexto de entrada sin duplicar el mapeo', async () => {
    requestMocks.registerMaterialRequest.mockResolvedValue({
      data: { code: 'OK', material: { id: 'material-1' } }
    });

    await expect(registerMaterial({
      formData,
      creationContext: 'goodsReceipt'
    })).resolves.toEqual({
      message: expect.any(String),
      data: { id: 'material-1' }
    });
    expect(requestMocks.registerMaterialRequest).toHaveBeenCalledWith({
      data: {
        name: 'Lámina',
        supplierId: 'supplier-1',
        presentationId: 'presentation-1',
        unitMeasureId: 'unit-1',
        minStock: 2,
        base: 3,
        height: 4,
        isActive: true
      }
    });
  });

  it('delega el mapeo normal sin reconstruir los campos del formulario', async () => {
    const requestData = {
      ...formData,
      newStock: 5,
      observations: 'Inventario inicial'
    };

    await registerMaterial({ formData: requestData });

    expect(requestMocks.registerMaterialRequest).toHaveBeenCalledWith({
      data: requestData
    });
  });

  it('mantiene las mutaciones adicionales de stock y eliminación', async () => {
    await editMaterialStock({ formData: { newStock: 8 }, id: 'material-1' });
    await deleteMaterial({ id: 'supplier-material-1' });

    expect(requestMocks.editMaterialStockRequest).toHaveBeenCalledWith({
      data: { newStock: 8 },
      id: 'material-1'
    });
    expect(requestMocks.deleteMaterialRequest).toHaveBeenCalledWith({
      id: 'supplier-material-1'
    });
  });
});
