import { beforeEach, describe, expect, it, vi } from 'vitest';

const requests = vi.hoisted(() => ({
  fulfillmentStatuses: vi.fn(),
  presentations: vi.fn(),
  reasons: vi.fn(),
  unitMeasures: vi.fn()
}));

vi.mock('../../../../../../../src/public/js/services/warehouse/fulfillmentStatusService.js', () => ({
  getAllFulfillmentStatusesRequest: requests.fulfillmentStatuses
}));
vi.mock('../../../../../../../src/public/js/services/warehouse/presentationService.js', () => ({
  getAllPresentationsRequest: requests.presentations
}));
vi.mock('../../../../../../../src/public/js/services/warehouse/reasonService.js', () => ({
  getAllReasonsRequest: requests.reasons
}));
vi.mock('../../../../../../../src/public/js/services/warehouse/unitMeasureService.js', () => ({
  getAllUnitMeasuresRequest: requests.unitMeasures
}));

const { getAllFulfillmentStatuses, getFulfillmentStatusOptions } = await import(
  '../../../../../../../src/public/js/application/warehouse/catalogs/fulfillmentStatuses.js'
);
const { getAllPresentations } = await import(
  '../../../../../../../src/public/js/application/warehouse/catalogs/presentations.js'
);
const { getAllReasons } = await import(
  '../../../../../../../src/public/js/application/warehouse/catalogs/reasons.js'
);
const { getAllUnitMeasures } = await import(
  '../../../../../../../src/public/js/application/warehouse/catalogs/unitMeasures.js'
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('lectura de catálogos de almacén en la capa de aplicación', () => {
  it.each([
    ['presentaciones', getAllPresentations, requests.presentations],
    ['motivos', getAllReasons, requests.reasons],
    ['unidades de medida', getAllUnitMeasures, requests.unitMeasures]
  ])('conserva el contrato de listado de %s', async (_catalog, getAll, request) => {
    const response = { data: { data: [{ id: 'catalog-1' }] } };
    request.mockResolvedValue(response);

    await expect(getAll({ search: 'acero' })).resolves.toBe(response);
    expect(request).toHaveBeenCalledWith({ params: { search: 'acero' } });
  });

  it('conserva la respuesta paginada del catálogo de estados de surtimiento', async () => {
    const response = {
      data: {
        data: [{ id: 'status-1', name: 'Pendiente' }],
        recordsFiltered: 4,
        recordsTotal: 4
      }
    };
    requests.fulfillmentStatuses.mockResolvedValue(response);

    await expect(getAllFulfillmentStatuses({ start: 0, length: 1 })).resolves.toBe(response);
    expect(requests.fulfillmentStatuses).toHaveBeenCalledWith({ params: { start: 0, length: 1 } });
  });

  it('adapta estados válidos a opciones y descarta registros incompletos', async () => {
    requests.fulfillmentStatuses.mockResolvedValue({
      data: {
        data: [
          { id: 'status-1', name: 'Pendiente' },
          { id: 'status-2' },
          null
        ]
      }
    });

    await expect(getFulfillmentStatusOptions({ active: true })).resolves.toEqual([
      { value: 'status-1', label: 'Pendiente' }
    ]);
    expect(requests.fulfillmentStatuses).toHaveBeenCalledWith({ params: { active: true } });
  });

  it('resuelve una lista vacía cuando el transporte no entrega una respuesta', async () => {
    requests.fulfillmentStatuses.mockResolvedValue(undefined);

    await expect(getFulfillmentStatusOptions()).resolves.toEqual([]);
  });
});
