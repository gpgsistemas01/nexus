import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  bindDisabledSelectDependency: vi.fn()
}));

vi.mock('../../../../../../../../src/public/js/plugins/select2/baseSelect.js', () => mocks);

const { bindTableFilterDependencies } = await import(
  '../../../../../../../../src/public/js/plugins/datatable/core/filters/tableFilterDependencies.js'
);

describe('dependencias de filtros CRUD de movimientos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['materialId', 'Seleccione un proveedor antes de filtrar por material.'],
    ['wasteId', 'Seleccione un proveedor antes de filtrar por merma.']
  ])('reutiliza el bloqueo Select2 para %s dependiente del proveedor', (key, disabledMessage) => {
    bindTableFilterDependencies([{
      key,
      selector: '#materialFilter',
      dependsOn: 'supplierId'
    }]);

    expect(mocks.bindDisabledSelectDependency).toHaveBeenCalledOnce();
    expect(mocks.bindDisabledSelectDependency).toHaveBeenCalledWith({
      sourceSelector: '#supplierFilter',
      targetSelector: '#materialFilter',
      clearTarget: expect.any(Function),
      disabledMessage
    });
  });

  it('no configura bloqueos para filtros sin una dependencia declarada', () => {
    bindTableFilterDependencies([{
      key: 'wasteId',
      selector: '#materialFilter'
    }]);

    expect(mocks.bindDisabledSelectDependency).not.toHaveBeenCalled();
  });
});
