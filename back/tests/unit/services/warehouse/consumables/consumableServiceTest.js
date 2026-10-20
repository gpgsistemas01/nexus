import { describe, expect, it, vi } from 'vitest';

const findAllSupplierMaterials = vi.fn();
const createMaterial = vi.fn();
const deleteMaterial = vi.fn();
const updateMaterial = vi.fn();
const updateMaterialStock = vi.fn();

vi.mock('../../../../../src/services/warehouse/materials/supplierMaterialService.js', () => ({
  findAllSupplierMaterials
}));

vi.mock('../../../../../src/services/warehouse/materials/materialService.js', () => ({
  createMaterial,
  deleteMaterial,
  updateMaterial,
  updateMaterialStock
}));

const {
  createConsumable,
  deleteConsumable,
  findAllConsumables,
  updateConsumable,
  updateConsumableStock
} = await import('../../../../../src/services/warehouse/consumables/consumableService.js');

describe('consumableService', () => {
  it('reutiliza el inventario de materiales con una clasificación fija de consumible', async () => {
    const result = { data: [], recordsTotal: 0, recordsFiltered: 0 };
    findAllSupplierMaterials.mockResolvedValue(result);

    await expect(findAllConsumables({ supplierId: 'supplier-1' })).resolves.toBe(result);
    expect(findAllSupplierMaterials).toHaveBeenCalledWith(expect.objectContaining({
      supplierId: 'supplier-1',
      type: 'CONSUMABLE'
    }));
  });

  it('crea el consumible como material tipado y sin dimensiones', async () => {
    await createConsumable({
      consumableDto: { name: 'Guantes', base: 2, height: 3 },
      userId: 'user-1'
    });

    expect(createMaterial).toHaveBeenCalledWith({
      materialDto: { name: 'Guantes', base: null, height: null },
      userId: 'user-1',
      type: 'CONSUMABLE'
    });
  });

  it('actualiza los datos generales dentro del contexto de consumibles', async () => {
    const consumableDto = { name: 'Guantes', supplierId: 'supplier-1' };

    await updateConsumable(consumableDto, 'material-1');

    expect(updateMaterial).toHaveBeenCalledWith(consumableDto, 'material-1', {
      type: 'CONSUMABLE'
    });
  });

  it('ajusta el stock dentro del contexto de consumibles', async () => {
    const consumableDto = { supplierId: 'supplier-1', newStock: 10 };

    await updateConsumableStock({
      consumableDto,
      userId: 'user-1',
      id: 'material-1'
    });

    expect(updateMaterialStock).toHaveBeenCalledWith({
      materialDto: consumableDto,
      userId: 'user-1',
      id: 'material-1',
      type: 'CONSUMABLE'
    });
  });

  it('retira únicamente una oferta clasificada como consumible', async () => {
    await deleteConsumable('supplier-material-1');

    expect(deleteMaterial).toHaveBeenCalledWith('supplier-material-1', {
      type: 'CONSUMABLE'
    });
  });
});
