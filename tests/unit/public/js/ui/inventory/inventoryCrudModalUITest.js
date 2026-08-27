import { beforeEach, describe, expect, it, vi } from 'vitest';

const formStateMocks = vi.hoisted(() => ({
  initForm: vi.fn(),
  setFormDisabled: vi.fn()
}));
const clearFormErrors = vi.hoisted(() => vi.fn());

vi.mock('../../../../../../src/public/js/ui/forms/formStateUI.js', () => formStateMocks);
vi.mock('../../../../../../src/public/js/ui/forms/formErrorsUI.js', () => ({ clearFormErrors }));

const { initializeInventoryCrudModal } = await import(
  '../../../../../../src/public/js/ui/inventory/inventoryCrudModalUI.js'
);

describe('inicialización reutilizada por los CRUD de inventario', () => {
  beforeEach(() => vi.clearAllMocks());

  it('inicializa modo e identidad, limpia errores y habilita el formulario por defecto', () => {
    const form = { id: 'inventoryForm' };
    const data = { id: 'inventory-1' };

    initializeInventoryCrudModal({ form, mode: 'edit', data });

    expect(formStateMocks.initForm).toHaveBeenCalledWith({
      form,
      mode: 'edit',
      id: 'inventory-1'
    });
    expect(clearFormErrors).toHaveBeenCalledWith(form);
    expect(formStateMocks.setFormDisabled).toHaveBeenCalledWith({ form, isDisabled: false });
  });

  it('vacía la identidad al crear y conserva el bloqueo solicitado por el CRUD', () => {
    const form = { id: 'inventoryForm' };

    initializeInventoryCrudModal({ form, mode: 'create', isDisabled: true });

    expect(formStateMocks.initForm).toHaveBeenCalledWith({ form, mode: 'create', id: '' });
    expect(formStateMocks.setFormDisabled).toHaveBeenCalledWith({ form, isDisabled: true });
  });
});
