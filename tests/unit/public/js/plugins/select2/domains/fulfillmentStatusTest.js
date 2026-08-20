import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAll: vi.fn(),
  initFilter: vi.fn()
}));

vi.mock('../../../../../../../src/public/js/application/warehouse/catalogs/fulfillmentStatuses.js', () => ({
  getAllFulfillmentStatuses: mocks.getAll
}));
vi.mock('../../../../../../../src/public/js/plugins/select2/baseSelect.js', () => ({
  initFilterSelect2: mocks.initFilter
}));

const { initFulfillmentStatusFilterSelect } = await import(
  '../../../../../../../src/public/js/plugins/select2/domains/fulfillmentStatus.js'
);

describe('filtro paginado de estados de surtimiento', () => {
  it('reutiliza el listado paginado y adapta cada registro en Select2', () => {
    initFulfillmentStatusFilterSelect({ selectedId: 'status-1' });

    expect(mocks.initFilter).toHaveBeenCalledWith(expect.objectContaining({
      getOptions: mocks.getAll,
      selectedId: 'status-1'
    }));

    const [{ mapOption }] = mocks.initFilter.mock.calls[0];
    expect(mapOption({ id: 'status-2', name: 'Surtido parcial' })).toEqual({
      id: 'status-2',
      text: 'Surtido parcial'
    });
  });
});
