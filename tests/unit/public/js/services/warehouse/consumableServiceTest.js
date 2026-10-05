import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();

vi.mock('../../../../../../src/public/js/services/axiosInstanceApi.js', () => ({ apiRequest }));

const {
  CONSUMABLES_API_ROUTE,
  deleteConsumableRequest,
  editConsumableRequest,
  editConsumableStockRequest,
  getAllConsumablesRequest,
  registerConsumableRequest
} = await import('../../../../../../src/public/js/services/warehouse/consumableService.js');

describe('consumableService frontend', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consulta y registra sobre el índice del recurso consumibles', async () => {
    await getAllConsumablesRequest({ params: { search: 'guantes' } });
    await registerConsumableRequest({ data: { name: 'Guantes' } });

    expect(CONSUMABLES_API_ROUTE).toBe('/api/warehouse/consumables');
    expect(apiRequest).toHaveBeenNthCalledWith(1, {
      method: 'get',
      url: '/api/warehouse/consumables',
      params: { search: 'guantes' }
    });
    expect(apiRequest).toHaveBeenNthCalledWith(2, {
      method: 'post',
      url: '/api/warehouse/consumables',
      data: { name: 'Guantes' }
    });
  });

  it('genera las rutas con id para actualizar, ajustar y eliminar', async () => {
    await editConsumableRequest({ id: 'consumable-1', data: { name: 'Guantes' } });
    await editConsumableStockRequest({ id: 'consumable-1', data: { newStock: 5 } });
    await deleteConsumableRequest({ id: 'supplier-consumable-1' });

    expect(apiRequest).toHaveBeenNthCalledWith(1, {
      method: 'patch',
      url: '/api/warehouse/consumables/consumable-1',
      data: { name: 'Guantes' }
    });
    expect(apiRequest).toHaveBeenNthCalledWith(2, {
      method: 'patch',
      url: '/api/warehouse/consumables/consumable-1/stock',
      data: { newStock: 5 }
    });
    expect(apiRequest).toHaveBeenNthCalledWith(3, {
      method: 'delete',
      url: '/api/warehouse/consumables/supplier-consumable-1'
    });
  });
});
