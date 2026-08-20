import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  user: {
    editUserPasswordRequest: vi.fn(),
    editUserRequest: vi.fn(),
    getAllUsersRequest: vi.fn(),
    registerUserRequest: vi.fn()
  },
  waste: {
    editWasteRequest: vi.fn(),
    editWasteStockRequest: vi.fn(),
    getAllWastesRequest: vi.fn(),
    registerWasteRequest: vi.fn()
  },
  goodsReceipt: {
    editGoodsReceiptHeaderRequest: vi.fn(),
    getAllGoodsReceiptsRequest: vi.fn(),
    registerGoodsReceiptRequest: vi.fn(),
    correctGoodsReceiptDetailRequest: vi.fn(),
    cancelGoodsReceiptDetailRequest: vi.fn()
  }
}));

vi.mock('../../../../../src/public/js/services/admin/userService.js', () => mocks.user);
vi.mock('../../../../../src/public/js/services/warehouse/wasteService.js', () => mocks.waste);
vi.mock('../../../../../src/public/js/services/warehouse/goodsReceiptService.js', () => mocks.goodsReceipt);

const users = await import('../../../../../src/public/js/application/admin/users/users.js');
const wastes = await import('../../../../../src/public/js/application/warehouse/wastes/wastes.js');
const goodsReceipts = await import('../../../../../src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js');

beforeEach(() => {
  vi.clearAllMocks();
  Object.values(mocks).flatMap(Object.values)
    .forEach(mock => mock.mockResolvedValue({ data: { code: 'OK' } }));
});

describe('consistencia del CRUD entre contextos de aplicación', () => {
  it.each([
    ['usuarios', users, ['editUser', 'editUserPassword', 'getAllUsers', 'registerUser']],
    ['mermas', wastes, ['editWaste', 'editWasteStock', 'getAllWastes', 'registerWaste']],
    [
      'entradas de compra',
      goodsReceipts,
      [
        'cancelGoodsReceiptDetail',
        'correctGoodsReceiptDetail',
        'editGoodsReceiptHeader',
        'getAllGoodsReceipts',
        'registerGoodsReceipt'
      ]
    ]
  ])('expone operaciones de dominio y no el objeto CRUD genérico en %s', (_context, application, exports) => {
    expect(Object.keys(application).sort()).toEqual(exports);
    expect(application).not.toHaveProperty('application');
    expect(application).not.toHaveProperty('getAll');
    expect(application).not.toHaveProperty('register');
    expect(application).not.toHaveProperty('edit');
  });

  it.each([
    ['usuarios', users.getAllUsers, mocks.user.getAllUsersRequest],
    ['mermas', wastes.getAllWastes, mocks.waste.getAllWastesRequest],
    ['entradas de compra', goodsReceipts.getAllGoodsReceipts, mocks.goodsReceipt.getAllGoodsReceiptsRequest]
  ])('mantiene el contrato de listado en %s', async (_context, getAll, request) => {
    const response = { data: { data: [] } };
    request.mockResolvedValue(response);

    await expect(getAll({ page: 2 })).resolves.toBe(response);
    expect(request).toHaveBeenCalledWith({ params: { page: 2 } });
  });

  it.each([
    ['usuarios', users.registerUser, mocks.user.registerUserRequest, 'user'],
    ['mermas', wastes.registerWaste, mocks.waste.registerWasteRequest, 'waste'],
    ['entradas de compra', goodsReceipts.registerGoodsReceipt, mocks.goodsReceipt.registerGoodsReceiptRequest, null]
  ])('mantiene el contrato de registro en %s', async (_context, register, request, dataKey) => {
    const resource = { id: 'resource-1' };
    request.mockResolvedValue({
      data: { code: 'OK', ...(dataKey ? { [dataKey]: resource } : {}) }
    });

    const result = await register({ formData: { name: 'Nuevo' } });

    expect(request).toHaveBeenCalledWith({ data: { name: 'Nuevo' } });
    expect(result).toEqual({
      message: expect.any(String),
      ...(dataKey ? { data: resource } : {})
    });
  });

  it('mantiene las mutaciones adicionales de cada contexto', async () => {
    mocks.goodsReceipt.correctGoodsReceiptDetailRequest.mockResolvedValue({
      data: { code: 'OK', correction: { id: 'correction-1' } }
    });

    await users.editUserPassword({ formData: { password: 'new-password' }, id: 'user-1' });
    await wastes.editWasteStock({ formData: { newStock: 4 }, id: 'waste-1' });
    const correction = await goodsReceipts.correctGoodsReceiptDetail({
      formData: { quantity: 3 },
      id: 'receipt-1',
      detailId: 'detail-1'
    });
    await goodsReceipts.cancelGoodsReceiptDetail({ id: 'receipt-1', detailId: 'detail-2' });

    expect(mocks.user.editUserPasswordRequest).toHaveBeenCalledWith({
      data: { password: 'new-password' }, id: 'user-1'
    });
    expect(mocks.waste.editWasteStockRequest).toHaveBeenCalledWith({
      data: { newStock: 4 }, id: 'waste-1'
    });
    expect(mocks.goodsReceipt.correctGoodsReceiptDetailRequest).toHaveBeenCalledWith({
      data: { quantity: 3 }, id: 'receipt-1', detailId: 'detail-1'
    });
    expect(mocks.goodsReceipt.cancelGoodsReceiptDetailRequest).toHaveBeenCalledWith({
      id: 'receipt-1', detailId: 'detail-2'
    });
    expect(correction.data).toEqual({ id: 'correction-1' });
  });
});
