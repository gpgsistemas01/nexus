import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../../../../src/public/js/application/warehouse/fulfillmentStatuses/fulfillmentStatuses.js', () => ({
  getFulfillmentStatusOptions: vi.fn()
}));
vi.mock('../../../../../../../../src/public/js/application/admin/persons/persons.js', () => ({
  getPersonOptions: vi.fn()
}));
vi.mock('../../../../../../../../src/public/js/plugins/select2/domains/material.js', () => ({ initMaterialFilterSelect: vi.fn() }));
vi.mock('../../../../../../../../src/public/js/plugins/select2/domains/supplier.js', () => ({ initSupplierFilterSelect: vi.fn() }));
vi.mock('../../../../../../../../src/public/js/plugins/select2/domains/fulfillmentStatus.js', () => ({ initFulfillmentStatusFilterSelect: vi.fn() }));
vi.mock('../../../../../../../../src/public/js/plugins/select2/domains/client.js', () => ({ initClientFilterSelect: vi.fn() }));
vi.mock('../../../../../../../../src/public/js/plugins/select2/domains/department.js', () => ({ initDepartmentFilterSelect: vi.fn() }));
vi.mock('../../../../../../../../src/public/js/plugins/select2/domains/role.js', () => ({ initRoleFilterSelect: vi.fn() }));
vi.mock('../../../../../../../../src/public/js/plugins/select2/domains/person.js', () => ({ initPersonFilterSelect: vi.fn() }));
vi.mock('../../../../../../../../src/public/js/plugins/select2/domains/movementType.js', () => ({
  getMovementTypeData: vi.fn(),
  initMovementTypeFilterSelect: vi.fn()
}));

const { buildTableFilterConfigs } = await import('../../../../../../../../src/public/js/plugins/datatable/core/filters/tableFilterConfigs.js');

describe('configuración de opciones en filtros CRUD', () => {
  it.each(['supplier', 'material'])('delega el mapeo remoto de %s al componente Select2', (field) => {
    const [config] = buildTableFilterConfigs({ fields: [field] });

    expect(config).not.toHaveProperty('getOptions');
    expect(config.initSelect).toEqual(expect.any(Function));
  });

  it('conserva la precarga cuando el filtro necesita resolver un valor predeterminado', () => {
    const [config] = buildTableFilterConfigs({ fields: ['fulfillmentStatus'] });

    expect(config.getOptions).toEqual(expect.any(Function));
    expect(config.defaultSelectedLabel).toBe('Pendiente');
  });
});
