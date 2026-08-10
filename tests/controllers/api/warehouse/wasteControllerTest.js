import { beforeEach, describe, expect, it, vi } from 'vitest';

const createWasteWithInitialStockAdjustment = vi.fn();
const findAllWastes = vi.fn();
const updateWaste = vi.fn();
const updateWasteStock = vi.fn();

vi.mock('../../../../src/services/warehouse/wastes/wasteService.js', () => ({
  createWasteWithInitialStockAdjustment,
  findAllWastes,
  updateWaste,
  updateWasteStock
}));

const {
  editWaste,
  editWasteStock,
  getAllWastes,
  registerWaste
} = await import('../../../../src/controllers/api/warehouse/wasteController.js');

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn()
  };
  res.status.mockReturnValue(res);
  return res;
};

describe('wasteController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('obtiene la lista con paginación, búsqueda, proveedor y orden aplicados', async () => {
    const result = { data: [{ id: 'waste-1' }], recordsTotal: 1, recordsFiltered: 1 };
    const req = {
      query: {
        start: '10',
        length: '5',
        search: { value: 'lámina' },
        supplierId: 'supplier-1',
        order: [{ column: '0', dir: 'desc' }]
      }
    };
    const res = createResponse();
    findAllWastes.mockResolvedValue(result);

    await getAllWastes(req, res);

    expect(findAllWastes).toHaveBeenCalledWith({
      skip: 10,
      take: 5,
      search: 'lámina',
      supplierId: 'supplier-1',
      orderBy: 'name',
      orderDir: 'desc'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('crea la merma sin aceptar un motivo inicial enviado por el cliente', async () => {
    const waste = { id: 'waste-1' };
    const req = {
      body: {
        supplierMaterialId: 'supplier-material-1',
        base: '1',
        height: '2',
        newStock: '3',
        reasonId: 'client-reason-id',
        observations: '  Registro inicial  '
      },
      user: { id: 'user-1' }
    };
    const res = createResponse();
    createWasteWithInitialStockAdjustment.mockResolvedValue(waste);

    await registerWaste(req, res);

    expect(createWasteWithInitialStockAdjustment).toHaveBeenCalledWith({
      wasteDto: {
        supplierMaterialId: 'supplier-material-1',
        base: 1,
        height: 2,
        newStock: 3,
        observations: 'Registro inicial'
      },
      userId: 'user-1'
    });
    expect(res.json).toHaveBeenCalledWith({ waste, code: 'CREATED_WASTE' });
  });

  it('edita únicamente los datos generales de la merma', async () => {
    const waste = { id: 'waste-1', minStock: 2, isActive: false };
    const req = {
      params: { id: 'waste-1' },
      body: { minStock: '2', isActive: false, newStock: '99' }
    };
    const res = createResponse();
    updateWaste.mockResolvedValue(waste);

    await editWaste(req, res);

    expect(updateWaste).toHaveBeenCalledWith({
      id: 'waste-1',
      wasteDto: { minStock: 2, isActive: false }
    });
    expect(res.json).toHaveBeenCalledWith({ waste, code: 'UPDATED_WASTE' });
  });

  it('ajusta el stock con motivo, observaciones y usuario', async () => {
    const waste = { id: 'waste-1', currentStock: 4 };
    const req = {
      params: { id: 'waste-1' },
      body: { newStock: '4', reasonId: 'reason-1', observations: '  Conteo físico  ' },
      user: { id: 'user-1' }
    };
    const res = createResponse();
    updateWasteStock.mockResolvedValue(waste);

    await editWasteStock(req, res);

    expect(updateWasteStock).toHaveBeenCalledWith({
      id: 'waste-1',
      wasteStockDto: { newStock: 4, reasonId: 'reason-1', observations: 'Conteo físico' },
      userId: 'user-1'
    });
    expect(res.json).toHaveBeenCalledWith({ waste, code: 'UPDATED_WASTE' });
  });
});
