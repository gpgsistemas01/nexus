import { describe, expect, it, vi } from 'vitest';

const findAllConsumables = vi.fn();
const createConsumable = vi.fn();
const deleteConsumable = vi.fn();
const updateConsumable = vi.fn();
const updateConsumableStock = vi.fn();

vi.mock('../../../../../src/services/warehouse/consumables/consumableService.js', () => ({
  createConsumable,
  deleteConsumable,
  findAllConsumables,
  updateConsumable,
  updateConsumableStock
}));

const {
  editConsumable,
  editConsumableStock,
  getAllConsumables,
  registerConsumable,
  removeConsumable
} = await import('../../../../../src/controllers/api/warehouse/consumableController.js');

const createResponse = () => {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
};

describe('consumableController', () => {
  it('delega la consulta y respeta el permiso para leer costos', async () => {
    const result = { data: [], recordsTotal: 0, recordsFiltered: 0 };
    const req = {
      query: { supplierId: 'supplier-1' },
      user: { permissions: ['inventory:costs-read'] }
    };
    const res = createResponse();
    findAllConsumables.mockResolvedValue(result);

    await getAllConsumables(req, res);

    expect(findAllConsumables).toHaveBeenCalledWith(expect.objectContaining({
      supplierId: 'supplier-1',
      canReadCosts: true
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('delega alta, edición, ajuste y retiro al contexto de consumibles', async () => {
    const material = { id: 'material-1' };
    const user = { id: 'user-1', permissions: [] };
    createConsumable.mockResolvedValue(material);
    updateConsumable.mockResolvedValue(material);
    updateConsumableStock.mockResolvedValue(material);
    deleteConsumable.mockResolvedValue(material);

    await registerConsumable({ body: {
      name: 'Guantes',
      supplierId: '00000000-0000-4000-8000-000000000001',
      presentationId: '00000000-0000-4000-8000-000000000002',
      unitMeasureId: '00000000-0000-4000-8000-000000000003'
    }, user }, createResponse());
    await editConsumable({ body: { name: 'Guantes', supplierId: 'supplier-1' }, params: { id: 'material-1' } }, createResponse());
    await editConsumableStock({ body: { supplierId: 'supplier-1', newStock: 5 }, params: { id: 'material-1' }, user }, createResponse());
    await removeConsumable({ params: { id: 'supplier-material-1' } }, createResponse());

    expect(createConsumable).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }));
    expect(updateConsumable).toHaveBeenCalledWith(expect.objectContaining({ name: 'Guantes' }), 'material-1');
    expect(updateConsumableStock).toHaveBeenCalledWith(expect.objectContaining({ id: 'material-1', userId: 'user-1' }));
    expect(deleteConsumable).toHaveBeenCalledWith('supplier-material-1');
  });
});
